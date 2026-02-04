import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { extractMaxIdFromLink } from '@/utils/apiUtils';
import { useStatusImporter } from '../hooks/useStatusImporter';

export const useFollowRequests = () => {
  const { importAccounts } = useStatusImporter();

  return useInfiniteQuery({
    queryKey: ['accounts', 'follow-requests'],
    queryFn: async ({ pageParam }) => {
      const response = await api.get('/api/v1/follow_requests', {
        params: { max_id: pageParam, limit: 20 }
      });

      // SIDE-LOADING: Seed the account cache so clicking a profile is instant
      importAccounts(response.data);

      return {
        accounts: response.data,
        nextMaxId: extractMaxIdFromLink(response.headers.get('Link')),
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextMaxId ?? undefined,
    // Follow requests are sensitive; check frequently or on window focus
    staleTime: 1000 * 60 * 2, 
  });
};
