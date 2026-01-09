import { isLoggedIn } from "../../utils/auth.js";

const SuggestionRecord = {
  source: "",
  account: "",
};

// Convert a v1 account into a v2 suggestion
const accountToSuggestion = (account) => {
  return {
    source: "past_interactions",
    account: account.id,
  };
};

export function createSuggestionsSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    items: new Set(),
    next: null,
    isLoading: false,

    fetchSuggestionsRequest() {
      setScoped((state) => {
        state.isLoading = true;
      });
    },

    fetchSuggestionsSuccess(accounts) {
      setScoped((state) => {
        const newItems = new Set(state.items || []);
        accounts.map(accountToSuggestion).forEach((suggestion) => {
          if (suggestion && suggestion.account) newItems.add(suggestion);
        });
        state.items = newItems;
        state.isLoading = false;
      });
    },

    fetchSuggestionsV2Success(suggestions, next) {
      setScoped((state) => {
        const newItems = new Set(state.items || []);
        suggestions
          .map((x) => ({ ...x, account: x.account.id }))
          .forEach((suggestion) => {
            newItems.add(suggestion);
          });
        state.items = newItems;
        state.next = next;
        state.isLoading = false;
      });
    },

    fetchSuggestionsFail() {
      setScoped((state) => {
        state.isLoading = false;
      });
    },

    dismissSuggestion(id) {
      setScoped((state) => {
        const newItems = new Set(state.items || []);
        newItems.forEach((suggestion) => {
          if (suggestion.account === id) {
            newItems.delete(suggestion);
          }
        });
        state.items = newItems;
      });
    },

    blockOrMuteAccountSuccess(relationship) {
      setScoped((state) => {
        const newItems = new Set(state.items || []);
        newItems.forEach((suggestion) => {
          if (suggestion.account === relationship.id) {
            newItems.delete(suggestion);
          }
        });
        state.items = newItems;
      });
    },

    domainBlockSuccess(accounts) {
      setScoped((state) => {
        const newItems = new Set(state.items || []);
        accounts.forEach((account) => {
          newItems.forEach((suggestion) => {
            if (suggestion.account === account.id) {
              newItems.delete(suggestion);
            }
          });
        });
        state.items = newItems;
      });
    },

    async fetchSuggestions(params) {
      const root = rootGet();

      this.fetchSuggestionsRequest();

      try {
        const res = await fetch(
            `/api/v2/suggestions${params ? `?${new URLSearchParams(params).toString()}` : ""}`,
          { method: "GET" },
        ) ;
        if (!res.ok) throw new Error(`Failed to fetch suggestions (${res.status})`);
        const data = await res.json();
        const accounts = data?.suggestions?.map(({ account }) => account) || [];
        const next = data?.next || null;
        root.importer?.importFetchedAccounts?.(accounts);
        this.fetchSuggestionsV2Success(data?.suggestions || [], next);
      } catch (err) {
        this.fetchSuggestionsFail();
        console.error("suggestionsSlice.fetchSuggestions failed", err);
      }
    },

    fetchSuggestionsForTimeline() {
      const root = rootGet();
      root.timelines.insertSuggestionsIntoTimeline();
    },

    dismissSuggestionAction(accountId) {
      const root = rootGet();
      if (!isLoggedIn(root)) return;
      
      this.dismissSuggestion(accountId);

      try {
        fetch(`/api/v1/suggestions/${accountId}`, { method: "DELETE" });
      } catch (err) {
        console.error("dismissSuggestion failed", err);
      }
    }
  }
}

export default createSuggestionsSlice;
