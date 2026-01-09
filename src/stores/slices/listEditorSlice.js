export function createListEditorSlice(setScoped, getScoped, rootSet, rootGet) {
  const set = setScoped;
  return {
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

    resetListEditor() {
      return {
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
      };
    },

    setupListEditor(list) {
      set((state) => {
        state.listId = list?.id ?? null;
        state.title = list?.title ?? "";
        state.isSubmitting = false;
      });
    },

    changeListEditorTitle(title) {
      set((state) => {
        state.title = title;
        state.isChanged = true;
      });
    },

    createOrUpdateListRequest() {
      set((state) => {
        state.isSubmitting = true;
        state.isChanged = false;
      });
    },

    createOrUpdateListFail() {
      set((state) => {
        state.isSubmitting = false;
      });
    },

    createOrUpdateListSuccess(list) {
      set((state) => {
        state.listId = list.id;
        state.isSubmitting = false;
      });
    },

    fetchListAccountsRequest() {
      set((state) => {
        state.accounts.isLoading = true;
      });
    },

    fetchListAccountsFail() {
      set((state) => {
        state.accounts.isLoading = false;
      });
    },

    fetchListAccountsSuccess(accounts) {
      set((state) => {
        state.accounts.items = Array.isArray(accounts)
          ? accounts.map((item) => item.id)
          : [];
        state.accounts.loaded = true;
        state.accounts.isLoading = false;
      });
    },

    listEditorSuggestionsChange(value) {
      set((state) => {
        state.suggestions.value = value;
      });
    },

    listEditorSuggestionsReady(accounts) {
      set((state) => {
        state.suggestions.items = accounts.map((item) => item.id);
      });
    },

    listEditorSuggestionsClear() {
      set((state) => {
        state.suggestions.value = "";
        state.suggestions.items = [];
      });
    },

    listEditorAddSuccess(accountId) {
      set((state) => {
        if (!state.accounts.items.includes(accountId)) {
          state.accounts.items.unshift(accountId);
        }
      });
    },

    listEditorRemoveSuccess(accountId) {
      set((state) => {
        state.accounts.items = state.accounts.items.filter(
          (id) => id !== accountId,
        );
      });
    },
  };
}

export default createListEditorSlice;
