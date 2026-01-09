import { normalizeChatMessage } from '../normalizers/chat-message.js';
import { ChatKeys } from '../queries/keys/chat-keys.js';
import { queryClient } from '../queries/client.js';

import { compareDate } from './comparators.ts';
import { appendPageItem, flattenPages, sortQueryData, updatePageItem } from './queries.ts';

/**
 * Update the Chat entity inside the ChatSearch query.
 * @param newChat - Chat entity.
 */
const updateChatInChatSearchQuery = (newChat) => {
  updatePageItem(ChatKeys.chatSearch(), newChat, (o, n) => o.id === n.id);
};

/**
 * Re-order the ChatSearch query by the last message timestamp.
 */
const reOrderChatListItems = () => {
  sortQueryData(ChatKeys.chatSearch(), (chatA, chatB) => {
    return compareDate(
      chatA.last_message?.created_at,
      chatB.last_message?.created_at,
    );
  });
};

/**
 * Check if a Chat entity exists within the cached ChatSearch query.
 * @param chatId - String
 * @returns Boolean
 */
const checkIfChatExists = (chatId) => {
  const currentChats = flattenPages(
    queryClient.getQueryData(ChatKeys.chatSearch()),
  );

  return currentChats?.find((chat) => chat.id === chatId);
};

/**
 * Force a re-fetch of ChatSearch.
 */
const invalidateChatSearchQuery = () => {
  queryClient.invalidateQueries({
    queryKey: ChatKeys.chatSearch(),
  });
};

const updateChatListItem = (newChat) => {
  const { id: chatId, last_message: lastMessage } = newChat;

  const isChatAlreadyLoaded = checkIfChatExists(chatId);

  if (isChatAlreadyLoaded) {
    // If the chat exists in the client, let's update it.
    updateChatInChatSearchQuery(newChat);
    // Now that we have the new chat loaded, let's re-sort to put
    // the most recent on top.
    reOrderChatListItems();
  } else {
    // If this is a brand-new chat, let's invalid the queries.
    invalidateChatSearchQuery();
  }

  if (lastMessage) {
    // Update the Chat Messages query data.
    appendPageItem(ChatKeys.chatMessages(newChat.id), normalizeChatMessage(lastMessage));
  }
};

/** Get unread chats count. */
const getUnreadChatsCount = () => {
  const chats = flattenPages(
    queryClient.getQueryData(ChatKeys.chatSearch()),
  );

  return chats?.reduce((acc, chat) => acc + chat.unread, 0) ?? 0;
};

/** Update the query cache for an individual Chat Message */
const updateChatMessage = (chatMessage) => updatePageItem(
  ChatKeys.chatMessages(chatMessage.chat_id),
  normalizeChatMessage(chatMessage),
  (o, n) => o.id === n.id,
);

export { updateChatListItem, updateChatMessage, getUnreadChatsCount, reOrderChatListItems };