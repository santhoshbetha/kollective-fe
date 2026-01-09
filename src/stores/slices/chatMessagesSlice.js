import { normalizeChatMessage } from "../../normalizers/chat-message";

export const createChatMessagesSlice = (
  setScoped,
  getScoped,
  rootSet,
  rootGet,
) => {
  return {
    sendChatMessage(uuid, chatId, me, params) {
      if (!uuid) return;

      const payload = {
        id: uuid,
        chat_id: chatId,
        account_id: me,
        content: params?.content ?? "",
        created_at: new Date().toISOString(),
        pending: true,
      };

      const msg = normalizeChatMessage(payload);

      setScoped((state) => {
        // store messages keyed by uuid
        state[uuid] = msg;
      });
    },

    fetchChatsSuccess(chats) {
      setScoped((state) => {
        chats.forEach((chat) => {
          if (chat.last_message) {
            const msg = normalizeChatMessage(chat.last_message);
            state[msg.id] = msg;
          }
        });
      });
    },

    expandChatsSuccess(chats) {
      setScoped((state) => {
        chats.forEach((chat) => {
          if (chat.last_message) {
            const msg = normalizeChatMessage(chat.last_message);
            state[msg.id] = msg;
          }
        });
      });
    },

    fetchChatMessagesSuccess(chatMessages) {
      setScoped((state) => {
        chatMessages.forEach((chatMessage) => {
          const msg = normalizeChatMessage(chatMessage);
          state[msg.id] = msg;
        });
      });
    },

    sendChatMessageSuccess(tempUuid, chatMessage) {
      if (!tempUuid || !chatMessage) return;

      const msg = normalizeChatMessage(chatMessage);

      setScoped((state) => {
        // Remove the temporary placeholder keyed by the client UUID
        if (state[tempUuid]) {
          try {
            delete state[tempUuid];
          } catch {
            // ignore if deletion fails for whatever reason
          }
        }

        // Store the confirmed message under its real id (fallback to tempUuid)
        const id = msg.id || tempUuid;
        state[id] = msg;
      });
    },

    updateStreamingChat(chat) {
      setScoped((state) => {
        if (chat.last_message) {
          const msg = normalizeChatMessage(chat.last_message);
          state[msg.id] = msg;
        }
      });
    },

    deleteChatMessageRequest(messageId) {
      if (!messageId) return;
      setScoped((state) => {
        const existing = state[messageId];
        if (!existing) return;

        // existing may be a frozen plain object; avoid mutating it directly.
        state[messageId] = {
          ...existing,
          pending: true,
          deleting: true,
        };
      });
    },

    deleteChatMessageSuccess(messageId) {
      if (!messageId) return;
      setScoped((state) => {
        if (state[messageId]) {
          try {
            delete state[messageId];
          } catch {
            // ignore if deletion fails for whatever reason
          }
        }
      });
    },
  };
};
