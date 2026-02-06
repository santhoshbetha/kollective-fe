import { useInfiniteEntities } from '../../../hooks/useInfiniteEntities';

export function useBookmarks() {
  const api = useApi();
  const features = useFeatures();

  // Consistent naming helps with cache management
  const queryKey = ['statuses', 'bookmarks'];

  const query = useInfiniteEntities(
    queryKey,
    () => api.get('/api/v1/bookmarks'),
    { 
      enabled: !!features.bookmarks,
      // Bookmarks don't change as often as a live feed
      staleTime: 1000 * 60 * 5, 
    }
  );

  return {
    // Mapping 'entities' to 'bookmarks' for backward compatibility
    bookmarks: query.data?.pages.flatMap(page => page.items) ?? [],
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}
