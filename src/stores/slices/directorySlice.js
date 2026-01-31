// Action-only slice for instance directory operations. No local state — only actions.

import { isLoggedIn } from "../../utils/auth";

export function createDirectorySlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();
  return {
    
    // Fetch directory with optional params (e.g., { q, limit, local })
// Fetch directory with optional params (e.g., { q, limit, local })
    async fetchDirectory(params = {}) {
      const actions = getActions();

      // 1. Trigger loading state in UserLists
      actions.fetchOrExpandDirectoryRequest?.();

      try {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`/api/v1/directory?${query}`, { method: 'GET' });

        if (!res.ok) throw new Error(`Failed to fetch directory (${res.status})`);
        
        const data = await res.json();

        // 2. Import accounts into the global dictionary
        actions.importFetchedAccounts?.(data);
        
        // 3. Update the directory list state
        actions.fetchDirectorySuccess?.(data);

        // 4. Prefetch relationships for the fetched accounts
        if (Array.isArray(data) && data.length > 0) {
          await actions.fetchRelationships?.(data.map((a) => a.id));
        }
      } catch (err) {
        console.error('directorySlice.fetchDirectory failed', err);
        actions.fetchOrExpandDirectoryFail?.();
      }
    },

    async expandDirectory(params = {}) {
      const actions = getActions();

      actions.fetchOrExpandDirectoryRequest?.();

      try {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`/api/v1/directory?${query}`, { method: 'GET' });

        if (!res.ok) throw new Error(`Failed to expand directory (${res.status})`);
        
        const data = await res.json();

        actions.importFetchedAccounts?.(data);
        
        // Use the 'expand' specific success handler to append items
        actions.expandDirectorySuccess?.(data);

        if (Array.isArray(data) && data.length > 0) {
          await actions.fetchRelationships?.(data.map((a) => a.id));
        }
      } catch (err) {
        console.error('directorySlice.expandDirectory failed', err);
        actions.fetchOrExpandDirectoryFail?.();
      }
    },
  };
}

export default createDirectorySlice;
