// Action-only slice for instance directory operations. No local state — only actions.

import { isLoggedIn } from "../../utils/auth";

export function createDirectorySlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    
    // Fetch directory with optional params (e.g., { q, limit, local })
    async fetchDirectory(params = {}) {
      const root = rootGet();
      root.userLists.fetchOrExpandDirectoryRequest();

      fetch(`/api/v1/directory?${new URLSearchParams(params)}`, { //TODO: check later
        method: 'GET',
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(`Failed to fetch directory (${res.status})`);
          const data = await res.json(); 
            root.importer?.importFetchedAccounts?.(data);   
            root.userLists.fetchDirectorySuccess(data);
            root.accounts.fetchRelationships(data.map((a) => a.id));
        }).catch((err) => {
          root.userLists.fetchOrExpandDirectoryFail();
        });
    },

    async expandDirectory(params) {
        const root = rootGet();
        root.userLists.fetchOrExpandDirectoryRequest();

        fetch(`/api/v1/directory?${new URLSearchParams(params)}`, { //TODO: check later     
            method: 'GET',
        })
        .then(async (res) => {
          if (!res.ok) throw new Error(`Failed to expand directory (${res.status})`);
          const data = await res.json();
            root.importer?.importFetchedAccounts?.(data);
            root.userLists.expandDirectorySuccess(data);
            root.accounts.fetchRelationships(data.map((a) => a.id));
        }).catch((err) => {
          root.userLists.fetchOrExpandDirectoryFail();
        });
    },
  };
}

export default createDirectorySlice;
