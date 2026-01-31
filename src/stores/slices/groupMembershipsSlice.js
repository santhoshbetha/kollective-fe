// Helper function to create a new object without a specific key
const deleteKeyFromMap = (map, keyToDelete) => {
  // Use object destructuring to omit the key and collect the rest
  const { [keyToDelete]: _deleted, ...newMap } = map;
  return newMap;
};

const DefaultEntityRecord = {
  isLoading: false,
  items: new Set(),
};

// Default value if a record doesn't exist
const DefaultGroupRecord = {
  items: new Set(),
};

const createDefaultList = () => ({
  next: null,
  isLoading: false,
  items: [], // Standard Array replaces Set
});


export const createGroupMembershipsSlice = (
  setScoped /* getScoped, rootSet, rootGet */,
) => {
  // Internal helper to ensure role/group nesting exists before mutation
  const ensureList = (state, role, id) => {
    if (!state[role]) state[role] = {};
    if (!state[role][id]) state[role][id] = createDefaultList();
    return state[role][id];
  };

  // Internal helper to remove a specific user from all role lists of a group
  const removeUserFromGroupRoles = (state, groupId, accountId) => {
    const roles = ["admin", "moderator", "user"];

    roles.forEach((role) => {
      const list = state[role]?.[groupId];
      
      // If the list exists and contains the user, filter them out
      if (list?.items) {
        list.items = list.items.filter((id) => id !== accountId);
      }
    });
  };

  // Minimal skeleton for group memberships slice — no domain logic yet.
  return {
    // --- State ---
    admin: {},
    moderator: {},
    user: {},

    deleteGroupSuccess(id) {
      if (!id) return;
      setScoped((state) => {
        // Standard JS 'delete' works perfectly inside Immer drafts
        delete state.admin[id];
        delete state.moderator[id];
        delete state.user[id];
      });
    },

    fetchGroupMembershipsRequest(role, id) {
      if (!role || !id) return;
      setScoped((state) => {
        const list = ensureList(state, role, id);
        list.isLoading = true;
      });
    },

    expandGroupMembershipsRequest(role, id) {
      if (!role || !id) return;
      setScoped((state) => {
        const list = ensureList(state, role, id);
        list.isLoading = true;
      });
    },

    fetchGroupMembershipsFail(role, id) {
      if (!role || !id) return;
      setScoped((state) => {
        const list = ensureList(state, role, id);
        list.isLoading = false;
      });
    },

    expandGroupMembershipsFail(role, id) {
      if (!role || !id) return;
      setScoped((state) => {
        const list = ensureList(state, role, id);
        list.isLoading = false;
      });
    },

    fetchGroupMembershipsSuccess(role, id, memberships, next) {
      if (!role || !id) return;
      setScoped((state) => {
        const list = ensureList(state, role, id);
        const incomingIds = (memberships || []).map((m) => m.account.id);

        list.next = next ?? null;
        list.isLoading = false;
        // Ensure uniqueness using standard JS Set -> Array pattern
        list.items = [...new Set(incomingIds)];
      });
    },

    expandGroupMembershipsSuccess(role, id, memberships, next) {
      if (!role || !id) return;
      setScoped((state) => {
        const list = ensureList(state, role, id);
        const incomingIds = (memberships || []).map((m) => m.account.id);

        list.next = next ?? null;
        list.isLoading = false;
        // Merge existing and new, then deduplicate
        list.items = [...new Set([...list.items, ...incomingIds])];
      });
    },

    promoteGroupSuccess(groupId, memberships) {
      if (!groupId || !Array.isArray(memberships)) return;
      setScoped((state) => {
        const roles = ["admin", "moderator", "user"];
        
        memberships.forEach((membership) => {
          const accountId = membership.account.id;
          // Logic: If a user is promoted, they might need to be removed or updated 
          // in existing lists depending on your specific backend role-overlap logic.
          // For now, this mimics the structure of your provided snippet:
          roles.forEach((role) => {
            const list = state[role]?.[groupId];
            if (list && !list.items.includes(accountId)) {
              list.items.push(accountId);
            }
          });
        });
      });
    },

    kickGroupSuccess(groupId, accountId) {
      if (!groupId || !accountId) return;
      setScoped((state) => {
        removeUserFromGroupRoles(state, groupId, accountId);
      });
    },


    blockGroupSuccess(groupId, accountId) {
      if (!groupId || !accountId) return;
      setScoped((state) => {
        removeUserFromGroupRoles(state, groupId, accountId);
      });
    },
  };
};

export default createGroupMembershipsSlice;
