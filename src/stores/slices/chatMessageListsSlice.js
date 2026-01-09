// Manages lists of chat message IDs per chat (pagination, loading state)

const idComparator = (a, b) => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

// Merge message ids into the chat list stored on `state[chatId]`.
// `messageIds` may be an array of ids or objects with `id`.
const updateList = (state, chatId, messageIds) => {
  if (!chatId) return state;
  const current = state[chatId] || { items: new Set(), next: null, isLoading: false };
  const incoming = Array.isArray(messageIds)
    ? messageIds.map((m) => (m && (m.id ?? m)) || m)
    : [];

  // Merge into a Set to deduplicate, then sort for deterministic order
  const mergedSet = new Set([...Array.from(current.items || []), ...incoming.filter(Boolean)]);
  const mergedArray = Array.from(mergedSet).sort(idComparator);

  state[chatId] = {
    ...current,
    items: new Set(mergedArray),
  };
  return state;
};

// (helper: updateList is the canonical merger used by this slice)


export const createChatMessageListsSlice = (
  setScoped,
  getScoped,
  rootSet,
  rootGet,
) => {
  const set = setScoped;
  return {

    sendChatMessageRequest(chatId, uuid) {
      set((state) => updateList(state, chatId, [uuid]));
    },

    fetchOrExpandChatsSuccess(chats) {
      set((state) => {
        chats.forEach((chat) => {
          if (chat.last_message) {
            updateList(state, chat.id, chat.last_message);
          }
        });
      });
    },

    chatStreamingUpdate(chat, me) {
        set((state) => {    
            if (chat.last_message && chat.last_message.account_id !== me) {
                [chat.last_message].forEach((c) => {
                    updateList(state, c.id, c.last_message);
                });
            }  else {
                return state;
            } 
        }); 
    },

    fetchChatMessagesSuccess(chatId, chatMessages) {
      set((state) => updateList(state, chatId, chatMessages.map((chat) => chat.id)));
    },

    sendChatMessageSuccess(chatId, uuid, chatMessage) {
        set((state) => {
            // 1. Get the current IDs Set (equivalent to state.update(chatId, chat => ...))
            const currentIdsSet = state.chatLists[chatId];

            if (!currentIdsSet) {
                // If the chat doesn't exist, return current state unchanged
                return state;
            }

            // 2. Perform the delete and add operations (equivalent to .delete(oldId).add(newId))
            // Create a new Set to maintain immutability
            const intermediateSet = new Set(currentIdsSet);
            intermediateSet.delete(uuid);
            intermediateSet.add(chatMessage.id);

            // 3. Sort the combined list (equivalent to .sort(idComparator))
            // Convert Set to Array for sorting, then back to Set to maintain insertion order
            const sortedIdsArray = Array.from(intermediateSet);
            sortedIdsArray.sort(idComparator);
            const newIdsSet = new Set(sortedIdsArray);

            // 4. Return the new state object with the updated chat list slice
            return {
                chatLists: {
                    ...state.chatLists, // Keep all other chat lists
                    [chatId]: newIdsSet, // Overwrite the specific chat list with the new, sorted Set
                },
            };
        });
    },

    deleteChatMessageSuccess(chatId, messageId) {
      set((state) => {
        const currentIdsSet = state[chatId];
        if (!currentIdsSet) {
          // If the chat doesn't exist, return current state unchanged
          return state;
        }   
        // Create a new Set to maintain immutability
        const newIdsSet = new Set(currentIdsSet);
        newIdsSet.delete(messageId);   

        return {
          ...state,
          [chatId]: newIdsSet,
        };
      });
    }
  };
};

export default createChatMessageListsSlice;
