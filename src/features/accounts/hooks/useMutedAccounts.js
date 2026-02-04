import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { extractMaxIdFromLink } from '@/utils/apiUtils';

export const useMutedAccounts = () => {
  const queryClient = useQueryClient();

  return useInfiniteQuery({
    queryKey: ['accounts', 'mutes'],
    queryFn: async ({ pageParam }) => {
      // 1. Fetch muted users
      const response = await api.get('/api/v1/mutes', {
        params: { max_id: pageParam, limit: 40 }
      });

      const data = response.data;

      // 2. Pre-seed relationships to make the "Unmute" button ready
      const ids = data.map(acc => acc.id);
      if (ids.length > 0) {
        queryClient.prefetchQuery({
          queryKey: ['relationships', ids.sort()],
          queryFn: () => api.get('/api/v1/accounts/relationships', { params: { id: ids } })
        });
      }

      return {
        items: data,
        next: extractMaxIdFromLink(response.headers.get('Link')),
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.next ?? undefined,
  });
};
