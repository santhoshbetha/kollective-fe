import { normalizeId } from "../../utils/normalizers";
import { normalizeChat } from "../../normalizers/chat";
import { asPlain, getIn, getProp } from "../../utils/immutableSafe";

// Helper to safely read nested last_message id from various shapes (Immutable or plain)
const getLastMessageId = (chat) => {
  if (!chat) return null;
  const id = getIn(chat, ["last_message", "id"]) ?? getIn(chat, ["lastMessage", "id"]);
  if (id !== undefined && id !== null) return id;

  const lm = asPlain(getIn(chat, ["last_message"]) ?? getIn(chat, ["lastMessage"]) ?? getProp(chat, "last_message") ?? getProp(chat, "lastMessage"));
  if (!lm) return null;
  return getProp(lm, "id") ?? lm.id ?? null;
};

const fixChat = (chat) => {
  // normalizeChat returns a plain (shallow-frozen) object
  const normalized = normalizeChat(chat) || {};

  // determine last message id from original chat shape defensively
  const lastMessageId = getLastMessageId(chat);

  const out = {
    ...normalized,
    last_message: normalizeId(lastMessageId),
  };

  try {
    return Object.freeze(out);
  } catch {
    return out;
  }
};

const importChat = (state, chat) => {
  const fixed = fixChat(chat);
  const id = normalizeId(fixed.id);
  if (!id) return; // skip chats without stable ids

  if (!state.items) state.items = {};
  state.items[id] = fixed;
};

export function createChatsSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    next: null,
    isLoading: false,
    items: {},

    fetchOrExpandChatsRequest() {
      setScoped((state) => {
        state.isLoading = true;
      });
    },

    fetchOrExpandChatsSuccess(chats, next) {
      setScoped((state) => {
        if (next !== undefined) state.next = next;
        chats.forEach((chat) => {
          importChat(state, chat);
        });
        state.isLoading = false;
      });
    },

    ChatStreamingUpdate(chat) {
      setScoped((state) => {
        [chat].forEach((chat) => {
          importChat(state, chat);
        });
        state.isLoading = false;
      });
    },

    fetchChatSuccess(chat) {
      setScoped((state) => {
        [chat].forEach((chat) => {
          importChat(state, chat);
        });
        state.isLoading = false;
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
      // mark loading
      setScoped((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await fetch(`/api/${version}/pleroma/chats`);

        if (!response.ok) {
          throw new Error(`Failed to fetch chats from API (${response.status})`);
        }

        let data;
        let next = undefined;

        if (version === 'v1') {
          data = await response.json();
        } else {
          next = response.next();
          data = await response.json();
        }

        // Normalize response shape: support { items, next } or plain array
        const items = Array.isArray(data)
          ? data
          : data && Array.isArray(data.items)
          ? data.items
          : [];
          
        // Prefer calling the store action if `this` is bound, otherwise apply fallback logic
        if (typeof this?.fetchOrExpandChatsSuccess === "function") {
          this.fetchOrExpandChatsSuccess(items, next);

          // Also notify related slices if present on the root store
          const root = rootGet();
          if (root?.chatMessageLists && typeof root.chatMessageLists.fetchOrExpandChatsSuccess === "function") {
            root.chatMessageLists.fetchOrExpandChatsSuccess(items, next);
          }
          if (root?.chatMessages && typeof root.chatMessages.fetchChatsSuccess === "function") {
            root.chatMessages.fetchChatsSuccess(items);
          }
        } else {
          // Fallback: directly update scoped state like fetchOrExpandChatsSuccess
          setScoped((state) => {
            if (next !== undefined) state.next = next;
            items.forEach((chat) => {
              importChat(state, chat);
            });
            state.isLoading = false;
          });

          // Notify related slices via root store as best-effort
          const root = rootGet();
          if (root?.chatMessageLists && typeof root.chatMessageLists.fetchOrExpandChatsSuccess === "function") {
            root.chatMessageLists.fetchOrExpandChatsSuccess(items, next);
          }
          if (root?.chatMessages && typeof root.chatMessages.fetchChatsSuccess === "function") {
            root.chatMessages.fetchChatsSuccess(items);
          }
        }

        return items;
      } catch (e) {
        console.error("Failed to fetch chats", e);
        setScoped((state) => {
          state.isLoading = false;
          state.error = e && e.message ? e.message : true;
        });
        return null;
      }
    },

    fetchChatsV2() {
      // For Pleroma API v2, delegate to fetchChatsV1 for now
      return this.fetchChatsV1('v2');
    },

    fetchChats() {
      this.fetchOrExpandChatsRequest();
      return this.fetchChatsV1('v2');
    },

    markChatRead(chatId, lastReadId) {
      if (chatId == null) return;
      const chat = getScoped().items[chatId];
      if (!chat) return;
      if (lastReadId == null) {
        lastReadId = chat.last_message;
      }
      if (chat.unread < 1) return; // already read
      if (!lastReadId) return;

      this.ReadChatRequest(chatId);

      // Optimistically mark chat as read in the local store
      rootSet((state) => {
        if (!state.chats || !state.chats.items) return;
        const chat = state.chats.items[chatId];
        if (chat) {
          chat.unread = 0;
        }
      });

      // Send API request to mark chat as read
      fetch(`/api/v1/pleroma/chats/${chatId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          last_read_id: lastReadId,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to mark chat as read (${response.status})`);
          }
          return response.json();
        })
        .then((data) => {
          this.ReadChatSuccess(data);
        })
        .catch((e) => {
          console.error("Failed to mark chat as read", e);
          // Optionally, revert optimistic update on failure
        });
    },

    async openChat(chatId) {
        if (chatId == null) return;
        const root = rootGet();
        const panes = getIn(root.settings.getSettings(), ['chats', 'panes']) || [];
        const idx = panes.findIndex(pane => pane['chat_id'] === chatId);

        await this.markChatRead(chatId);

        if (idx > -1) {
          root.settings.changeSetting(['chats', 'panes', idx, 'state'], true);
        } else {
          const newPane = {
            chat_id: chatId,
            open: true,
            expanded: false,
          };
          root.settings.changeSetting(['chats', 'panes'], [...panes, newPane]);
        }
    },

    closeChat(chatId) {
        if (chatId == null) return;
        const root = rootGet();
        const panes = getIn(root.settings.getSettings(), ['chats', 'panes']) || [];
        const idx = panes.findIndex(pane => pane['chat_id'] === chatId);

        if (idx > -1) {
          root.settings.changeSetting(['chats', 'panes'], panes.delete(idx));
        }
    },

    toggleMainWindow() {
        const root = rootGet();
        const main = getIn(root.settings.getSettings(), ['chats', 'mainWindow']) || false;
        const state = main === 'minimized' ? 'open' : 'minimized';
        root.settings.changeSetting(['chats', 'mainWindow'], state);
    },

    async startChat(accountId) {
        return fetch(`/api/v1/pleroma/chats/by-account-id/${accountId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              account_id: accountId,
            }),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`Failed to start chat (${response.status})`);
              }
              return response.json();
            })
            .then((data) => {
              this.fetchOrExpandChatsSuccess([data]);
              return data;
            })
            .catch((e) => {
              console.error("Failed to start chat", e);
              return null;
            });
    },

    async deleteChatMessage(chatId, messageId) {
      if (chatId == null || messageId == null) return;
      const root = rootGet();
      root.chatMessages.deleteChatMessage(chatId, messageId);
      return fetch(`pi/v1/pleroma/chats/${chatId}/messages/${messageId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          }).then((response) => {
              if (!response.ok) {
                throw new Error(`Failed to delete chat message (${response.status})`);
              }
              root.chatMessages.deleteChatMessageSuccess(chatId, messageId);
              root.chatMessageLists.deleteChatMessageSuccess(chatId, messageId);
              return true;
            })
            .catch((e) => {
              console.error("Failed to delete chat message", e);
              return false;
            });
    },

    launchChat(accountId, router, forceNavigate) {
      const isMobile = (width) => width <= 1190;
      this.startChat(accountId).then((chat) => {
        if (chat && chat.id) {
          if (isMobile(window.innerWidth) || forceNavigate) {
            router.push(`/chat/${chat.id}`);
          } else {
            this.openChat(chat.id);
          }
        }
      });
    }

  };
}

export default createChatsSlice;
