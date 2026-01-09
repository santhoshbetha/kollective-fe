import { normalizeGroupRelationship } from "../../normalizers/group-relationships";

const normalizeRelationships = (state, relationships) => {
  relationships.forEach((relationship) => {
    state[relationship.id] = normalizeGroupRelationship(relationship);
  });
  return state;
};

export const createGroupRelationshipsSlice = (
  setScoped, // scoped setter for this slice
  getScoped, // scoped getter for this slice
  rootSet, // root-level setter
  rootGet, // root-level getter
) => {
  // Manage relationships between groups (by id, and index by group)
  return {
    id: "",
    blocked_by: false,
    member: false,
    notifying: null,
    requested: false,
    muting: false,
    role: "user",
    pending_requests: false,

    createGroupsuccess(group) {
      setScoped((state) => {
        state[group.id] = normalizeGroupRelationship({
          id: group.id,
          member: true,
          requested: false,
          role: "admin",
        });
      });
    },

    updateGroupsuccess(group) {
      setScoped((state) => {
        state[group.id] = normalizeGroupRelationship({
          id: group.id,
          member: true,
          requested: false,
          role: "admin",
        });
      });
    },

    deleteGroupSuccess(id) {
      setScoped((state) => {
        delete state[id];
      });
    },

    fetchGroupRelationshipsSuccess(relationships) {
      setScoped((state) => normalizeRelationships(state, relationships));
    },
  };
};

// Export default for compatibility with various import styles
export default createGroupRelationshipsSlice;
