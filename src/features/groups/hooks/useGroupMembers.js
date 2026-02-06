import { useInfiniteEntities } from '../../../hooks/useInfiniteEntities';

export function useGroupMembers(groupId, role) {
  const api = useApi();

  // The Query Key acts as the unique identifier for this specific list
  const queryKey = ['group-memberships', groupId, role];

  const fetchFn = () => {
    return api.get(`/api/v1/groups/${groupId}/memberships?role=${role}`);
  };

  const query = useInfiniteEntities(queryKey, fetchFn, {
    enabled: !!groupId && !!role,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  return {
    // We map 'entities' from the old code to 'groupMembers' here
    groupMembers: query.data?.pages.flatMap(page => page.items) ?? [],
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
  };
}

/*
// Refresh both lists so the user moves from one to the other
queryClient.invalidateQueries({ queryKey: ['group-memberships', groupId] });
*/
