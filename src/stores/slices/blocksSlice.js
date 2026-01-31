// Action-only slice for block operations. No local state — only actions.

import { isLoggedIn } from "../../utils/auth";

export function createBlocksSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();
  return {
    // Fetch the current block list (accounts this user has blocked)
    async fetchBlocks() {
      const state = rootGet();
      const actions = getActions();

      // 1. Auth Guard
      if (!isLoggedIn(state)) return [];

      try {
        const res = await fetch('/api/v1/blocks', { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to fetch blocks (${res.status})`);
        
        const data = await res.json();

        // 2. Extract pagination (Assuming res.pagination() helper or Link header)
        let next = null;
        if (res.pagination) {
          next = res.pagination().next;
        } else {
          const link = res.headers.get('Link');
          const match = link?.match(/<([^>]+)>;\s*rel="next"/i);
          next = match ? match[1] : null;
        }

        // 3. Import accounts and update user list via root actions
        actions.importFetchedAccounts?.(data);
        
        // Renamed to follow your unique-naming pattern for root-level actions
        actions.userListFetchBlocksSuccess?.(data, next);

        // 4. Prefetch relationships for these accounts
        if (Array.isArray(data) && data.length > 0) {
          await actions.fetchRelationships?.(data.map((a) => a.id));
        }

        return data;
      } catch (err) {
        console.error('blocksSlice.fetchBlocks failed', err);
        return [];
      }
    },

    async expandBlocks() {
      const state = rootGet();
      const actions = getActions();

      // 1. Auth Guard
      if (!isLoggedIn(state)) return [];

      try {
        // 2. Access the 'next' URL from the state (not actions)
        const url = state.userLists?.blocks?.next;
        if (!url) return [];

        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to expand blocks (${res.status})`);
        
        const data = await res.json();

        // 3. Link Header parsing for pagination
        let next = null;
        const link = res.headers.get('Link');
        if (link) {
          const match = link.match(/<([^>]+)>;\s*rel="next"/i);
          next = match ? match[1] : null;
        }

        // 4. Import accounts via root-level actions
        actions.importFetchedAccounts?.(data);
        
        // 5. Update user list (using unique name to avoid collisions)
        actions.userListExpandBlocksSuccess?.(data, next);

        // 6. Prefetch relationships for these accounts
        if (Array.isArray(data) && data.length > 0) {
          await actions.fetchRelationships?.(data.map((a) => a.id));
        }

        return data;
      } catch (err) {
        console.error('blocksSlice.expandBlocks failed', err);
        return [];
      }
    },
  };
}

export default createBlocksSlice;
