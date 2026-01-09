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
  return {

    fetchListSuccess(list) {
      setScoped((state) => {
        list.forEach(element => {
          const normalized = normalizeList(element);
          state[element.id] = normalized;
        });
      });
    },

    createListSuccess(list) {
      setScoped((state) => {
        list.forEach(element => {
          const normalized = normalizeList(element);
          state[element.id] = normalized;
        });
      });
    },

    updateListSuccess(list) {
      setScoped((state) => {
        list.forEach(element => {
          const normalized = normalizeList(element);
          state[element.id] = normalized;
        });
      });
    },

    fetchListsSuccess(lists) {
      setScoped((state) => {
        lists.forEach(element => {
          const normalized = normalizeList(element);
          state[element.id] = normalized;
        });
      });
    },

    deleteListSuccess(id) {
      setScoped((state) => {
        state[id] = false;
      });
    },

    fetchListFail(id) {
      setScoped((state) => {
        state[id] = false;
      });
    },

    async fetchList(id) {
      const root = rootGet();
      if (!isLoggedIn(root)) {  
        return null;
      }
      if (root.lists[String(id)]) {
        return;
      }

      try {
        const res = await fetch(`/api/v1/lists/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch list");
        }
        const list = await res.json();
        this.fetchListSuccess(list);
      } catch (e) {
        this.fetchListFail(id);
        // swallow any errors from best-effort fetch
      }
    },

    async fetchLists() {
      const root = rootGet();
      if (!isLoggedIn(root)) {  
        return null;
      }

      try {
        const res = await fetch(`/api/v1/lists`);
        if (!res.ok) {
          throw new Error("Failed to fetch lists");
        }
        const lists = await res.json();
        this.fetchListsSuccess(lists);
      } catch (e) {
        // swallow any errors from best-effort fetch
      }
    },

    setupListEditor(listId) {
      const root = rootGet();
      root.listEditor.setupListEditor(root.lists[String(listId)] || null);

      this.fetchListAccounts(listId);
    },

    async createList(title, shouldReset) {
      const root = rootGet();
      if (!isLoggedIn(root)) {  
        return null;
      }
      root.listEditor.createOrUpdateListRequest();

      try {
        const res = await fetch(`/api/v1/lists`, {
          method: 'POST',
          body: JSON.stringify({ title }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) {
          throw new Error("Failed to create list");
        }
        const data = await res.json();
        root.listEditor.createOrUpdateListSuccess(data);
        this.createListSuccess(data); 
      } catch (e) {
        root.listEditor.createOrUpdateListFail();
        // swallow any errors from best-effort create
      }
    },

    async updateList(id, title, shouldReset) {
      const root = rootGet();
      if (!isLoggedIn(root)) {  
        return null;
      }
      root.listEditor.createOrUpdateListRequest(id);

      try {
        const res = await fetch(`/api/v1/lists/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ title }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) {
          throw new Error("Failed to update list");
        }
        const data = await res.json();
        root.listEditor.createOrUpdateListSuccess(data);
        this.updateListSuccess(data);

        if (shouldReset) {
          root.listEditor.setupListEditor(data);
        }
      } catch (e) {
        root.listEditor.createOrUpdateListFail();
        // swallow any errors from best-effort update
      }
    },

    async deleteList(id) {
      const root = rootGet();
      if (!isLoggedIn(root)) {  
        return null;
      }
      try {
        const res = await fetch(`/api/v1/lists/${id}`, {
          method: 'DELETE'
        });
        if (!res.ok) {
          throw new Error("Failed to delete list");
        }
        this.deleteListSuccess(id);
      } catch (e) {
        // swallow any errors from best-effort delete
      }
    },

    async fetchListAccounts(listId) {
      const root = rootGet();
      if (!isLoggedIn(root)) {  
        return null;
      }
      root.listEditor.fetchListAccountsRequest();
      try {
        const res = await fetch(`/api/v1/lists/${listId}/accounts`, {//TODO: check later
          method: 'GET'
        });
        if (!res.ok) {
          throw new Error("Failed to fetch list accounts");
        }
        const data = await res.json();
        root.importer?.importFetchedAccounts?.(data);
        root.listEditor.fetchListAccountsSuccess(data);
      } catch (e) {
        root.listEditor.fetchListAccountsFail();
        // swallow any errors from best-effort fetch
      }
    },

    async fetchListSuggestions(query) {
      const root = rootGet();
      if (!isLoggedIn(root)) {  
        return null;
      }
      const searchParams = {
        q: query,
        resolve: false,
        limit: 4,
        following: true,
      };
      try {
        const res = await fetch(`/api/v1/accounts/search?` + new URLSearchParams(searchParams), {//TODO check later
          method: 'GET'
        });
        if (!res.ok) {
          throw new Error("Failed to fetch list suggestions");
        }
        const data = await res.json();
        root.importer?.importFetchedAccounts?.(data);
        root.listEditor.listEditorSuggestionsReady(data);
      } catch (e) {
        // swallow any errors from best-effort fetch
        // TODO: add toast later
      }
    },

    addToListEditor(accountId) {
      const root = rootGet();
      this.addToList(root.listEditor.listId, accountId);
    },

    async addToList(listId, accountId) {
      const root = rootGet();
      if (!isLoggedIn(root)) {
        return null;
      }
      try {
        const res = await fetch(`/api/v1/lists/${listId}/accounts`, {
          method: 'POST',
          body: JSON.stringify({ account_ids: [accountId] }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) {
          throw new Error("Failed to add to list");
        }
        const data = await res.json();
        root.listAdder.addListEditorSuccess(data);
        root.listEditor.listEditorAddSuccess(data);
      } catch (e) {
        // swallow any errors from best-effort add
      }
    },

    removeFromListEditor(accountId) {
      const root = rootGet();
      this.removeFromList(root.listEditor.listId, accountId);
    },

    async removeFromList(listId, accountId) {
      const root = rootGet();
      if (!isLoggedIn(root)) {
        return null;
      }
      const form = new FormData();
      form.append('account_ids[]', accountId);
      try {
        const res = await fetch(`/api/v1/lists/${listId}/accounts`, {
          method: 'DELETE',
          body: JSON.stringify(Object.fromEntries(form)),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) {
          throw new Error("Failed to remove from list");
        }
        const result = await res.json();
        root.listAdder.removeListEditorSuccess(result);
        root.listEditor.listEditorRemoveSuccess(result);
      } catch (e) {
        // swallow any errors from best-effort remove
      }
    },

    async setupListAdder(accountId) {
      const root = rootGet();
      root.listAdder.setupListAdder(selectAccount(root, accountId));
      this.fetchLists();
      this.fetchAccountLists(accountId);
    },

    async fetchAccountLists(accountId) {
      const root = rootGet();
      if (!isLoggedIn(root)) {
        return null;
      }
      root.listAdder.fetchListAdderListsRequest(accountId);
      try {
        const res = await fetch(`/api/v1/accounts/${accountId}/lists`, {
          method: 'GET'
        });
        if (!res.ok) {
          throw new Error("Failed to fetch account lists");
        }
        const data = await res.json();
        root.listAdder.fetchListAdderListsSuccess(accountId, data);
      } catch (e) {
        root.listAdder.fetchListAdderListsFail(accountId);
        // swallow any errors from best-effort fetch
      }
    }

  };
};

export default createListsSlice;