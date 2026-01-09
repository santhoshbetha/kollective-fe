export function createListAdderSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    accountId: null,
    lists: {
      items: [],
      loaded: false,
      isLoading: false,
    },

    // Reset the list adder UI/state
    resetListadder() {
      setScoped((state) => {
        state.accountId = null;
        state.lists = {
          items: [],
          loaded: false,
          isLoading: false,
        };
      });
    },

    // Prepare the adder for a given account (accept account object or id)
    setupListAdder(account) {
      const id = account && (account.id ?? account);
      setScoped((state) => {
        state.accountId = id ?? null;
      });
    },

    fetchListAdderListsRequest() {
      setScoped((state) => {
        state.lists = state.lists || {
          items: [],
          loaded: false,
          isLoading: false,
        };
        state.lists.isLoading = true;
      });
    },

    fetchListAdderListsFail() {
      setScoped((state) => {
        state.lists = state.lists || {
          items: [],
          loaded: false,
          isLoading: false,
        };
        state.lists.isLoading = false;
      });
    },

    fetchListAdderListsSuccess(lists) {
      setScoped((state) => {
        const src = Array.isArray(lists) ? lists : [];
        state.lists = state.lists || {
          items: [],
          loaded: false,
          isLoading: false,
        };
        state.lists.items = src.map((item) => {
          if (item == null) return item;
          if (typeof item === "string" || typeof item === "number")
            return String(item);
          return item.id ?? item;
        });
        state.lists.loaded = true;
        state.lists.isLoading = false;
      });
    },

    addListEditorSuccess(listId) {
      setScoped((state) => {
        state.lists = state.lists || { items: [] };
        if (!state.lists.items.includes(listId)) {
          state.lists.items.unshift(listId);
        }
      });
    },

    removeListEditorSuccess(listId) {
      setScoped((state) => {
        state.lists = state.lists || { items: [] };
        state.lists.items = state.lists.items.filter((id) => id !== listId);
      });
    },
  };
}

export default createListAdderSlice;
