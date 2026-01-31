import { isLoggedIn } from "../../utils/auth";
import { getFeatures } from "../../utils/features";

const initialState = {
  aliases: {
    items: [],
    loaded: false,
  },
  suggestions: {
    items: [],
    value: "",
    loaded: false,
  },
};

export function createAliasesSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();
  return {
    ...initialState,

    fetchAliasesSuccess(value) {
      setScoped((state) => {
        state.aliases.items = value || [];
      });
    },

    suggestionsAliasesChange(value) {
      setScoped((state) => {
        state.suggestions.value = value || "";
        state.suggestions.loaded = false;
      });
    },

    suggestionsAliasesReady(accounts) {
      setScoped((state) => {
        state.suggestions.items = accounts.map((item) => item.id);
        state.suggestions.loaded = true;
      });
    },

    suggestionaAliasesClear() {
      setScoped((state) => {
        state.suggestions.items = [];
        state.suggestions.value = "";
        state.suggestions.loaded = false;
      });
    },

    fetchAliases() {
      const state = rootGet();
      if (!isLoggedIn(state)) return;

      const features = getFeatures();

      if (!features.accountMoving) return;

      fetch(`/api/v1/aliases`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.auth.app?.access_token}`,
        },
      })  
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        this.fetchAliasesSuccess(data || []);
      })
      .catch((error) => {
        console.error("Error fetching aliases:", error);
      });   
    },

    fetchAliasesSuggestions(q) {
      const state = rootGet();
      const actions = getActions();
      if (!isLoggedIn(state)) return;

      const fetchUrl = '/api/v1/accounts/search?' + new URLSearchParams(params);

      const params = {
        q,
          resolve: true,
          limit: 4,
        };

      fetch(fetchUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.auth.app?.access_token}`,
        },
      })  
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        actions.importFetchedAccounts(data.map(({ account }) => account));
        this.suggestionsAliasesReady(q, data);
      })
      .catch((error) => {
        //TODO: add toast later
        console.error("Error fetching alias suggestions:", error);
      }); 
    },

    addToAliases(account) {
      const actions = getActions();
      if (!isLoggedIn(rootGet())) return;

      const features = getFeatures();

      if (!features.accountMoving) {
        const me = rootGet().auth.me;
        const alsoKnownAs = rootGet().accountsMeta[me]?.kollective?.also_known_as || [];

        fetch('/api/v1/accounts/update_credentials', {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${rootGet().auth.app?.access_token}`,
          },
          body: JSON.stringify({
            pleroma: {
              also_known_as: [...alsoKnownAs, account.kollective?.ap_id],
            },
          }),
        })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          //TODO: add toast later
           actions.patchMeSuccess(data);
        })
        .catch((error) => {
          console.error("Error adding to aliases:", error);
        });
        return;
      }

      fetch(`/api/v1/aliases`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${rootGet().auth.app?.access_token}`,
        },
        body: JSON.stringify({    
          alias: account.acct,
        }),
      })  
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        //TODO : add toast later
        this.fetchAliases();
      })
      .catch((error) => {
        console.error("Error adding to aliases:", error);
      });       
    },

    removeFromAliases(account) {
      const actions = getActions();
      if (!isLoggedIn(rootGet())) return;

      const features = getFeatures();

      if (!features.accountMoving) {
        const me = rootGet().auth.me;
        const alsoKnownAs = rootGet().accountsMeta[me]?.kollective?.also_known_as || [];

        fetch('/api/v1/accounts/update_credentials', {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${rootGet().auth.app?.access_token}`,
          },
          body: JSON.stringify({
            pleroma: {
              also_known_as: alsoKnownAs.filter((id) => id !== account) 
            },
          }),
        })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        }).
        then((data) => {
          //TODO: add toast later
           actions.patchMeSuccess(data);
        })
        .catch((error) => {
          console.error("Error removing from aliases:", error);
        });
        return;
      }

      fetch(`/api/v1/aliases`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${root.auth.app?.access_token}`,
        },
        body: JSON.stringify({    
          alias: account.acct,
        }),
      })  
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        //TODO : add toast later
        this.fetchAliases();
      })
      .catch((error) => {
        console.error("Error removing from aliases:", error);
      });       
    },
 };
}

export default createAliasesSlice;
