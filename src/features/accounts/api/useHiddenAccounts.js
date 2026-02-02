import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useBlockedAccounts = () => {
  return useInfiniteQuery({
    queryKey: ['accounts', 'blocks'],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get('/api/v1/blocks', {
        params: { max_id: pageParam, limit: 40 }
      });
      return data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage[lastPage.length - 1]?.id,
  });
};

// Similar hook for Mutes using '/api/v1/mutes'
