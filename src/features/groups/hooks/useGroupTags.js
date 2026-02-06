import { useInfiniteEntities } from '../../../hooks/useInfiniteEntities';

export function useGroupTags(groupId) {
  const api = useApi();

  // The Query Key uniquely identifies the tags belonging to this group
  const queryKey = ['group-tags', 'list', groupId];

  const query = useInfiniteEntities(
    queryKey,
    () => api.get(`/api/v1/truth/trends/groups/${groupId}/tags`),
    {
      // Guard: Only fetch if we have a groupId
      enabled: !!groupId,
      // Group trends don't change every second, so we can cache for 5 mins
      staleTime: 1000 * 60 * 5,
    }
  );

  return {
    // Mapping 'entities' to 'tags' as per the original hook
    tags: query.data?.pages.flatMap(page => page.items) ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    refetch: query.refetch,
  };
}
