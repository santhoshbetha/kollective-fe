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

const normalizeConversation = (item) => {
  if (!item?.id) return null;
  return {
    id: item.id,
    unread: !!item.unread,
    accounts: (item.accounts || []).map((a) => a?.id || a),
    last_status: item.last_status?.id || null,
    last_status_created_at: item.last_status?.created_at || null,
  };
};

const sortConversations = (items) => {
  return items.sort((a, b) => {
    const aTime = a.last_status_created_at ? new Date(a.last_status_created_at).getTime() : 0;
    const bTime = b.last_status_created_at ? new Date(b.last_status_created_at).getTime() : 0;
    return bTime - aTime; // Newest first
  });
};



export function createConversationsSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();
  return {
    // --- State ---
    items: [],
    isLoading: false,
    hasMore: true,
    next: null,
    mounted: 0,

    fetchConversationsRequest() {
      setScoped((state) => { state.isLoading = true; });
    },

    fetchConversationsFail() {
      setScoped((state) => { state.isLoading = false; });
    },

    fetchConversationsSuccess(conversations, next, isLoadingRecent = false) {
      setScoped((state) => {
        const incoming = (Array.isArray(conversations) ? conversations : [conversations])
          .map(normalizeConversation)
          .filter(Boolean);

        // Merge logic: Update existing or push new
        incoming.forEach((newItem) => {
          const index = state.items.findIndex((ex) => ex.id === newItem.id);
          if (index !== -1) {
            state.items[index] = newItem;
          } else {
            state.items.push(newItem);
          }
        });

        sortConversations(state.items);
        
        state.isLoading = false;
        state.next = next || null;
        state.hasMore = !!next;
        state.isLoadingRecent = !!isLoadingRecent;
      });
    },

    updateConversationAction(conversation) {
      const newItem = normalizeConversation(conversation);
      if (!newItem) return;

      setScoped((state) => {
        const index = state.items.findIndex((item) => item.id === newItem.id);
        if (index === -1) {
          state.items.unshift(newItem);
        } else {
          state.items[index] = newItem;
        }
        sortConversations(state.items);
      });
    },

    mountConversations: () => {
      setScoped((state) => { state.mounted += 1; });
    },

    unmountConversations: () => {
      setScoped((state) => { state.mounted = Math.max(0, state.mounted - 1); });
    },

    readConversations: (conversationId) => {
      setScoped((state) => {
        const item = state.items.find((x) => x.id === conversationId);
        if (item) item.unread = false;
      });
    },

    async markConversationRead(conversationId) {
      const actions = getActions();
      if (!isLoggedIn(rootGet())) return;

      // Optimistic update
      actions.readConversations(conversationId);

      try {
        await fetch(`/api/v1/conversations/${conversationId}/read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("Failed to mark conversation as read:", err);
      }
    },

    async expandConversations(maxId) {
      const actions = getActions();
      const state = rootGet();
      if (!isLoggedIn(state)) return;

      const params = {};
      if (maxId) {
        params.max_id = maxId;
      } else if (state.conversations.items.length > 0) {
        // Corrected: Standard JS array access
        params.since_id = state.conversations.items[0].id;
      }

      const isLoadingRecent = !!params.since_id;
      actions.fetchConversationsRequest();

      try {
        const res = await fetch(`/api/v1/conversations?${new URLSearchParams(params)}`);
        if (!res.ok) throw new Error(res.status);
        
        const data = await res.json();
        const next = res.pagination?.().next;

        // Extract and import accounts/statuses via root actions
        const accounts = data.flatMap(item => item.accounts || []);
        const statuses = data.map(item => item.last_status).filter(Boolean);

        actions.importFetchedAccounts?.(accounts);
        actions.importFetchedStatuses?.(statuses);
        
        actions.fetchConversationsSuccess(data, next, isLoadingRecent);
      } catch (err) {
        console.error("Failed to expand conversations:", err);
        actions.fetchConversationsFail();
      }
    },

    updateConversations(conversation) {
      const actions = getActions();
      actions.importFetchedAccounts?.(conversation.accounts || []);
      if (conversation.last_status) {
        actions.importFetchedStatuses?.([conversation.last_status]);
      }
      actions.updateConversationAction(conversation);
    }
  };
}
