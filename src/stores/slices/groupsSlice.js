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
  return {
    isLoading: true,
    items: {},

    importGroups(groups) {
      setScoped((state) => normalizeGroups(state, groups));
    },

    fetchGroupsRequest() {
      setScoped((state) => {
        state.isLoading = true;
      });
    },

    deleteGroupSuccess(id) {
      setScoped((state) => {
        if (id == null) {
          state.isLoading = false;
          return;
        }

        if (!state.items) {
          state.isLoading = false;
          return;
        }

        // Clone items and remove the deleted group key to avoid mutating callers
        const nextItems = { ...state.items };
        if (Object.prototype.hasOwnProperty.call(nextItems, id)) {
          delete nextItems[id];
        }

        state.items = nextItems;
        state.isLoading = false;
      });
    },

    fetcheGroupFail(id) {
      setScoped((state) => {
        if (id == null) {
          state.isLoading = false;
          return;
        }

        if (!state.items) {
          state.isLoading = false;
          return;
        }

        // Clone items and remove the deleted group key to avoid mutating callers
        const nextItems = { ...state.items };
        if (Object.prototype.hasOwnProperty.call(nextItems, id)) {
          delete nextItems[id];
        }

        state.items = nextItems;
        state.isLoading = false;
      });
    },

    async fetchGroupRelationships(groupIds) {
      const root = rootGet();
      const loadedRelationships = root.groupRelationships;
      const newGroupIds = groupIds.filter(id => loadedRelationships[id] === null);

      if (!root.me || newGroupIds.length === 0) {
        return;
      }

      try {
        const res = await fetch(`/api/v1/groups/relationships?${newGroupIds.map(id => `id[]=${id}`).join('&')}`, {
          method: 'GET',
        });
        if (!res.ok) throw new Error(`Failed to fetch group relationships (${res.status})`);
        const data = await res.json();
        root.groupRelationships.fetchGroupRelationshipsSuccess(data || []); 

      } catch (err) {
        console.error('groupsSlice.fetchGroupRelationships failed', err);
      } 
    },

    async groupKick(groupId, accountId) {
      try {
        const res = await fetch(`/api/v1/groups/${groupId}/kick`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ account_ids: [accountId] }),
        });
        if (!res.ok) throw new Error(`Failed to kick user from group (${res.status})`);
        const data = await res.json();
        const root = rootGet();
        root.groupMemberships.kickGroupSuccess(groupId, accountId);
        console.log('Kick successful', data);
      } catch (err) {
        console.error('groupsSlice.groupKick failed', err);
      }
    },

    async fetchGroupBlocks(id) {
      const root = rootGet();
      root.userLists.fetchOrExpandGroupBlocksRequest(id);

      try {
        const res = await fetch(`/api/v1/groups/${id}/blocks`, {
          method: 'GET',
        });
        if (!res.ok) throw new Error(`Failed to fetch group blocks (${res.status})`);
        const data = await res.json();
        const next = res.next();
        root.importer.importFetchedAccounts(data || []);
        root.userLists.fetchGroupBlocksSuccess(id, data || [], next);
        return data;
      } catch (err) {
        root.userLists.fetchOrExpandGroupBlocksFail(id, err);
        console.error('groupsSlice.fetchGroupBlocks failed', err);
        return null;
      }
    },

    async expandGroupBlocks(id) {
      const root = rootGet();
      root.userLists.fetchOrExpandGroupBlocksRequest(id);

      try {
        const res = await fetch(`/api/v1/groups/${id}/blocks`, {
          method: 'GET',
        });
        if (!res.ok) throw new Error(`Failed to fetch group blocks (${res.status})`);
        const data = await res.json();
        const next = res.next();
        root.importer.importFetchedAccounts(data || []);
        root.userLists.expandGroupBlocksSuccess(id, data || [], next);
        root.accounts.fetchGroupRelationships(data || []);
        return data;
      } catch (err) {
        root.userLists.fetchOrExpandGroupBlocksFail(id, err);
        console.error('groupsSlice.fetchGroupBlocks failed', err);
        return null;
      }
    },

    async groupBlock(groupId, accountId) {
      const root = rootGet();
      try {
        const res = fetch(`/api/v1/groups/${groupId}/blocks`, { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ account_ids: [accountId] }),
        });
        if (!res.ok) throw new Error(`Failed to block user in group (${res.status})`);
        const data = await res.json();
        root.groupMemberships.blockGroupSuccess(groupId, accountId);
        console.log('Block successful', data);
      } catch (err) {
        console.error('groupsSlice.groupBlock failed', err);
      }
    },

    groupUnblock(groupId, accountId) {
      const root = rootGet();
      try {
        fetch(`/api/v1/groups/${groupId}/blocks?account_ids[]=${accountId}`, {
          method: 'DELETE',
        });
        root.userLists.unblockGroupSuccess(groupId, accountId);
        console.log('Unblock successful');
      } catch (err) {
        console.error('groupsSlice.groupUnblock failed', err);
      }
    },
  }
}

export default createGroupsSlice;
