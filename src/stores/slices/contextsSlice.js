// contextsSlice.js
// Simple slice to store and manage "contexts" (e.g., conversation contexts, threads, scenes)

// --- Initial State Factory ---
const getInitialState = () => ({
  inReplyTos: {}, // childId -> parentId
  replies: {},    // parentId -> Set(childId)
});

import { asArray } from "../../utils/immutableSafe";

const deletePendingStatus = (state, params, idempotencyKey) => {
  const pendingId = `末pending-${idempotencyKey}`;
  const inReplyToId = params?.in_reply_to_id;

  // Helper to remove an ID from a specific parent's set
  const removeFromParent = (parentId, childId) => {
    if (parentId && state.replies[parentId]) {
      state.replies[parentId].delete(childId);
      if (state.replies[parentId].size === 0) delete state.replies[parentId];
    }
  };

  // Remove the mapping for the pending ID
  const parentOfPending = state.inReplyTos[pendingId];
  if (parentOfPending) {
    removeFromParent(parentOfPending, pendingId);
    delete state.inReplyTos[pendingId];
  }

  // Also handle provided inReplyToId case
  if (inReplyToId) {
    removeFromParent(inReplyToId, pendingId);
  }
};

/** Import a single status into the reducer, setting replies and replyTos. */
const importStatusHelper = (state, status, idempotencyKey) => {
  const id = status?.id;
  const inReplyToId = status?.in_reply_to_id;
  if (!id || !inReplyToId) return;

  state.inReplyTos[id] = inReplyToId;

  if (!state.replies[inReplyToId]) state.replies[inReplyToId] = new Set();
  state.replies[inReplyToId].add(id);

  if (idempotencyKey) deletePendingStatus(state, status, idempotencyKey);
};

/** Find the highest level status from this statusId. */
const getRootNode = (state, statusId) => {
  let current = statusId;
  const seen = new Set();
  while (current) {
    if (seen.has(current)) return current; // cycle protection
    seen.add(current);
    const parent = state.inReplyTos[current];
    if (!parent) return current;
    current = parent;
  }
  return current;
};

/** Insert a fake status ID connecting descendant to ancestor. */
const insertTombstone = (state, ancestorId, descendantId) => {
  const tombstoneId = `${descendantId}-tombstone`;
  importStatusHelper(state, { id: tombstoneId, in_reply_to_id: ancestorId });
  importStatusHelper(state, { id: descendantId, in_reply_to_id: tombstoneId });
};


/** Route fromId to toId by inserting tombstones. */
const connectNodes = (state, fromId, toId) => {
  const fromRoot = getRootNode(state, fromId);
  const toRoot = getRootNode(state, toId);
  if (fromRoot !== toRoot) {
    insertTombstone(state, toId, fromId);
  }
};

/** Import a branch of ancestors or descendants, in relation to statusId. */
const importBranch = (state, statuses, statusId) => {
  if (!Array.isArray(statuses)) return;
  statuses.forEach((status, i) => {
    const prevId = statusId && i === 0 ? statusId : statuses[i - 1]?.id;

    if (status.in_reply_to_id) {
      importStatusHelper(state, status);
      if (statusId) connectNodes(state, status.id, statusId);
    } else if (prevId) {
      insertTombstone(state, prevId, status.id);
    }
  });
};

export const createContextsSlice = (setScoped, getScoped, rootSet, rootGet) => {

  return {
    ...getInitialState(),

    blockOrMuteAccountSuccess(relationship, statuses) {
      setScoped((state) => {
        const statusList = Array.isArray(statuses) ? statuses : [];
        
        const ownedStatusIds = statusList
          .filter(s => s?.account?.id === relationship.id)
          .map(s => s.id)
          .filter(id => id != null);

        // Reuse the deletion logic
        getScoped().deleteStatusesFromContext(ownedStatusIds);
      });
    },

    fetchContextSuccess(id, ancestors, descendants) {
      setScoped((state) => {
        const anc = Array.isArray(ancestors) ? ancestors : [];
        const desc = Array.isArray(descendants) ? descendants : [];

        importBranch(state, anc);
        importBranch(state, desc, id);

        // Connect gap between the last ancestor and the current status
        if (anc.length > 0 && !state.inReplyTos[id]) {
          insertTombstone(state, anc[anc.length - 1].id, id);
        }
      });
    },

    deleteStatusesFromContext(idsArray) {
      setScoped((state) => {
        const ids = Array.isArray(idsArray) ? idsArray : [idsArray];
        
        ids.forEach((id) => {
          // 1. Remove from parent's reply set
          const parentId = state.inReplyTos[id];
          if (parentId && state.replies[parentId]) {
            state.replies[parentId].delete(id);
            if (state.replies[parentId].size === 0) delete state.replies[parentId];
          }

          // 2. Dereference children
          const children = state.replies[id];
          if (children) {
            children.forEach(childId => {
              delete state.inReplyTos[childId];
            });
          }

          // 3. Cleanup primary entries
          delete state.inReplyTos[id];
          delete state.replies[id];
        });
      });
    },

    createContextStatusRequest(params, idempotencyKey) {
      setScoped((state) => {
        const id = `末pending-${idempotencyKey}`;
        const inReplyToId = params?.in_reply_to_id;
        if (!inReplyToId) return;

        state.inReplyTos[id] = inReplyToId;
        if (!state.replies[inReplyToId]) state.replies[inReplyToId] = new Set();
        state.replies[inReplyToId].add(id);
      });
    },

    createContextStatusSuccess(status, idempotencyKey) {
      setScoped((state) => {
        deletePendingStatus(state, status, idempotencyKey);
      });     
    },

    importContextStatus(status, idempotencyKey) {
      setScoped((state) => {
        importStatusHelper(state, status, idempotencyKey);
      });
    },

    importContextStatuses(statuses) {
      setScoped((state) => {
        const list = Array.isArray(statuses) ? statuses : [];
        list.forEach((s) => importStatusHelper(state, s));
      });
    },
  };
};

export default createContextsSlice;
