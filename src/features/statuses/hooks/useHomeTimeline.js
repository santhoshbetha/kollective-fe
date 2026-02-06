// src/features/statuses/api/useTimeline.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { useStatusImporter } from '../hooks/useStatusImporter';
import { api } from '@/api/client'; 

export const useHomeTimeline = () => {
  const { importFetchedStatuses } = useStatusImporter();

  return useInfiniteQuery({
    queryKey: ['statuses', 'home'],

    /*queryFn: async ({ pageParam }) => {
      const data = await fetchHomeTimeline(pageParam);
      // Process and seed cache immediately
      importFetchedStatuses(data.items); 
      return data;
    }*/

    // 1. The actual API call
    queryFn: async ({ pageParam }) => {
      // Mastodon/Soapbox uses 'max_id' for pagination
      const response = await api.get('/api/v1/timelines/home', {
        params: {
          max_id: pageParam,
          limit: 20,
        },
      });

      const statuses = response.data;

      // 2. SIDE-EFFECT: Seed the cache for all accounts/polls/quotes found
      // This is the "Redux-replacement" step
      importFetchedStatuses(statuses);

      return statuses;
    },

    // 2. Initial cursor
    initialPageParam: undefined,

    // 3. Logic to determine the NEXT page
    // We take the ID of the last status in the current list
    getNextPageParam: (lastPage) => {
      return lastPage.length > 0 ? lastPage[lastPage.length - 1].id : undefined;
    },

    // 4. StaleTime keeps the feed from refetching every time you switch tabs
    staleTime: 1000 * 60 * 2, 

    // Inside useHomeTimeline
    // If you want to filter out "Sensitive Content" or "Muted Users" globally without changing 
    // the raw data, you can use the select transformation:
    select: (data) => ({
        pages: data.pages.map(page => page.filter(status => !status.muted)),
        pageParams: data.pageParams,
    }),

  });
};


//======================================================================
// Handling pagination (loading older posts) using TanStack's useInfiniteQuery, 
// which is much simpler than the manual pagination logic in the Soapbox store

/*
In a Mastodon app, handling the "Timeline" (scrolling through endless posts) is the most complex part 
of the entity store. Soapbox handles this with manual max_id logic and list management in Redux.

TanStack Query replaces all that manual "reducer surgery" with useInfiniteQuery.

The "Infinite Scroll" Implementation
Instead of dispatching entities to a store and tracking "next page" links in a separate reducer, 
you define how to fetch the next page in one place.
*/
export const useHomeTimeline2 = () => {
  return useInfiniteQuery({
    queryKey: ['timeline', 'home'],
    queryFn: async ({ pageParam }) => {
      // Mastodon API uses 'max_id' for pagination
      const response = await api.get('/api/v1/timelines/home', {
        params: { max_id: pageParam },
      });
      return response.data;
    },
    initialPageParam: null,
    // Logic to find the next ID for the next fetch
    getNextPageParam: (lastPage) => {
      return lastPage.length > 0 ? lastPage[lastPage.length - 1].id : undefined;
    },
  });
};

/*
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useHomeTimeline();

return (
  <div>
    {data?.pages.flatMap(page => page).map(post => (
      <StatusCard key={post.id} status={post} />
    ))}
    
    <button 
      onClick={() => fetchNextPage()} 
      disabled={!hasNextPage || isFetchingNextPage}
    >
      {isFetchingNextPage ? 'Loading more...' : 'Load More'}
    </button>
  </div>
);

*/

/*
Why this replaces the Reducer hooks:

  Memory Management: TanStack Query handles the "pages" array for you. You don't have to manually 
  concat arrays in a reducer.
  Stale Time: You can set a staleTime (e.g., 5 minutes) so that if a user leaves the timeline and 
  comes back, the app doesn't show a loading spinner—it shows the cached data immediately while refetching in the background.
  Automatic Deduplication: If two components call useHomeTimeline(), TanStack will only make 
  one network request.
*/
