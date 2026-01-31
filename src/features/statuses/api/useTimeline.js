// src/features/statuses/api/useTimeline.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { useStatusImporter } from '../hooks/useStatusImporter';
import { api } from '@/api/client'; // Your axios/fetch instance

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

/* Usage:
const Timeline = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useHomeTimeline();

  return (
    <div className="feed">
      {data?.pages.map((page) => 
        page.map((status) => <StatusItem key={status.id} statusId={status.id} />)
      )}
      
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Show More'}
        </button>
      )}
    </div>
  );
};
*/

