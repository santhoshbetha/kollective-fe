import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useStatusImporter } from '@/features/statuses/hooks/useStatusImporter';

export const useConversations = () => {
  const { importStatusEntities } = useStatusImporter();

  return useInfiniteQuery({
    queryKey: ['conversations'],
    queryFn: async ({ pageParam }) => {
      const { data, headers } = await api.get('/api/v1/conversations', {
        params: { max_id: pageParam, limit: 20 }
      });

      // SIDE-LOADING: Conversations contain a 'last_status' object.
      // Seed the status/account cache so opening the chat is instant.
      const statuses = data.map(conv => conv.last_status).filter(Boolean);
      importStatusEntities(statuses);

      return {
        items: data,
        nextMaxId: extractMaxIdFromLink(headers.get('Link')),
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextMaxId ?? undefined,
    // Poll for new messages every 30 seconds if the user is active
    refetchInterval: 30000, 
  });
};

//==============================================================================
// src/features/conversations/api/useConversations.js
export const useConversations2 = () => {
  const { importStatusEntities } = useStatusImporter();

  return useInfiniteQuery({
    queryKey: ['conversations'],
    queryFn: async ({ pageParam }) => {
      const response = await api.get('/api/v1/conversations', {
        params: { max_id: pageParam, limit: 20 }
      });

      const data = response.data;

      // SIDE-LOADING: Extract accounts and statuses from conversation objects
      // Replaces the manual .reduce and .map logic in your thunk
      const accounts = data.flatMap(item => item.accounts);
      const lastStatuses = data.map(item => item.last_status).filter(Boolean);
      
      importStatusEntities(lastStatuses); // Seeds statuses and accounts caches
      
      return {
        items: data,
        nextMaxId: extractMaxIdFromLink(response.headers.get('Link')),
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextMaxId ?? undefined,
  });
};
