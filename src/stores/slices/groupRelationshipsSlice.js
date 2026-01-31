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
    // --- Initial State ---
    // Note: Since this slice is a dictionary [id]: data, 
    // we don't need the individual fields like 'member: false' at the top level.
    // They live inside the objects stored under state[id].
    createGroupsuccess(group) {
      if (!group?.id) return;
      setScoped((state) => {
        // Direct assignment replaces manual merging
        state[group.id] = normalizeGroupRelationship({
          id: group.id,
          member: true,
          requested: false,
          role: "admin",
        });
      });
    },

    updateGroupsuccess(group) {
      if (!group?.id) return;
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
      if (!id) return;
      setScoped((state) => {
        // Native JS 'delete' is the idiomatic way to remove keys in Immer drafts
        delete state[id];
      });
    },

    fetchGroupRelationshipsSuccess(relationships) {
      if (!Array.isArray(relationships)) return;
      
      setScoped((state) => {
        relationships.forEach((rel) => {
          if (rel?.id) {
            // Update each relationship entry in the dictionary
            state[rel.id] = normalizeGroupRelationship(rel);
          }
        });
      });
    },
  };
};

// Export default for compatibility with various import styles
export default createGroupRelationshipsSlice;
