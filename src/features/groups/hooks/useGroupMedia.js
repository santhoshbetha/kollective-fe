import { useInfiniteEntities } from '../../../hooks/useInfiniteEntities';

export function useGroupMedia(groupId) {
  const api = useApi();

  // We use the same 'timeline' or 'statuses' prefix to keep caching consistent
  const queryKey = ['timeline', 'groupMedia', groupId];

  const fetchFn = () => {
    return api.get(`/api/v1/timelines/group/${groupId}?only_media=true`);
  };

  const query = useInfiniteEntities(queryKey, fetchFn, {
    // Media galleries often don't change as fast as the main feed
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!groupId,
  });

  return {
    // Flattening the pages for the UI component
    statuses: query.data?.pages.flatMap(page => page.items) ?? [],
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

/*
Before: You had a complex Redux chain: useGroupMedia → useEntities → fetchPage → 
dispatch(entitiesFetchSuccess) → reducer.ts → useAppSelector.
After: useGroupMedia → useInfiniteEntities (TanStack Cache).
*/
