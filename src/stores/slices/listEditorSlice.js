const getInitialState = () => ({
  listId: null,
  isSubmitting: false,
  isChanged: false,
  title: "",
  accounts: {
    items: [],
    loaded: false,
    isLoading: false,
  },
  suggestions: {
    value: "",
    items: [],
  },
});

export function createListEditorSlice(setScoped, getScoped, rootSet, rootGet) {

  return {
     ...getInitialState(),

    resetListEditor() {
      setScoped((state) => {
        const fresh = getInitialState();
        Object.assign(state, fresh);
      });
    },

    setupListEditor(list) {
      setScoped((state) => {
        state.listId = list?.id ?? null;
        state.title = list?.title ?? "";
        state.isSubmitting = false;
        state.isChanged = false;
        // Reset dynamic lists on setup
        state.accounts = getInitialState().accounts;
        state.suggestions = getInitialState().suggestions;
      });
    },

    changeListEditorTitle(title) {
      setScoped((state) => {
        state.title = title;
        state.isChanged = true;
      });
    },

    createOrUpdateListRequest() {
      setScoped((state) => {
        state.isSubmitting = true;
        state.isChanged = false;
      });
    },


    createOrUpdateListFail() {
      setScoped((state) => {
        state.isSubmitting = false;
      });
    },

    createOrUpdateListSuccess(list) {
      setScoped((state) => {
        state.listId = list.id;
        state.title = list.title;
        state.isSubmitting = false;
      });
    },

    fetchListAccountsRequest() {
      setScoped((state) => {
        state.accounts.isLoading = true;
      });
    },

    fetchListAccountsFail() {
      setScoped((state) => {
        state.accounts.isLoading = false;
      });
    },

    fetchListAccountsSuccess(accounts) {
      setScoped((state) => {
        // Standard JS map for account IDs
        state.accounts.items = (Array.isArray(accounts) ? accounts : [])
          .map((item) => item.id)
          .filter(Boolean);
        state.accounts.loaded = true;
        state.accounts.isLoading = false;
      });
    },

    listEditorSuggestionsChange(value) {
      setScoped((state) => {
        state.suggestions.value = value;
      });
    },

    listEditorSuggestionsReady(accounts) {
      setScoped((state) => {
        state.suggestions.items = (Array.isArray(accounts) ? accounts : [])
          .map((item) => item.id);
      });
    },

    listEditorSuggestionsClear() {
      setScoped((state) => {
        state.suggestions.value = "";
        state.suggestions.items = [];
      });
    },

    listEditorAddSuccess(accountId) {
      if (!accountId) return;
      setScoped((state) => {
        if (!state.accounts.items.includes(accountId)) {
          state.accounts.items.unshift(accountId);
        }
      });
    },

    listEditorRemoveSuccess(accountId) {
      if (!accountId) return;
      setScoped((state) => {
        state.accounts.items = state.accounts.items.filter((id) => id !== accountId);
      });
    },
  };
}

export default createListEditorSlice;
