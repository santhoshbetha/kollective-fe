import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useChats = () => {
  return useQuery({
    queryKey: ['chats', 'list'],
    queryFn: () => api.get('/api/v1/pleroma/chats').then(res => res.data),
    // Poll for new chat entries every 30s
    refetchInterval: 30000,
  });
};

//===============================================================================
// src/features/chats/api/useChats.js
export const useChats = () => {
  // Get instance features from our Instance Query
  const { data: instance } = useInstance(); 
  const hasV2 = instance?.pleroma?.metadata?.features?.includes('chatsV2');

  return useInfiniteQuery({
    queryKey: ['chats', 'list'],
    queryFn: async ({ pageParam }) => {
      // Logic from fetchChatsV1/V2
      const endpoint = hasV2 ? '/api/v2/pleroma/chats' : '/api/v1/pleroma/chats';
      const response = await api.get(endpoint, {
        params: { max_id: pageParam, limit: 20 }
      });
      
      return {
        items: response.data,
        next: extractMaxIdFromLink(response.headers.get('Link'))
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.next,
  });
};

//===============================================================================
//makeGetChat

// src/features/chats/api/useChats.js
export const useChatDetail = (chatId) => {
  return useQuery({
    queryKey: ['chats', 'detail', chatId],
    queryFn: () => api.get(`/api/v1/pleroma/chats/${chatId}`).then(res => res.data),
    select: (chat) => {
      if (!chat) return null;
      // Derived data: pull the participant account and last message from cache
      return {
        ...chat,
        account: chat.account, 
        last_message: queryClient.getQueryData(['chat_messages', chat.last_message_id])
      };
    }
  });
};

