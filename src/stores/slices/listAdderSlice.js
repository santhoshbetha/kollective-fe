const getInitialState = () => ({
  accountId: null,
  lists: {
    items: [],
    loaded: false,
    isLoading: false,
  },
});

export function createListAdderSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    ...getInitialState(),

   // Reset the list adder UI/state
    resetListadder() {
      setScoped((state) => {
        const fresh = getInitialState();
        state.accountId = fresh.accountId;
        state.lists = fresh.lists;
      });
    },

    // Prepare the adder for a given account (accept account object or id)
    setupListAdder(account) {
      const id = account?.id ?? account ?? null;
      setScoped((state) => {
        state.accountId = id;
      });
    },

    fetchListAdderListsRequest() {
      setScoped((state) => {
        state.lists.isLoading = true;
      });
    },

    fetchListAdderListsFail() {
      setScoped((state) => {
        state.lists.isLoading = false;
      });
    },

    fetchListAdderListsSuccess(lists) {
      setScoped((state) => {
        const incoming = Array.isArray(lists) ? lists : [];
        
        // Map to IDs and ensure string type for consistent lookup
        state.lists.items = incoming.map((item) => {
          if (item == null) return null;
          const id = item.id ?? item;
          return String(id);
        }).filter(Boolean);

        state.lists.loaded = true;
        state.lists.isLoading = false;
      });
    },

    addListEditorSuccess(listId) {
      if (!listId) return;
      const id = String(listId);

      setScoped((state) => {
        // Unshift if not already present (OrderedSet-like behavior)
        if (!state.lists.items.includes(id)) {
          state.lists.items.unshift(id);
        }
      });
    },

    removeListEditorSuccess(listId) {
      if (!listId) return;
      const id = String(listId);

      setScoped((state) => {
        state.lists.items = state.lists.items.filter((existingId) => existingId !== id);
      });
    },
  };
}

export default createListAdderSlice;
