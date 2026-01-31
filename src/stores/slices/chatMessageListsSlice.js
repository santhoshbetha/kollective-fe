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
      setScoped((state) => {
        // 1. Ensure the specific chat object exists
        if (!state[chatId]) {
          // Initialize with default record values if missing
          state[chatId] = { items: [], pendingItems: [] }; 
        }

        const chat = state[chatId];

        // 2. Immer Mutation: Push the new UUID to the chat's item list
        // This replaces the 'updateList' helper entirely
        if (!chat.items.includes(uuid)) {
          chat.items.push(uuid);
        }
        
        // If you track pending messages separately:
        // chat.pendingItems.push(uuid);
      });
    },

  fetchOrExpandChatsSuccess(chats) {
      setScoped((state) => {
        // 1. Ensure chats is an array before iterating
        if (!Array.isArray(chats)) return;

        chats.forEach((chat) => {
          // 2. Initialize the chat record if it doesn't exist yet
          if (!state[chat.id]) {
            state[chat.id] = { items: [], last_message: null }; 
          }

          // 3. Update the specific chat record
          if (chat.last_message) {
            const chatRecord = state[chat.id];
            
            // Replaces updateList logic: 
            // If the message ID isn't already in the items list, add it.
            const messageId = chat.last_message.id;
            if (!chatRecord.items.includes(messageId)) {
              // Push to the end or unshift to the beginning based on your UI needs
              chatRecord.items.unshift(messageId);
            }
            
            // Store the actual last_message object/metadata
            chatRecord.last_message = chat.last_message;
          }
        });
      });
    },

    chatStreamingUpdate(chat, me) {
      // 1. Guard clause: Only update if it's a message from someone else
      if (!chat.last_message || chat.last_message.account_id === me) {
        return;
      }

      setScoped((state) => {
        const chatId = chat.id;
        const messageId = chat.last_message.id;

        // 2. Ensure the chat record exists in our scoped state
        if (!state[chatId]) {
          // Initialize with your default TimelineRecord-like structure
          state[chatId] = { items: [], unread: 0, last_message: null };
        }

        const chatRecord = state[chatId];

        // 3. Update the items list (replaces updateList)
        if (!chatRecord.items.includes(messageId)) {
          // Add new message to the top of the list
          chatRecord.items.unshift(messageId);
          
          // Optional: Increment unread count for streaming updates
          chatRecord.unread += 1;
        }

        // 4. Update metadata
        chatRecord.last_message = chat.last_message;
      });
    },

    fetchChatMessagesSuccess(chatId, chatMessages) {
      // 1. Validate inputs
      if (!chatId || !Array.isArray(chatMessages)) return;

      setScoped((state) => {
        // 2. Ensure the chat record exists
        if (!state[chatId]) {
          state[chatId] = { items: [] }; // Initialize with default structure
        }

        const chatRecord = state[chatId];
        const newMessageIds = chatMessages.map((msg) => msg.id);

        // 3. Merge IDs and ensure uniqueness (OrderedSet behavior)
        // We use the mergeIds helper we created earlier
        chatRecord.items = [...new Set([...chatRecord.items, ...newMessageIds])];
        
        // Optional: Sort if the API doesn't guarantee order
        // chatRecord.items.sort((a, b) => b.localeCompare(a)); 
      });
    },

    sendChatMessageSuccess(chatId, uuid, chatMessage) {
      setScoped((state) => {
        // 1. Find the specific chat record
        const chat = state[chatId];

        if (!chat) return; // If chat doesn't exist, Immer does nothing

        // 2. Replace the temporary UUID with the real Message ID
        // Standard JS Array.indexOf + direct assignment
        const index = chat.items.indexOf(uuid);
        if (index !== -1) {
          chat.items[index] = chatMessage.id;
        } else if (!chat.items.includes(chatMessage.id)) {
          // Fallback: If UUID isn't found, just add the new ID
          chat.items.push(chatMessage.id);
        }

        // 3. Sort the items (replacing idComparator)
        // Since it's a standard array, we sort it in place
        chat.items.sort((a, b) => b.localeCompare(a)); 

        // 4. Update the last_message metadata
        chat.last_message = chatMessage;
      });
    },

    deleteChatMessageSuccess(chatId, messageId) {
      setScoped((state) => {
        // 1. Find the specific chat record
        const chat = state[chatId];

        // 2. If chat doesn't exist, Immer simply finishes without changes
        if (!chat || !chat.items) return;

        // 3. Immer Mutation: Filter the array to remove the messageId
        // This is the standard JS equivalent of Set.delete()
        chat.items = chat.items.filter(id => id !== messageId);
        
        // 4. Optional: If you also store the last_message object, 
        // check if it needs to be cleared or updated
        if (chat.last_message?.id === messageId) {
          chat.last_message = null; 
        }
      });
    },
  };
};

export default createChatMessageListsSlice;
