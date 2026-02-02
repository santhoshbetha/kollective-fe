import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useStatusImporter } from '@/features/statuses/hooks/useStatusImporter';

export const useDirectTimeline = (accountId) => {
  const { importStatusEntities } = useStatusImporter();

  return useInfiniteQuery({
    // Cache key includes accountId so each chat has its own history
    queryKey: ['statuses', 'direct', accountId],
    queryFn: async ({ pageParam }) => {
      const response = await api.get('/api/v1/timelines/direct', {
        params: { max_id: pageParam, limit: 40 }
      });

      const statuses = response.data;

      // SIDE-LOADING: Ensure avatars and profiles are cached
      importStatusEntities(statuses);

      // Filter: Only keep statuses between me and this specific account
      // (The API returns ALL DMs, so we filter for the active conversation)
      const filtered = statuses.filter(s => 
        s.account.id === accountId || s.mentions.some(m => m.id === accountId)
      );

      return {
        items: filtered,
        nextMaxId: extractMaxIdFromLink(response.headers.get('Link')),
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextMaxId ?? undefined,
    enabled: !!accountId,
    // Poll for new messages every 15 seconds while the chat is open
    refetchInterval: 15000, 
  });
};

/*
// Sending a Direct Message
//To send a message, use your existing useCreateStatus hook but ensure the visibility is set to direct.

const { mutate: sendMessage } = useCreateStatus();

const handleSend = (text) => {
  sendMessage({
    status: `@${targetUsername} ${text}`,
    visibility: 'direct',
    in_reply_to_id: lastMessageId,
  }, {
    onSuccess: () => {
      // Invalidate the chat history to show the new message
      queryClient.invalidateQueries({ queryKey: ['statuses', 'direct', accountId] });
    }
  });
};

*/