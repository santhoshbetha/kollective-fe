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

export const createGroupMembershipsSlice = (
  setScoped /* getScoped, rootSet, rootGet */,
) => {
  // Minimal skeleton for group memberships slice — no domain logic yet.
  return {
    admin: {
      next: null,
      isLoading: false,
      items: new Set(),
    },
    moderator: {
      next: null,
      isLoading: false,
      items: new Set(),
    },
    user: {
      next: null,
      isLoading: false,
      items: new Set(),
    },

    deleteGroupSuccess(id) {
      if (!id) return;
      setScoped((state) => {
        // Apply the immutable deletion for all three roles
        const newAdminMap = deleteKeyFromMap(state.admin, id);
        const newModeratorMap = deleteKeyFromMap(state.moderator, id);
        const newUserMap = deleteKeyFromMap(state.user, id);

        return {
          ...state,
          admin: newAdminMap,
          moderator: newModeratorMap,
          user: newUserMap,
        };
      });
    },

    fetchGroupMembershipsRequest(role, id) {
      if (!role) return;
      setScoped((state) => {
        // 1. Access the current nested level for the specific 'role'
        const currentRoleMap = state[role] || {};

        // 2. Access the specific 'id' record within that role map,
        //    using our default if it doesn't exist (equivalent to ListRecord() default).
        const currentEntityRecord = currentRoleMap[id] || DefaultEntityRecord;

        // 3. Create the *new* entity record with the updated isLoading property
        const newEntityRecord = {
          ...currentEntityRecord,
          isLoading: true, // The update being applied
        };

        // 4. Create the *new* map for the 'role' level
        const newRoleMap = {
          ...currentRoleMap,
          [id]: newEntityRecord,
        };

        // 5. Return the final new state, updating the top 'role' key immutably
        return {
          ...state, // Spread existing state properties (other roles, actions)
          [role]: newRoleMap,
        };
      });
    },

    expandGroupMembershipsRequest(role, id) {
      if (!role) return;
      setScoped((state) => {
        // 1. Access the current nested level for the specific 'role'
        const currentRoleMap = state[role] || {};

        // 2. Access the specific 'id' record within that role map,
        //    using our default if it doesn't exist (equivalent to ListRecord() default).
        const currentEntityRecord = currentRoleMap[id] || DefaultEntityRecord;

        // 3. Create the *new* entity record with the updated isLoading property
        const newEntityRecord = {
          ...currentEntityRecord,
          isLoading: true, // The update being applied
        };

        // 4. Create the *new* map for the 'role' level
        const newRoleMap = {
          ...currentRoleMap,
          [id]: newEntityRecord,
        };

        // 5. Return the final new state, updating the top 'role' key immutably
        return {
          ...state, // Spread existing state properties (other roles, actions)
          [role]: newRoleMap,
        };
      });
    },

    fetchGroupMembershipsFail(role, id) {
      if (!role) return;
      setScoped((state) => {
        // 1. Access the current nested level for the specific 'role'
        const currentRoleMap = state[role] || {};

        // 2. Access the specific 'id' record within that role map,
        //    using our default if it doesn't exist (equivalent to ListRecord() default).
        const currentEntityRecord = currentRoleMap[id] || DefaultEntityRecord;

        // 3. Create the *new* entity record with the updated isLoading property
        const newEntityRecord = {
          ...currentEntityRecord,
          isLoading: false, // The update being applied
        };

        // 4. Create the *new* map for the 'role' level
        const newRoleMap = {
          ...currentRoleMap,
          [id]: newEntityRecord,
        };

        // 5. Return the final new state, updating the top 'role' key immutably
        return {
          ...state, // Spread existing state properties (other roles, actions)
          [role]: newRoleMap,
        };
      });
    },

    expandGroupMembershipsFail(role, id) {
      if (!role) return;
      setScoped((state) => {
        // 1. Access the current nested level for the specific 'role'
        const currentRoleMap = state[role] || {};

        // 2. Access the specific 'id' record within that role map,
        //    using our default if it doesn't exist (equivalent to ListRecord() default).
        const currentEntityRecord = currentRoleMap[id] || DefaultEntityRecord;

        // 3. Create the *new* entity record with the updated isLoading property
        const newEntityRecord = {
          ...currentEntityRecord,
          isLoading: false, // The update being applied
        };

        // 4. Create the *new* map for the 'role' level
        const newRoleMap = {
          ...currentRoleMap,
          [id]: newEntityRecord,
        };

        // 5. Return the final new state, updating the top 'role' key immutably
        return {
          ...state, // Spread existing state properties (other roles, actions)
          [role]: newRoleMap,
        };
      });
    },

    fetchGroupMembershipsSuccess(role, id, memberships, next) {
      if (!role) return;
      setScoped((state) => {
        // 1. Access the current nested level for the specific 'role'
        const currentRoleMap = state[role] || {};
        // 2. Create the *new* entity record with the updated items and isLoading=false
        const newEntityRecord = {
          next,
          isLoading: false,
          items: new Set(memberships.map((item) => item.account.id) || []),
        };
        // 3. Create the *new* map for the 'role' level
        const newRoleMap = {
          ...currentRoleMap,
          [id]: newEntityRecord,
        };
        // 4. Return the final new state, updating the top 'role' key immutably
        return {
          ...state, // Spread existing state properties (other roles, actions)
          [role]: newRoleMap,
        };
      });
    },

    expandGroupMembershipsSuccess(role, id, memberships, next) {
      if (!role) return;
      setScoped((state) => {
        // 1. Access the current nested level for the specific 'role'
        const currentRoleMap = state[role] || {};
        // 2. Access the specific 'id' record within that role map,
        //    using our default if it doesn't exist (equivalent to ListRecord() default).
        const currentEntityRecord = currentRoleMap[id] || DefaultEntityRecord;

        // 3. Create the *new* lisy record with the updated items and isLoading=false
        const itemsList = Array.from(currentEntityRecord.items);
        const newItemsList = itemsList.concat(
          memberships.map((item) => item.account.id),
        );

        const newEntityRecord = {
          next,
          isLoading: false,
          items: new Set(newItemsList),
        };
        // 4. Create the *new* map for the 'role' level
        const newRoleMap = {
          ...currentRoleMap,
          [id]: newEntityRecord,
        };
        // 5. Return the final new state, updating the top 'role' key immutably
        return {
          ...state, // Spread existing state properties (other roles, actions)
          [role]: newRoleMap,
        };
      });
    },

    promoteGroupSuccess(groupId, memberships) {
      if (!groupId) return;
      setScoped((state) => {
        // Update all roles with the new memberships data
        const roles = ["admin", "moderator", "user"];
        const newState = { ...state };
        memberships.forEach((membership) => {
          roles.forEach((role) => {
            const currentRoleMap = state[role] || {};

            const currentGroupRecord =
              currentRoleMap[groupId] || DefaultGroupRecord;

            const newItemsSet = new Set(currentGroupRecord.items);
            if (role === membership.role) {
              newItemsSet.add(membership.account.id);
            } else {
              newItemsSet.delete(membership.account.id);
            }

            const newGroupRecord = {
              ...currentGroupRecord,
              items: newItemsSet,
            };
            const newRoleMap = {
              ...currentRoleMap,
              [groupId]: newGroupRecord,
            };
            newState[role] = newRoleMap;
          });
        });

        return newState;
      });
    },

    kickGroupSuccess(groupId, accountId) {
      if (!groupId || !accountId) return;
      setScoped((state) => {
        // Update all roles to remove the accountId from the groupId
        const roles = ["admin", "moderator", "user"];
        const newState = { ...state };
        roles.forEach((role) => {
          const currentRoleMap = state[role] || {};
          const currentGroupRecord =
            currentRoleMap[groupId] || DefaultGroupRecord;

          const newItemsSet = new Set(currentGroupRecord.items);
          newItemsSet.delete(accountId);

          const newGroupRecord = {
            ...currentGroupRecord,
            items: newItemsSet,
          };
          const newRoleMap = {
            ...currentRoleMap,
            [groupId]: newGroupRecord,
          };
          newState[role] = newRoleMap;
        });

        return newState;
      });
    },

    blockGroupSuccess(groupId, accountId) {
      if (!groupId || !accountId) return;
      setScoped((state) => {
        // Update all roles to remove the accountId from the groupId
        const roles = ["admin", "moderator", "user"];
        const newState = { ...state };
        roles.forEach((role) => {
          const currentRoleMap = state[role] || {};
          const currentGroupRecord =
            currentRoleMap[groupId] || DefaultGroupRecord;

          const newItemsSet = new Set(currentGroupRecord.items);
          newItemsSet.delete(accountId);

          const newGroupRecord = {
            ...currentGroupRecord,
            items: newItemsSet,
          };
          const newRoleMap = {
            ...currentRoleMap,
            [groupId]: newGroupRecord,
          };
          newState[role] = newRoleMap;
        });

        return newState;
      });
    },
  };
};

export default createGroupMembershipsSlice;
