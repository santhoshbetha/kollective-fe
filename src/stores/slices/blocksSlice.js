// Action-only slice for block operations. No local state — only actions.

import { isLoggedIn } from "../../utils/auth";

export function createBlocksSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    // Fetch the current block list (accounts this user has blocked)
    async fetchBlocks() {
      if (!isLoggedIn(rootGet())) return [];
      const root = rootGet();
      try {
        const res = await fetch('/api/v1/blocks', { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to fetch blocks (${res.status})`);
        const data = await res.json();
        const next = res.next();

        // Import fetched accounts and populate lightweight metadata
        root.importer?.importFetchedAccounts?.(data);
        root.userLists.fetchBlocksSuccess?.(data, next);
        // Prefetch relationships for these accounts
        await root.accounts?.fetchRelationships?.(data.map((a) => a.id)) || null;

        return data;
      } catch (err) {
        console.error('blocksSlice.fetchBlocks failed', err);
        return [];
      }
    },

    async expandBlocks() {
      if (!isLoggedIn(rootGet())) return [];
      const root = rootGet();   
        try {
            const url = root.userLists.blocks.next;
            if (!url) return [];

            const res = await fetch(url, { method: 'GET' });
            if (!res.ok) throw new Error(`Failed to expand blocks (${res.status})`);
            const data = await res.json();
            const next = res.next();
            // Import fetched accounts and populate lightweight metadata
            root.importer?.importFetchedAccounts?.(data);
            root.userLists.expandBlocksSuccess?.(data, next);    
            // Prefetch relationships for these accounts
            await root.accounts?.fetchRelationships?.(data.map((a) => a.id)) || null;
            return data;
        }
        catch (err) {
            console.error('blocksSlice.expandBlocks failed', err);
            return [];
        }
    },
  };
}

export default createBlocksSlice;
