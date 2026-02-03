import { normalizeId } from "../../utils/normalizers";
import { normalizeChat } from "../../normalizers/chat";

// Helper to safely read nested last_message id from various shapes (Immutable or plain)
// Safely extract the last message ID using standard optional chaining
const getLastMessageId = (chat) => {
  return chat?.last_message?.id || chat?.lastMessage?.id || null;
};

// Normalize chat object into a plain JS object
const fixChat = (chat) => {
  // 1. Use your existing normalizer
  // Ensure this returns a plain object!
  const normalized = normalizeChat(chat) || {};

  // 2. Ensure the ID is a stable string
  const id = normalizeId(normalized.id);

  // 3. defensive last_message handling
  const lastMessageId = chat?.last_message?.id || chat?.lastMessage?.id;

  return {
    ...normalized,
    id,
    last_message: normalizeId(lastMessageId),
  };
};

// Internal Immer helper to update the items dictionary
const performChatImport = (state, chat) => {
  const fixed = fixChat(chat);
  if (!fixed.id) return;
  
  if (!state.items) state.items = {};
  state.items[fixed.id] = fixed;
};

export function createChatsSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();
  return {
    // --- Initial State ---
    next: null,
    isLoading: false,
    items: {},
    error: null,

    // --- Synchronous Actions ---
    fetchOrExpandChatsRequest() {
      setScoped((state) => { state.isLoading = true; });
    },

    fetchOrExpandChatsSuccess(chats, next) {
      setScoped((state) => {
        if (next !== undefined) state.next = next;
        chats.forEach((chat) => performChatImport(state, chat));
        state.isLoading = false;
      });
    },

    ChatStreamingUpdate(chat) {
      setScoped((state) => {
        performChatImport(state, chat);
        state.isLoading = false;
      });
    },

    ReadChatRequest(chatId) {
      setScoped((state) => {
        if (state.items?.[chatId]) {
          state.items[chatId].unread = 0;
        }
      });
    },

    ReadChatRequest(chatId) {
      setScoped((state) => {
        if (chatId == null) return;
        if (!state.items) state.items = {};
        if (!state.items[chatId]) state.items[chatId] = {};
        state.items[chatId].unread = 0;
      });
    },

    ReadChatSuccess(chat) {
      setScoped((state) => {
        [chat].forEach((chat) => {
          importChat(state, chat);
        });
        state.isLoading = false;
      });
    },

    async fetchChatsV1(version = 'v1') {
      setScoped((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await fetch(`/api/${version}/kollective/chats`);
        if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

        const data = await response.json();
        
        // Handle pagination (standard JS Link header or custom property)
        const next = response.pagination?.().next || data.next;
        const items = Array.isArray(data) ? data : (data.items || []);

        // 1. Update this slice
        getActions().fetchOrExpandChatsSuccess(items, next);

        // 2. Cross-slice notifications (using uniquely named root actions)
        getActions().chatMessageListSync?.(items, next);
        getActions().chatMessagesImport?.(items);

        return items;
      } catch (e) {
        setScoped((state) => {
          state.isLoading = false;
          state.error = e.message;
        });
        return null;
      }
    },

    fetchChatsV2() {
      // Use getActions() instead of this
      return getActions().fetchChatsV1('v2');
    },

    fetchChats() {
      // Ensure the loading state is set first
      getActions().fetchOrExpandChatsRequest();
      
      // Delegate to the V1 fetcher with the 'v2' version string
      return getActions().fetchChatsV1('v2');
    },

    async markChatRead(chatId, lastReadId) {
      if (!chatId) return;
      const chat = getScoped().items[chatId];
      if (!chat || chat.unread < 1) return;

      const rid = lastReadId || chat.last_message;
      if (!rid) return;

      // Optimistic Update
      getActions().ReadChatRequest(chatId);

      try {
        const res = await fetch(`/api/v1/kollective/chats/${chatId}/read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ last_read_id: rid }),
        });
        
        if (!res.ok) throw new Error("API Read failed");
        const data = await res.json();
        
        // Final sync with server data
        getActions().ChatStreamingUpdate(data);
      } catch (e) {
        console.error("Failed to mark read", e);
      }
    },

    async openChat(chatId) {
      if (!chatId) return;
      const actions = getActions();
      const state = rootGet();

      // Reach into settings slice via root state
      const panes = state.settings?.chats?.panes || [];
      const idx = panes.findIndex(p => p.chat_id === chatId);

      await actions.markChatRead(chatId);

      if (idx > -1) {
        actions.changeSetting(['chats', 'panes', idx, 'open'], true);
      } else {
        const newPane = { chat_id: chatId, open: true, expanded: false };
        actions.changeSetting(['chats', 'panes'], [...panes, newPane]);
      }
    },

    closeChat(chatId) {
      const state = rootGet();
      const panes = state.settings?.chats?.panes || [];
      const filtered = panes.filter(p => p.chat_id !== chatId);
      getActions().changeSetting(['chats', 'panes'], filtered);
    },

    toggleMainWindow() {
      const state = rootGet();
      const current = state.settings?.chats?.mainWindow;
      const nextState = current === 'minimized' ? 'open' : 'minimized';
      getActions().changeSetting(['chats', 'mainWindow'], nextState);
    },


    async startChat(accountId) {
      if (!accountId) return null;

      try {
        const response = await fetch(`/api/v1/kollective/chats/by-account-id/${accountId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account_id: accountId }),
        });

        if (!response.ok) throw new Error(`Failed to start chat (${response.status})`);
        
        const data = await response.json();

        // Use root action to ensure all slices receive the new chat
        getActions().fetchOrExpandChatsSuccess([data]);
        
        return data;
      } catch (e) {
        console.error("Failed to start chat", e);
        return null;
      }
    },

    async deleteChatMessage(chatId, messageId) {
      if (!chatId || !messageId) return;
      
      const actions = getActions();

      // 1. Optimistic Update (Request state)
      actions.deleteChatMessageRequest?.(messageId);

      try {
        // Note: Corrected 'pi/v1/...' typo to '/api/v1/...'
        const response = await fetch(`/api/v1/kollective/chats/${chatId}/messages/${messageId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error(`Failed to delete message (${response.status})`);

        // 2. Success Coordination across slices
        actions.deleteChatMessageSuccess?.(chatId, messageId);
        actions.chatMessageListDeleteSuccess?.(chatId, messageId);
        
        return true;
      } catch (e) {
        console.error("Failed to delete chat message", e);
        // If failed, you might want an action to revert the 'deleting' state
        return false;
      }
    },

    async launchChat(accountId, router, forceNavigate) {
      const isMobile = window.innerWidth <= 1190;
      
      const chat = await getActions().startChat(accountId);
      
      if (chat?.id) {
        if (isMobile || forceNavigate) {
          router.push(`/chat/${chat.id}`);
        } else {
          // Open in a pane/window instead of navigating
          getActions().openChat(chat.id);
        }
      }
    }

  };
}

export default createChatsSlice;
