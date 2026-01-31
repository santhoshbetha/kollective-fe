import { normalizeGroup } from "../../normalizers/group";

const normalizeGroups = (state, groups) => {
  const items = { ...(state.items || {}) };
  (groups || []).forEach((group) => {
    if (!group) return;
    const normalized = normalizeGroup(group);
    if (!normalized) return;
    const id = normalized.id ?? group.id;
    if (!id) return;
    items[id] = normalized;
  });

  return { ...state, items, isLoading: false };
};

// Note: setIn helper removed — we use direct draft mutations or plain-JS helpers instead.

export function createGroupsSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();
  return {
    // --- Initial State ---
    isLoading: false,
    items: {},

    importGroups(groups) {
      if (!Array.isArray(groups)) return;

      setScoped((state) => {
        groups.forEach((group) => {
          const normalized = normalizeGroup(group);
          if (normalized?.id) {
            state.items[normalized.id] = normalized;
          }
        });
        state.isLoading = false;
      });
    },

    fetchGroupsRequest() {
      setScoped((state) => {
        state.isLoading = true;
      });
    },

    deleteGroupSuccess(id) {
      setScoped((state) => {
        if (id && state.items[id]) {
          // Standard JS 'delete' is idiomatic for Immer drafts
          delete state.items[id];
        }
        state.isLoading = false;
      });
    },

    // Standardizing "fail" logic to just reset loading
    fetchGroupFail() {
      setScoped((state) => {
        state.isLoading = false;
      });
    },

    async fetchGroupRelationships(groupIds) {
      const state = rootGet();
      const actions = getActions();
      
      // Filter for groups we haven't checked relationships for yet
      const newGroupIds = groupIds.filter(id => !state.groupRelationships?.[id]);

      if (!state.auth?.me || newGroupIds.length === 0) return;

      try {
        const query = newGroupIds.map(id => `id[]=${id}`).join('&');
        const res = await fetch(`/api/v1/groups/relationships?${query}`, { method: 'GET' });
        
        if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
        const data = await res.json();

        // Notify sibling slice via root action
        actions.fetchGroupRelationshipsSuccess?.(data || []);
      } catch (err) {
        console.error('groupsSlice.fetchGroupRelationships failed', err);
      }
    },

    async groupKick(groupId, accountId) {
      const actions = getActions();
      try {
        const res = await fetch(`/api/v1/groups/${groupId}/kick`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account_ids: [accountId] }),
        });

        if (!res.ok) throw new Error(`Kick failed (${res.status})`);
        
        // Notify memberships slice to remove the user from lists
        actions.kickGroupSuccess?.(groupId, accountId);
        actions.showToast?.('User kicked from group');
      } catch (err) {
        console.error('groupsSlice.groupKick failed', err);
      }
    },

    async fetchGroupBlocks(id) {
      const actions = getActions();
      actions.fetchOrExpandGroupBlocksRequest?.(id);

      try {
        const res = await fetch(`/api/v1/groups/${id}/blocks`, { method: 'GET' });
        if (!res.ok) throw new Error(res.status);
        
        const data = await res.json();
        
        // Standard Link header parsing replaces legacy .next()
        const link = res.headers.get('Link');
        const next = link?.match(/<([^>]+)>;\s*rel="next"/i)?.[1] || null;

        actions.importFetchedAccounts?.(data || []);
        actions.fetchGroupBlocksSuccess?.(id, data || [], next);
        return data;
      } catch (err) {
        actions.fetchOrExpandGroupBlocksFail?.(id, err);
        console.error('groupsSlice.fetchGroupBlocks failed', err);
        return null;
      }
    },

    async expandGroupBlocks(id) {
      const state = rootGet();
      const actions = getActions();

      // 1. Access the 'next' URL from the userLists slice state via the root
      const url = state.userLists?.group_blocks?.[id]?.next;
      
      if (!url) return null;

      // Trigger loading state
      actions.fetchOrExpandGroupBlocksRequest?.(id);

      try {
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to expand group blocks (${res.status})`);
        
        const data = await res.json();
        
        // 2. Standard Link header parsing for pagination (replacing .next())
        const link = res.headers.get('Link');
        const next = link?.match(/<([^>]+)>;\s*rel="next"/i)?.[1] || null;

        // 3. Coordinate updates via root actions
        actions.importFetchedAccounts?.(data || []);
        actions.expandGroupBlocksSuccess?.(id, data || [], next);
        
        // 4. Prefetch relationships for these blocked accounts
        if (Array.isArray(data) && data.length > 0) {
          await actions.fetchRelationships?.(data.map((acc) => acc.id));
        }

        return data;
      } catch (err) {
        actions.fetchOrExpandGroupBlocksFail?.(id, err);
        console.error('groupsSlice.expandGroupBlocks failed', err);
        return null;
      }
    },

    async groupBlock(groupId, accountId) {
      const actions = getActions();
      try {
        const res = await fetch(`/api/v1/groups/${groupId}/blocks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account_ids: [accountId] }),
        });

        if (!res.ok) throw new Error(`Block failed (${res.status})`);
        
        actions.blockGroupSuccess?.(groupId, accountId);
        actions.showToast?.('User blocked in group');
      } catch (err) {
        console.error('groupsSlice.groupBlock failed', err);
      }
    },

    async groupUnblock(groupId, accountId) {
      const actions = getActions();
      try {
        const res = await fetch(`/api/v1/groups/${groupId}/blocks?account_ids[]=${accountId}`, {
          method: 'DELETE',
        });

        if (!res.ok) throw new Error(`Unblock failed (${res.status})`);
        
        actions.unblockGroupSuccess?.(groupId, accountId);
      } catch (err) {
        console.error('groupsSlice.groupUnblock failed', err);
      }
    },
  }
}

export default createGroupsSlice;
