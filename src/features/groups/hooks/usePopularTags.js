import { useInfiniteEntities } from '../../../hooks/useInfiniteEntities';

export function usePopularTags() {
  const api = useApi();
  const features = useFeatures();

  // The Query Key defines this specific collection of trending tags
  const queryKey = ['group-tags', 'popular'];

  const query = useInfiniteEntities(
    queryKey,
    () => api.get('/api/v1/groups/tags'),
    {
      // Standard feature-flag guard
      enabled: !!features.groupsDiscovery,
      // Trending tags are typically stable, so we cache for 10 minutes
      staleTime: 1000 * 60 * 10, 
    }
  );

  return {
    // Mapping 'entities' to 'tags' to match the original component expectations
    tags: query.data?.pages.flatMap(page => page.items) ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    refetch: query.refetch,
  };
}
