import { useMemo } from 'react';
import { useInfiniteEntities } from '../../../hooks/useInfiniteEntities';
import { useGroupRelationships } from './useGroupRelationships';

export function useGroupDiscovery(search = '') {
  const api = useApi();
  const features = useFeatures();

  // 1. Fetch the discovery search results
  // The queryKey uniquely identifies this search within the 'discover' context
  const query = useInfiniteEntities(
    ['groups', 'discover', 'search', search],
    () => api.get('/api/v1/groups/search', { params: { q: search } }),
    { 
      // Only run if the feature is on AND there is a search string
      enabled: !!features.groupsDiscovery && !!search,
      staleTime: 1000 * 60 * 5 // Discovery results can be cached longer (5 mins)
    }
  );

  // Flatten infinite pages into a flat array of group objects
  const allGroups = useMemo(() => 
    query.data?.pages.flatMap(page => page.items) ?? [], 
    [query.data]
  );

  // 2. Side-load relationships for these discovered groups
  const groupIds = allGroups.map(g => g.id);
  const { data: relationships = {} } = useGroupRelationships(['discover', 'search', search], groupIds);

  // 3. Merge the data
  const groups = useMemo(() => {
    return allGroups.map(group => ({
      ...group,
      relationship: relationships[group.id] || null,
    }));
  }, [allGroups, relationships]);

  return {
    groups,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    refetch: query.refetch,
  };
}
