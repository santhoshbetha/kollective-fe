import { useInfiniteEntities } from '../../../hooks/useInfiniteEntities';

export function useGroupMutes() {
  const api = useApi();
  const features = useFeatures(); // Assuming this comes from your config/context

  const queryKey = ['group-mutes'];

  const query = useInfiniteEntities(
    queryKey, 
    () => api.get('/api/v1/groups/mutes'), 
    { 
      // Only fetch if the groupsMuting feature is enabled in the app config
      enabled: !!features.groupsMuting,
      // Mutes don't change often, so we can cache this for longer
      staleTime: 1000 * 60 * 10, // 10 minutes
    }
  );

  return {
    mutes: query.data?.pages.flatMap(page => page.items) ?? [],
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}
