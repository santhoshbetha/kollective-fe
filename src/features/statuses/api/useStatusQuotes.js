import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useStatusImporter } from '../hooks/useStatusImporter';

export const useStatusQuotes = (statusId) => {
  const { importStatusEntities } = useStatusImporter();

  return useInfiniteQuery({
    // Unique key partitions quotes by statusId
    queryKey: ['statuses', 'quotes', statusId],
    queryFn: async ({ pageParam }) => {
      const response = await api.get(`/api/v1/pleroma/statuses/${statusId}/quotes`, {
        params: { max_id: pageParam, limit: 20 }
      });

      const data = response.data;

      // SIDE-LOADING: Seed the global status cache
      // Replaces: dispatch(importFetchedStatuses(data))
      importStatusEntities(data);

      return {
        items: data,
        nextMaxId: extractMaxIdFromLink(response.headers.get('Link')),
      };
    },
    initialPageParam: null,
    // REPLACES: expandStatusQuotes "next" logic
    getNextPageParam: (lastPage) => lastPage.nextMaxId ?? undefined,
    enabled: !!statusId,
    staleTime: 1000 * 60 * 5, // Quotes are stable for 5 mins
  });
};
/*
const StatusQuotesList = ({ statusId }) => {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading 
  } = useStatusQuotes(statusId);

  if (isLoading) return <Spinner />;

  return (
    <div className="quotes-list">
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
          {isFetchingNextPage ? 'Loading more quotes...' : 'Load More'}
        </button>
      )}
    </div>
  );
};

*/