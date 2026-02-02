import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { extractMaxIdFromLink } from '@/utils/apiUtils';
import { useStatusImporter } from '@/features/statuses/hooks/useStatusImporter';

export const useEventParticipants = (eventId) => {
  const { importAccounts } = useStatusImporter();

  return useInfiniteQuery({
    // Unique key for participants of a specific event
    queryKey: ['events', eventId, 'participants'],
    queryFn: async ({ pageParam }) => {
      const response = await api.get(`/api/v1/pleroma/events/${eventId}/participations`, {
        params: { max_id: pageParam, limit: 40 }
      });

      const data = response.data;

      // SIDE-LOADING: Seed the global account cache
      // Replaces dispatch(importFetchedAccounts(data))
      importAccounts(data);

      return {
        participants: data,
        nextMaxId: extractMaxIdFromLink(response.headers.get('Link')),
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextMaxId ?? undefined,
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5, // Participants list is stable for 5 mins
  });
};


/*
const EventParticipants = ({ eventId }) => {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading 
  } = useEventParticipants(eventId);

  if (isLoading) return <Spinner />;

  return (
    <div className="participants-list">
      <h4>Participants</h4>
      {data?.pages.map((page) => 
        page.participants.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))
      )}

      {hasNextPage && (
        <button 
          onClick={() => fetchNextPage()} 
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  );
};

*/

//==================================================================================
//expandEventParticipations  -- not required
// /The logic for tracking the next URL and fetching subsequent pages is now fully 
// encapsulated within the useInfiniteQuery hook we built for participants.
//In TanStack Query, you don't need to manually check getState().user_lists for a URL. You simply 
// call fetchNextPage(), and the hook uses the nextMaxId extracted from the previous response's headers.

/*
// This component replaces the need for the expandEventParticipations thunk
const ParticipantsList = ({ eventId }) => {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useEventParticipants(eventId);

  return (
    <div>
      {data?.pages.map(page => 
        page.participants.map(account => (
          <AccountCard key={account.id} account={account} />
        ))
      )}

      {/* REPLACES expandEventParticipations logic *//*}
      {hasNextPage && (
        <button 
          onClick={() => fetchNextPage()} 
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </button>
      )}
    </div>
  );
};

*/