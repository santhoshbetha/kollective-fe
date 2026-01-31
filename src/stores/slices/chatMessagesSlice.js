import { normalizeChatMessage } from "../../normalizers/chat-message";

export const createChatMessagesSlice = (
  setScoped,
  getScoped,
  rootSet,
  rootGet,
) => {

  const getActions = () => rootGet();

  // Helper to avoid code duplication
  const importLastMessages = (state, chats) => {
    if (!Array.isArray(chats)) return;

    chats.forEach((chat) => {
      if (chat.last_message) {
        // 1. Normalize to a Plain Old JavaScript Object (POJO)
        const msg = normalizeChatMessage(chat.last_message);
        
        // 2. Immer Mutation: Store the message in the dictionary
        // This makes it available for the UI to look up by ID
        state[msg.id] = msg;
      }
    });
  };

  return {
    sendChatMessage(uuid, chatId, me, params) {
      const actions = getActions();
      if (!uuid) return;

      // 1. Construct the optimistic payload
      const payload = {
        id: uuid,
        chat_id: chatId,
        account_id: me,
        content: params?.content ?? "",
        created_at: new Date().toISOString(),
        pending: true,
      };

      // 2. Normalize (Keep this as a pure JS utility)
      const msg = normalizeChatMessage(payload);

      // 3. Immer Mutation
      setScoped((state) => {
        // Because of setScoped, state is already state.chatMessages
        // We store the message by its temporary UUID
        state[uuid] = msg;
      });
      
      // 4. Update the chat list (Cross-slice call)
      // We notify the chats slice to add this temporary ID to the list
      actions.sendChatMessageRequest?.(chatId, uuid);
    },

    fetchChatsSuccess(chats) {
      setScoped((state) => importLastMessages(state, chats));
    },

    expandChatsSuccess(chats) {
      setScoped((state) => importLastMessages(state, chats));
    },

    fetchChatMessagesSuccess(chatMessages) {
      if (!Array.isArray(chatMessages)) return;

      setScoped((state) => {
        chatMessages.forEach((chatMessage) => {
          // 1. Normalize to a standard JS object
          const msg = normalizeChatMessage(chatMessage);
          
          // 2. Direct assignment (replaces Immutable .set)
          state[msg.id] = msg;
        });
      });
    },

    sendChatMessageSuccess(tempUuid, chatMessage) {
      if (!tempUuid || !chatMessage) return;

      const msg = normalizeChatMessage(chatMessage);

      setScoped((state) => {
        // 1. Remove the temporary optimistic entry
        // Standard JS 'delete' works perfectly inside Immer drafts
        if (state[tempUuid]) {
          delete state[tempUuid];
        }

        // 2. Store the confirmed message from the server
        const id = msg.id || tempUuid;
        state[id] = msg;
      });
    },

    updateStreamingChat(chat) {
      if (!chat?.last_message) return;

      setScoped((state) => {
        // 1. Normalize the incoming streaming message
        const msg = normalizeChatMessage(chat.last_message);
        
        // 2. Direct assignment (Upsert: updates if exists, creates if not)
        state[msg.id] = msg;
      });
    },

    deleteChatMessageRequest(messageId) {
      if (!messageId) return;

      setScoped((state) => {
        const existing = state[messageId];
        if (!existing) return;

        // 3. Optimistic Update: Set loading flags
        // With Immer, we just modify the properties on the draft object.
        // We don't need to return {...existing} because Immer handles it.
        state[messageId].pending = true;
        state[messageId].deleting = true;
      });
    },

    deleteChatMessageSuccess(messageId) {
      if (!messageId) return;

      setScoped((state) => {
        // 4. Final Cleanup: Remove the message from the dictionary
        // Native JS 'delete' is safe and clean inside an Immer draft
        if (state[messageId]) {
          delete state[messageId];
        }
      });
    }
  };
};
