import { InfiniteData, keepPreviousData, useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';

import { useChatContext } from '../contexts/chat-context.jsx';
import { useStatContext } from '../contexts/stat-context.jsx';

import { useApi } from '../hooks/useApi.js';
import useBoundStore from '../stores/boundStore.js';
import { useFeatures } from '../hooks/useFeatures.js';
import { useOwnAccount } from '../hooks/useOwnAccount.js';
import { normalizeChatMessage } from '../normalizers/chat-message.js';
import { reOrderChatListItems, updateChatMessage } from '../utils/chats.js';
import { flattenPages, updatePageItem } from '../utils/queries.ts';

//import toast from 'soapbox/toast.tsx';

import { queryClient } from './client.ts';
import { useFetchRelationships } from './relationships.ts';

export const messageExpirationOptions = [604800, 1209600, 2592000, 7776000];

const MessageExpirationValues = Object.freeze({
  'SEVEN': messageExpirationOptions[0],
  'FOURTEEN': messageExpirationOptions[1],
  'THIRTY': messageExpirationOptions[2],
  'NINETY': messageExpirationOptions[3]
});

const ChatKeys = {
  chat: (chatId) => ['chats', 'chat', chatId],
  chatMessages: (chatId) => ['chats', 'messages', chatId],
  chatSearch: (searchQuery) => searchQuery ? ['chats', 'search', searchQuery] : ['chats', 'search'],
};

/** Check if item is most recent */
const isLastMessage = (chatMessageId) => {
  const queryData = queryClient.getQueryData(ChatKeys.chatSearch());
  const items = flattenPages(queryData);
  const chat = items?.find((item) => item.last_message?.id === chatMessageId);

  return !!chat;
};

const useChatMessages = (chat) => {
  const api = useApi();
  const isBlocked = useBoundStore((state) => state.relationships.getIn([chat.account.id, 'blocked_by']));

  const getChatMessages = async (chatId, pageParam) => {
    const nextPageLink = pageParam?.link;
    const uri = nextPageLink || `/api/v1/pleroma/chats/${chatId}/messages`;
    const response = await api.get(uri);
    const data = await response.json();

    const next = response.next();
    const hasMore = !!next;
    const result = data.map(normalizeChatMessage);

    return {
      result,
      link: next ?? undefined,
      hasMore,
    };
  };

  const queryInfo = useInfiniteQuery({
    queryKey: ChatKeys.chatMessages(chat.id),
    queryFn: ({ pageParam }) => getChatMessages(chat.id, pageParam),
    enabled: !isBlocked,
    gcTime: 0,
    staleTime: 0,
    initialPageParam: { link: undefined },
    getNextPageParam: (config) => {
      if (config.hasMore) {
        return { link: config.link };
      }

      return undefined;
    },
  });

  const data = flattenPages(queryInfo.data)?.reverse();

  return {
    ...queryInfo,
    data,
  };
};

const useChats = (search) => {
  const api = useApi();
  const features = useFeatures();
  const importFetchedAccounts = useBoundStore((state) => state.importFetchedAccounts);
  const { setUnreadChatsCount } = useStatContext();
  const fetchRelationships = useFetchRelationships();

  const getChats = async (pageParam) => {
    const endpoint = '/api/v1/chats';
    const nextPageLink = pageParam?.link;
    const uri = nextPageLink || endpoint;
    const response = await api.get(uri, {
      searchParams: search ? {
        search,
      } : undefined,
    });
    const data = await response.json();

    const next = response.next();
    const hasMore = !!next;

    setUnreadChatsCount(Number(response.headers.get('x-unread-messages-count')) || data.reduce((n, chat) => n + chat.unread, 0));

    // Set the relationships to these users in the redux store.
    fetchRelationships.mutate({ accountIds: data.map((item) => item.account.id) });
    importFetchedAccounts(data.map((item) => item.account));

    return {
      result: data,
      hasMore,
      link: next ?? undefined,
    };
  };

  const queryInfo = useInfiniteQuery({
    queryKey: ChatKeys.chatSearch(search),
    queryFn: ({ pageParam }) => getChats(pageParam),
    placeholderData: keepPreviousData,
    enabled: features.chats,
    initialPageParam: { link: undefined },
    getNextPageParam: (config) => {
      if (config.hasMore) {
        return { link: config.link };
      }

      return undefined;
    },
  });

  const data = flattenPages(queryInfo.data);

  const chatsQuery = {
    ...queryInfo,
    data,
  };

  const getOrCreateChatByAccountId = (accountId) => api.post(`/api/v1/chats/by-account-id/${accountId}`);

  return { chatsQuery, getOrCreateChatByAccountId };
};

const useChat = (chatId) => {
  const api = useApi();
  const importFetchedAccount = useBoundStore((state) => state.importFetchedAccount);
  const fetchRelationships = useFetchRelationships();

  const getChat = async () => {
    if (chatId) {
      const response = await api.get(`/api/v1/pleroma/chats/${chatId}`);
      const data = await response.json();

      fetchRelationships.mutate({ accountIds: [data.account.id] });
      importFetchedAccount(data.account);

      return data;
    }
  };

  return useQuery({
    queryKey: ChatKeys.chat(chatId),
    queryFn: getChat,
    gcTime: 0,
    enabled: !!chatId,
  });
};

const useChatActions = (chatId) => {
  const { account } = useOwnAccount();
  const api = useApi();

  const { setUnreadChatsCount } = useStatContext();

  const { chat, changeScreen } = useChatContext();

  const markChatAsRead = async (lastReadId) => {
    return api.post(`/api/v1/pleroma/chats/${chatId}/read`, { last_read_id: lastReadId })
      .then(async (response) => {
        const data = await response.json();
        updatePageItem(ChatKeys.chatSearch(), data, (o, n) => o.id === n.id);
        const queryData = queryClient.getQueryData(ChatKeys.chatSearch());

        if (queryData) {
          const flattenedQueryData = flattenPages(queryData)?.map((chat) => {
            if (chat.id === data.id) {
              return data;
            } else {
              return chat;
            }
          });
          setUnreadChatsCount(flattenedQueryData?.reduce((n, chat) => n + chat.unread, 0));
        }

        return data;
      })
      .catch(() => null);
  };

  const createChatMessage = useMutation({
    mutationFn: async ({ chatId, content, mediaIds }) => {
      const response = await api.post(`/api/v1/chats/${chatId}/messages`, {
        content,
        media_id: (mediaIds && mediaIds.length === 1) ? mediaIds[0] : undefined, // Pleroma backwards-compat
        media_ids: mediaIds,
      });
      return response.json();
    },
    retry: false,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ['chats', 'messages', variables.chatId],
      });

      // Snapshot the previous value
      const prevContent = variables.content;
      const prevChatMessages = queryClient.getQueryData(['chats', 'messages', variables.chatId]);
      const pendingId = String(Number(new Date()));

      // Optimistically update to the new value
      queryClient.setQueryData(ChatKeys.chatMessages(variables.chatId), (prevResult) => {
        const newResult = { ...prevResult };
        newResult.pages = newResult.pages.map((page, idx) => {
          if (idx === 0) {
            return {
              ...page,
              result: [
                normalizeChatMessage({
                  content: variables.content,
                  id: pendingId,
                  created_at: new Date(),
                  account_id: account?.id,
                  pending: true,
                  unread: true,
                }),
                ...page.result,
              ],
            };
          }

          return page;
        });

        return newResult;
      });

      return { prevChatMessages, prevContent, pendingId };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_error, variables, context) => {
      queryClient.setQueryData(['chats', 'messages', variables.chatId], context.prevChatMessages);
    },
    onSuccess: (data, variables, context) => {
      const nextChat = { ...chat, last_message: data };
      updatePageItem(ChatKeys.chatSearch(), nextChat, (o, n) => o.id === n.id);
      updatePageItem(
        ChatKeys.chatMessages(variables.chatId),
        normalizeChatMessage(data),
        (o) => o.id === context.pendingId,
      );
      reOrderChatListItems();
    },
  });

  const updateChat = useMutation({
    mutationFn: (data) => api.patch(`/api/v1/pleroma/chats/${chatId}`, data),
    onMutate: async (data) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ChatKeys.chat(chatId),
      });

      // Snapshot the previous value
      const prevChat = { ...chat };
      const nextChat = { ...chat, ...data };

      // Optimistically update to the new value
      queryClient.setQueryData(ChatKeys.chat(chatId), nextChat);

      // Return a context object with the snapshotted value
      return { prevChat };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_error, _newData, context) => {
      changeScreen('CHAT', context.prevChat.id);
      queryClient.setQueryData(ChatKeys.chat(chatId), context.prevChat);
      //toast.error('Chat Settings failed to update.');
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ChatKeys.chat(chatId) });
      queryClient.invalidateQueries({ queryKey: ChatKeys.chatSearch() });
      //toast.success('Chat Settings updated successfully');
    },
  });

  const deleteChatMessage = (chatMessageId) => api.delete(`/api/v1/chats/${chatId}/messages/${chatMessageId}`);

  const acceptChat = useMutation({
    mutationFn: () => api.post(`/api/v1/chats/${chatId}/accept`),
    async onSuccess(response) {
      const data = await response.json();
      changeScreen('CHAT', data.id);
      queryClient.invalidateQueries({ queryKey: ChatKeys.chat(chatId) });
      queryClient.invalidateQueries({ queryKey: ChatKeys.chatMessages(chatId) });
      queryClient.invalidateQueries({ queryKey: ChatKeys.chatSearch() });
    },
  });

  const deleteChat = useMutation({
    mutationFn: () => api.delete(`/api/v1/pleroma/chats/${chatId}`),
    onSuccess() {
      changeScreen('INBOX');
      queryClient.invalidateQueries({ queryKey: ChatKeys.chatMessages(chatId) });
      queryClient.invalidateQueries({ queryKey: ChatKeys.chatSearch() });
    },
  });

  const createReaction = useMutation({
    mutationFn: (data) => api.post(`/api/v1/pleroma/chats/${chatId}/messages/${data.messageId}/reactions`, {
      json: {
        emoji: data.emoji,
      },
    }),
    // TODO: add optimistic updates
    async onSuccess(response) {
      updateChatMessage(await response.json());
    },
  });

  const deleteReaction = useMutation({
    mutationFn: (data) => api.delete(`/api/v1/pleroma/chats/${chatId}/messages/${data.messageId}/reactions/${data.emoji}`),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ChatKeys.chatMessages(chatId) });
    },
  });

  return {
    acceptChat,
    createChatMessage,
    createReaction,
    deleteChat,
    deleteChatMessage,
    deleteReaction,
    markChatAsRead,
    updateChat,
  };
};

export { ChatKeys, useChat, useChatActions, useChats, useChatMessages, isLastMessage };
