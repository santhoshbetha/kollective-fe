import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useStatusImporter } from '@/features/statuses/hooks/useStatusImporter';

export const useFavourites = () => {
  const { importStatusEntities } = useStatusImporter();

  return useInfiniteQuery({
    // Unique key for the favourites timeline
    queryKey: ['statuses', 'timeline', 'favourites'],
    queryFn: async ({ pageParam }) => {
      // 1. Fetch data (TanStack handles the 'isLoggedIn' logic via your api client)
      const response = await api.get('/api/v1/favourites', {
        params: { max_id: pageParam, limit: 20 }
      });

      const data = response.data;

      // 2. SIDE-LOADING: Seed the global status/account cache
      // Replaces dispatch(importFetchedStatuses(data))
      importStatusEntities(data);

      return {
        items: data,
        nextMaxId: extractMaxIdFromLink(response.headers.get('Link')),
      };
    },
    initialPageParam: null,
    // REPLACES: fetchFavouritedStatusesSuccess next logic
    getNextPageParam: (lastPage) => lastPage.nextMaxId ?? undefined,
    // Since favourites are personal, keep them fresh but don't over-fetch
    staleTime: 1000 * 60 * 5, 
  });
};

/*
const FavouritesTimeline = () => {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading 
  } = useFavourites();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="timeline">
      {data?.pages.map((page) => 
        page.items.map((status) => (
          <StatusCard key={status.id} status={status} />
        ))
      )}

      {hasNextPage && (
        <button 
          onClick={() => fetchNextPage()} 
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
};

Automatic Cache Sync: If you "Unfavourite" a post from this list using the useLikeStatus mutation we built earlier, it will automatically vanish or update in this timeline because they share the same status ID in the cache.
No Manual Loading Guards: You don't need the if (getState().status_lists.get('favourites')?.isLoading) check. TanStack Query's Infinite Query internal state machine prevents duplicate concurrent requests for the same page.
Boilerplate Reduction: You can delete the favouritesSlice.js and all associated FETCH_FAVOURITED_STATUSES constants.

*/
//==============================================================================
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useStatusImporter } from '@/features/statuses/hooks/useStatusImporter';

export const useFavourites = (accountId = null) => {
  const { importStatusEntities } = useStatusImporter();

  return useInfiniteQuery({
    // 1. The key partitions the cache by accountId (or 'mine' if null)
    queryKey: ['statuses', 'timeline', 'favourites', accountId || 'mine'],
    queryFn: async ({ pageParam }) => {
      // 2. Conditional URL based on whether we are looking at a profile or our own
      const endpoint = accountId 
        ? `/api/v1/pleroma/accounts/${accountId}/favourites`
        : '/api/v1/favourites';

      const response = await api.get(endpoint, {
        params: { max_id: pageParam, limit: 20 }
      });

      const data = response.data;

      // 3. SIDE-LOADING: Replaces dispatch(importFetchedStatuses(data))
      importStatusEntities(data);

      return {
        items: data,
        nextMaxId: extractMaxIdFromLink(response.headers.get('Link')),
      };
    },
    initialPageParam: null,
    // 4. REPLACES: expand thunk logic (checking next URL)
    getNextPageParam: (lastPage) => lastPage.nextMaxId ?? undefined,
    enabled: true, // isLoggedIn check handled by your axios interceptor
  });
};
/*
const FavouritesTimeline = ({ accountId }) => {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useFavourites(accountId);

  return (
    <div>
      {data?.pages.map((page) => 
        page.items.map((status) => <StatusCard key={status.id} status={status} />)
      )}

      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </button>
      )}
    </div>
  );
};
Version Independence: The logic to handle Pleroma's profile-specific favorites vs Mastodon's standard favorites is hidden inside the hook TanStack Query Infinite Queries.
Concurrency Control: You can delete the if (isLoading) guards. TanStack Query's internal state machine ensures fetchNextPage won't trigger if a request is already in flight.
Cache Partitioning: Because of the queryKey, if you view User A's favorites and then User B's, they don't overwrite each other in the state.

*/

