import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { extractMaxIdFromLink } from '@/utils/apiUtils';
import { useStatusImporter } from '@/features/statuses/hooks/useStatusImporter';

//fetchEventParticipationRequests
export const useEventParticipationRequests = (eventId) => {
  const { importAccounts } = useStatusImporter();

  return useInfiniteQuery({
    queryKey: ['events', eventId, 'participation-requests'],
    queryFn: async ({ pageParam }) => {
      const response = await api.get(`/api/v1/kollective/events/${eventId}/participation_requests`, {
        params: { max_id: pageParam, limit: 40 }
      });

      const data = response.data; // Array of { id, account, message, ... }

      // SIDE-LOADING: Extract and seed accounts from the requests
      // Replaces dispatch(importFetchedAccounts(data.map(({ account }) => account)))
      const accounts = data.map(item => item.account).filter(Boolean);
      importAccounts(accounts);

      return {
        requests: data,
        nextMaxId: extractMaxIdFromLink(response.headers.get('Link')),
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextMaxId ?? undefined,
    enabled: !!eventId,
  });
};

