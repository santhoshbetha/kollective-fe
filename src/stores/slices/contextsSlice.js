// contextsSlice.js
// Simple slice to store and manage "contexts" (e.g., conversation contexts, threads, scenes)

const initialState = {
  // Map childId -> parentId
  inReplyTos: {},
  // Map parentId -> Set(childId)
  replies: {},
};

import { asArray } from "../../utils/immutableSafe";

const deletePendingStatus = (state, params, idempotencyKey) => {
  const id = `末pending-${idempotencyKey}`;
  const inReplyToId = params && params.in_reply_to_id;

  // remove mapping for the pending id
  if (state.inReplyTos && state.inReplyTos[id]) {
    const parent = state.inReplyTos[id];
    delete state.inReplyTos[id];
    if (parent && state.replies[parent]) {
      state.replies[parent].delete(id);
      if (state.replies[parent].size === 0) delete state.replies[parent];
    }
  }

  // also handle provided inReplyToId case
  if (inReplyToId && state.replies[inReplyToId]) {
    state.replies[inReplyToId].delete(id);
    if (state.replies[inReplyToId].size === 0) delete state.replies[inReplyToId];
  }
};

/** Import a single status into the reducer, setting replies and replyTos. */
const importStatusHelper = (state, status, idempotencyKey) => {
  const id = status && (status.id || status.id === 0 ? status.id : null);
  const inReplyToId = status && status.in_reply_to_id;
  if (!id || !inReplyToId) return;

  // add to inReplyTos
  state.inReplyTos[id] = inReplyToId;

  // add to replies set
  if (!state.replies[inReplyToId]) state.replies[inReplyToId] = new Set();
  state.replies[inReplyToId].add(id);

  if (idempotencyKey) deletePendingStatus(state, status, idempotencyKey);
};

/** Find the highest level status from this statusId. */
const getRootNode = (state, statusId, initialId = statusId) => {
  let current = statusId;
  const seen = new Set();
  while (true) {
    if (seen.has(current)) return current; // cycle
    seen.add(current);
    const parent = state.inReplyTos[current];
    if (!parent) return current;
    if (parent === initialId) return parent;
    current = parent;
  }
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
  if (!statuses || !Array.isArray(statuses)) return;
  statuses.forEach((status, i) => {
    const prevId = statusId && i === 0 ? statusId : (statuses[i - 1] || {}).id;

    if (status.in_reply_to_id) {
      importStatusHelper(state, status);

      if (statusId) {
        connectNodes(state, status.id, statusId);
      }
    } else if (prevId) {
      insertTombstone(state, prevId, status.id);
    }
  });
};

export const createContextsSlice = (setScoped, getScoped, rootSet, rootGet) => {
  const set = setScoped;

  return {
    ...initialState,

    blockOrMuteAccountSuccess(relationship, statuses) {
      set((state) => {
        const arr = asArray(statuses);

        const ownedStatusIds = arr
          .filter((status) => status && status.account && status.account.id === relationship.id)
          .map((status) => (status && (status.id ?? null)))
          .filter((id) => id !== null && id !== undefined);

        ownedStatusIds.forEach((id) => {
          // 1. Delete from its parent's tree
          const parentId = state.inReplyTos[id];

          if (parentId && state.replies[parentId]) {
            state.replies[parentId].delete(id);
            if (state.replies[parentId].size === 0) delete state.replies[parentId];
          }

          // 2. Dereference children
          const replies = state.replies[id];
          if (replies) {
            replies.forEach((replyId) => {
              // Delete the 'inReplyTo' reference for each child
              delete state.inReplyTos[replyId];
            });
          }

          // 3. Delete the primary entries for the ID
          delete state.inReplyTos[id];
          delete state.replies[id];
        });
      });
    },

    fetchContextSuccess(id, ancestors, descendants) {
      set((state) => {
        const anc = asArray(ancestors);
        const desc = asArray(descendants);

        importBranch(state, anc);
        importBranch(state, desc, id);

        if (anc.length > 0 && !state.inReplyTos[id]) {
          insertTombstone(state, anc[anc.length - 1].id, id);
        }
      });
    },

    deleteStatusesFromContext(idsArray) {
      set((state) => {
        const ids = asArray(idsArray);
        ids.forEach((id) => {
          // 1. Delete from its parent's tree
          const parentId = state.inReplyTos[id];
          if (parentId && state.replies[parentId]) {
            state.replies[parentId].delete(id);
            if (state.replies[parentId].size === 0) delete state.replies[parentId];
          }

          // 2. Dereference children
          const replies = state.replies[id];
          if (replies) {
            replies.forEach((replyId) => {
              // Delete the 'inReplyTo' reference for each child
              delete state.inReplyTos[replyId];
            });
          }

          // 3. Delete the primary entries for the ID
          delete state.inReplyTos[id];
          delete state.replies[id];
        });
      });
    },

    createContextStatusRequest(params, idempotencyKey) {
      set((state) => {
        // create a pending status mapping
        const id = `末pending-${idempotencyKey}`;
        const inReplyToId = params && params.in_reply_to_id;
        if (!inReplyToId) {
          return state;
        }

        // add to inReplyTos
        state.inReplyTos[id] = inReplyToId;

        // add to replies set
        if (!state.replies[inReplyToId]) {
          state.replies[inReplyToId] = new Set();
        }
        state.replies[inReplyToId].add(id);
      });
    },

    createContextStatusSuccess(status, idempotencyKey) {
      set((state) => {
            deletePendingStatus(state, status, idempotencyKey);
        });     
    },

    importStatus(status, idempotencyKey) {
      set((state) => {
            importStatusHelper(state, status, idempotencyKey);
        });
    },

    importStatuses(statuses) {
      set((state) => {
        asArray(statuses).forEach((status) => importStatusHelper(state, status));
      });
    },
   };
};

export default createContextsSlice;
