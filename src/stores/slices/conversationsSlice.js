import { isLoggedIn } from "../../utils/auth";

// Helper: convert API conversation entity into a plain conversation record
const conversationToMap = (item) => {
  if (!item || !item.id) return null;
  return {
    id: item.id,
    unread: !!item.unread,
    accounts: Array.isArray(item.accounts)
      ? item.accounts.map((a) => (a && a.id ? a.id : a))
      : [],
    last_status: item.last_status ? item.last_status.id : null,
    last_status_created_at: item.last_status
      ? item.last_status.created_at
      : null,
  };
};

const expandNormalizedConversations = (
  state,
  conversations,
  next,
  isLoadingRecent,
) => {
  // Defensive: ensure conversations is an array and map to normalized items
  const incomingItems = Array.isArray(conversations)
    ? conversations.map(conversationToMap).filter(Boolean)
    : conversations
      ? [conversationToMap(conversations)].filter(Boolean)
      : [];

  // Start from existing items (ensure array)
  const existing = Array.isArray(state.items) ? state.items : [];

  // Merge: replace existing items when incoming has same id
  // existingById retained for potential future use
  // const existingById = new Map(existing.map((it) => [it && it.id, it]));

  // Use a map to avoid duplicates and preserve incoming priority
  const mergedMap = new Map();

  // First, add/replace with updated incoming items
  for (const it of incomingItems) {
    if (!it || !it.id) continue;
    mergedMap.set(it.id, it);
  }

  // Then add existing items that weren't in incoming
  for (const it of existing) {
    if (!it || !it.id) continue;
    if (!mergedMap.has(it.id)) mergedMap.set(it.id, it);
  }

  // Build array and sort by `last_status_created_at` (newest first)
  const updatedList = Array.from(mergedMap.values()).sort((a, b) => {
    const aDate =
      a && a.last_status_created_at
        ? new Date(a.last_status_created_at).getTime()
        : null;
    const bDate =
      b && b.last_status_created_at
        ? new Date(b.last_status_created_at).getTime()
        : null;

    if (aDate === bDate) return 0;
    if (aDate === null) return 1; // nulls go last
    if (bDate === null) return -1;
    // Newest first
    return bDate - aDate;
  });

  // Determine pagination status: if `next` is truthy we have more, otherwise not
  const hasMore = Boolean(next);

  // Return the new state fragment (preserve other keys when applied by caller)
  return {
    items: updatedList,
    isLoading: false,
    hasMore: hasMore,
    next: next,
    isLoadingRecent: !!isLoadingRecent,
  };
};

export function createConversationsSlice(setScoped, getScoped, rootSet, rootGet) {
  const initialState = {
    items: [], // Array of conversation objects
    isLoading: false,
    hasMore: true,
    mounted: 0,
  };

  return {
    ...initialState,

    fetchConversationsRequest() {
      setScoped((state) => ({ ...state, isLoading: true }));
    },

    fetchConversationsFail() {
      setScoped((state) => ({ ...state, isLoading: false }));
    },

    fetchConversationsSuccess(conversations, next, isLoadingRecent = false) {
      setScoped((state) => {
        const result = expandNormalizedConversations(
          state,
          conversations,
          next,
          isLoadingRecent,
        );
        return { ...state, ...result };
      });
    },

    // Define the action within the interface
    updateConversation: (conversation) => {
      const newItem = conversationToMap(conversation);
      if (!newItem || !newItem.id) return;

      setScoped((state) => {
        const items = Array.isArray(state.items) ? state.items.slice() : [];
        const index = items.findIndex((x) => x && x.id === newItem.id);

        let nextItems;
        if (index === -1) nextItems = [newItem, ...items];
        else {
          nextItems = items.slice();
          nextItems[index] = newItem;
        }

        return { ...state, items: nextItems };
      });
    },

    mountConversations: () => {
      setScoped((state) => ({ ...state, mounted: (state.mounted || 0) + 1 }));
    },

    unmountConversations: () => {
      setScoped((state) => ({
        ...state,
        mounted: Math.max(0, (state.mounted || 1) - 1),
      }));
    },

    readConversations: (conversationOrId) => {
      setScoped((state) => {
        const items = Array.isArray(state.items) ? state.items.slice() : [];
        const id = conversationOrId && (conversationOrId.id ?? conversationOrId);
        if (id == null) {
          return state;
        }

        const idStr = String(id);
        const idx = items.findIndex((x) => x && String(x.id) === idStr);
        if (idx === -1) {
            return state;
        }

        const existing = items[idx] || {};
        if (!existing.unread) {
          return state; // no change
        }

        const updated = { ...existing, unread: false };
        items[idx] = updated;

        return { ...state, items };
      });
    },

    markConversationRead(conversationId) {
      const root = rootGet();
      if (!isLoggedIn(root)) {
        return;
      }

      this.readConversations(conversationId);

      fetch(`/api/v1/conversations/${conversationId}/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }).catch((error) => {
        console.error("Failed to mark conversation as read:", error);
      }); 
    },

    expandConversations(maxId) {
      const root = rootGet();
      if (!isLoggedIn(root)) {
        return;
      }

      const params = { max_id: maxId };

      if (!maxId) {
        params.since_id = root.conversations.items.getIn([0, 'id']);
      }

      const isLoadingRecent = !!params.since_id;

      fetch(`/api/v1/conversations?${new URLSearchParams(params)}`, {//TODO: check later
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const next = response.next();

        root.importer.importFetchedAccounts(data.reduce((aggr, item) => aggr.concat(item.accounts), []));
        root.importer.importFetchedStauses(data.map((item) => item.last_status).filter((x) => !!x));
        this.fetchConversationsSuccess(data, next, isLoadingRecent);
      })
      .catch((error) => {
        console.error("Failed to expand conversations:", error);
        this.fetchConversationsFail();
      }); 
    },

    updateConversations(conversation) {
      const root = rootGet();
      root.importer.importFetchedAccounts(conversation.accounts || []);
      if (conversation.last_status) {
        root.importer.importFetchedStauses([conversation.last_status]);
      }
      this.updateConversation(conversation);
    }
  };
}
