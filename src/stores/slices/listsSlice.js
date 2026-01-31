import normalizeList from "../../normalizers/list.js";
import { selectAccount } from "../../selectors/index.js";
import { isLoggedIn } from "../../utils/auth.js";

// Lists slice: stores normalized lists records and a current pointer.
export const createListsSlice = (
  setScoped,
  getScoped,
  rootSet,
  rootGet,
) => {
  const getActions = () => rootGet();

  const updateRecords = (data) => {
    const items = Array.isArray(data) ? data : [data];
    setScoped((state) => {
      // Direct mutation thanks to Immer middleware
      items.forEach((item) => {
        state[item.id] = normalizeList(item);
      });
    });
  };
  return {

        // --- State Setters (Immer-enabled) ---
    fetchListSuccess: updateRecords,
    createListSuccess: updateRecords,
    updateListSuccess: updateRecords,
    fetchListsSuccess: updateRecords,

    deleteListSuccess(id) {
      setScoped((state) => {
        state[id] = false;
      });
    },

    setListFailed: (id) => setScoped((state) => { 
      state[id] = false; // Simple direct mutation
    }),

    async fetchList(id) {
      const actions = getActions();
      const stringId = String(id);

      if (!isLoggedIn(rootGet())) return null;
      if (rootGet().lists[stringId]) return;

      try {
        const res = await fetch(`/api/v1/lists/${stringId}`);
        if (!res.ok) throw new Error('Failed to fetch list');

        const list = await res.json();
        actions.fetchListSuccess(list);
      } catch (e) {
        actions.setListFailed(stringId);
      }
    },

    async fetchLists() {
      const actions = getActions();
      if (!isLoggedIn(rootGet())) return null;

      try {
        const res = await fetch(`/api/v1/lists`);
        if (!res.ok) throw new Error("Failed to fetch lists");
        
        const lists = await res.json();
        actions.fetchListsSuccess(lists);
      } catch (e) { /* silent fail */ }
    },


    setupListEditor(listId) {
      const actions = getActions();
      const listData = rootGet().lists[String(listId)] || null;

      actions.setupListEditor(listData);
      // Assuming this exists in your store/slice
      actions.fetchListAccounts?.(listId);
    },

    async createList(title, shouldReset) {
      const actions = getActions();
      if (!isLoggedIn(rootGet())) return null;

      actions.createOrUpdateListRequest();

      try {
        const res = await fetch(`/api/v1/lists`, {
          method: 'POST',
          body: JSON.stringify({ title }),
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error("Failed to create list");

        const data = await res.json();
        actions.createOrUpdateListSuccess(data);
        actions.createListSuccess(data);
      } catch (e) {
        actions.createOrUpdateListFail();
      }
    },

    async updateList(id, title, shouldReset) {
      const actions = getActions();
      if (!isLoggedIn(rootGet())) return null;

      actions.createOrUpdateListRequest(id);

      try {
        const res = await fetch(`/api/v1/lists/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ title }),
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error("Failed to update list");

        const data = await res.json();
        actions.createOrUpdateListSuccess(data);
        actions.updateListSuccess(data);

        if (shouldReset) {
          actions.setupListEditor(data);
        }
      } catch (e) {
        actions.createOrUpdateListFail();
      }
    },

    async deleteList(id) {
      if (!isLoggedIn(rootGet())) return null;

      try {
        const res = await fetch(`/api/v1/lists/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("Failed to delete list");
        
        // Immer mutation for deletion
        setScoped((state) => {
          delete state[id]; 
          // Or state[id] = false; if you prefer keeping the key
        });
      } catch (e) { /* silent fail */ }
    },

    async fetchListAccounts(listId) {
      const actions = getActions();
      if (!isLoggedIn(rootGet())) return null;

      actions.fetchListAccountsRequest();
      try {
        const res = await fetch(`/api/v1/lists/${listId}/accounts`);
        if (!res.ok) throw new Error("Failed to fetch list accounts");

        const data = await res.json();
        
        // Optional chaining handles the root store dependencies safely
        actions.importFetchedAccounts?.(data);
        actions.fetchListAccountsSuccess(data);
      } catch (e) {
        actions.fetchListAccountsFail();
      }
    },

    async fetchListSuggestions(query) {
      const actions = getActions();
      if (!isLoggedIn(rootGet())) return null;

      const params = new URLSearchParams({
        q: query,
        resolve: false,
        limit: 4,
        following: true,
      });

      try {
        const res = await fetch(`/api/v1/accounts/search?${params}`);
        if (!res.ok) throw new Error("Failed to fetch suggestions");

        const data = await res.json();
        actions.importFetchedAccounts?.(data);
        actions.listEditorSuggestionsReady(data);
      } catch (e) {
        // TODO: add toast later via root.ui.showToast()
      }
    },

    addToListEditor(accountId) {
      const actions = getActions();
      
      // Accessing the shared addToList action via the actions object
      actions.addToList?.(actions.listId, accountId);
    },

    async addToList(listId, accountId) {
      const actions = getActions();
      if (!isLoggedIn(rootGet())) return null;

      try {
        const res = await fetch(`/api/v1/lists/${listId}/accounts`, {
          method: 'POST',
          body: JSON.stringify({ account_ids: [accountId] }),
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error("Failed to add to list");

        const data = await res.json();
        actions.addListEditorSuccess(data);
        actions.listEditorAddSuccess(data);
      } catch (e) { /* silent fail */ }
    },

    removeFromListEditor(accountId) {
      const actions = getActions();
      actions.removeFromList(actions.listId, accountId);
    },

    async removeFromList(listId, accountId) {
      const actions = getActions();
      if (!isLoggedIn(rootGet())) return null;

      try {
        const res = await fetch(`/api/v1/lists/${listId}/accounts`, {
          method: 'DELETE',
          // Simplified from FormData to a direct JSON payload
          body: JSON.stringify({ 'account_ids[]': [accountId] }),
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error("Failed to remove from list");

        const result = await res.json();
        actions.removeListEditorSuccess(result);
        actions.listEditorRemoveSuccess(result);
      } catch (e) { /* silent fail */ }
    },

    async setupListAdder(accountId) {
      const actions = getActions();
      
      actions.setupListAdder(selectAccount(rootGet(), accountId));
      
      // Use actions for internal slice calls
      actions.fetchLists();
      actions.fetchAccountLists(accountId);
    },

    async fetchAccountLists(accountId) {
      const actions = getActions();
      if (!isLoggedIn(rootGet())) return null;

      actions.fetchListAdderListsRequest(accountId);
      try {
        const res = await fetch(`/api/v1/accounts/${accountId}/lists`);
        if (!res.ok) throw new Error("Failed to fetch account lists");

        const data = await res.json();
        actions.fetchListAdderListsSuccess(accountId, data);
      } catch (e) {
        actions.fetchListAdderListsFail(accountId);
      }
    }

  };
};

export default createListsSlice;