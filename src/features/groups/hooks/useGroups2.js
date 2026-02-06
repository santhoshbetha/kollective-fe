import { useMemo } from 'react';
import { useInfiniteEntities } from '../../../hooks/useInfiniteEntities';
import { useGroupRelationships } from './useGroupRelationships';

export function useGroups(q = '') {
  const api = useApi();
  const features = useFeatures();

  // 1. Fetch the search results
  // The queryKey includes 'q', so changing the search term automatically 
  // triggers a new fetch and caches it separately.
  const query = useInfiniteEntities(
    ['groups', 'search', q],
    () => api.get('/api/v1/groups', { params: { q } }),
    { 
      enabled: !!features.groups,
      staleTime: 1000 * 60 * 2 // 2 minutes
    }
  );

  // Flatten the pages for the relationship lookup
  const allGroups = useMemo(() => 
    query.data?.pages.flatMap(page => page.items) ?? [], 
    [query.data]
  );

  // 2. Fetch relationships for the discovered groups
  const groupIds = allGroups.map(g => g.id);
  const { data: relationships = {} } = useGroupRelationships(['search', q], groupIds);

  // 3. Merge groups with their relationship status
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
