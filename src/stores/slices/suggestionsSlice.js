import { isLoggedIn } from "../../utils/auth.js";

const accountToSuggestion = (account) => ({
  source: "past_interactions",
  account: account.id,
});

export function createSuggestionsSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();

  return {
    // --- Initial State ---
    items: new Set(),
    next: null,
    isLoading: false,

    fetchSuggestionsRequest() {
      setScoped((state) => { state.isLoading = true; });
    },

    fetchSuggestionsSuccess(accounts) {
      setScoped((state) => {
        accounts.map(accountToSuggestion).forEach((suggestion) => {
          if (suggestion?.account) state.items.add(suggestion);
        });
        state.isLoading = false;
      });
    },

    fetchSuggestionsV2Success(suggestions, next) {
      setScoped((state) => {
        suggestions.forEach((x) => {
          state.items.add({ ...x, account: x.account.id });
        });
        state.next = next;
        state.isLoading = false;
      });
    },

    fetchSuggestionsFail() {
      setScoped((state) => { state.isLoading = false; });
    },

    dismissSuggestion(id) {
      setScoped((state) => {
        for (const item of state.items) {
          if (item.account === id) state.items.delete(item);
        }
      });
    },

    blockOrMuteAccountSuccess(relationship) {
      const actions = getActions();
     actions.dismissSuggestion(relationship.id);
    },

    domainBlockSuccess(accounts) {
      const actions = getActions();
      accounts.forEach((acc) =>actions.dismissSuggestion(acc.id));
    },

    async fetchSuggestions(params) {
      const actions = getActions();
     actions.fetchSuggestionsRequest();

      const query = params ? `?${new URLSearchParams(params)}` : "";

      try {
        const res = await fetch(`/api/v2/suggestions${query}`);
        if (!res.ok) throw new Error(`Failed to fetch suggestions (${res.status})`);
        
        const data = await res.json();
        const suggestions = data?.suggestions || [];
        const accounts = suggestions.map(({ account }) => account);

        actions.importFetchedAccounts?.(accounts);
        actions.fetchSuggestionsV2Success(suggestions, data?.next);
      } catch (err) {
        actions.fetchSuggestionsFail();
        console.error("suggestionsSlice.fetchSuggestions failed", err);
      }
    },

    fetchSuggestionsForTimeline() {
      const actions = getActions();
      actions.timelines?.insertSuggestionsIntoTimeline?.();
    },

    async dismissSuggestionAction(accountId) {
      const actions = getActions();
      if (!isLoggedIn(actions)) return;
      
     actions.dismissSuggestion(accountId);

      try {
        await fetch(`/api/v1/suggestions/${accountId}`, { method: "DELETE" });
      } catch (err) {
        console.error("dismissSuggestion failed", err);
      }
    }
  }
}

export default createSuggestionsSlice;
