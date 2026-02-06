import { useMemo } from 'react';
import { useInfiniteEntities } from '../../../hooks/useInfiniteEntities';
import { useGroupRelationships } from './useGroupRelationships';

export function usePopularGroups() {
  const api = useApi();
  const features = useFeatures();

  // 1. Fetch the popular/trending groups list
  const queryKey = ['groups', 'popular'];

  const query = useInfiniteEntities(
    queryKey,
    () => api.get('/api/v1/truth/trends/groups'),
    {
      enabled: !!features.groupsDiscovery,
      // Popular trends change slowly, so 10 minutes is a safe cache
      staleTime: 1000 * 60 * 10,
    }
  );

  // Flatten the infinite pages for relationship lookup
  const allGroups = useMemo(() => 
    query.data?.pages.flatMap(page => page.items) ?? [], 
    [query.data]
  );

  // 2. Fetch relationships for these groups
  const groupIds = allGroups.map(g => g.id);
  const { data: relationships = {} } = useGroupRelationships(['popular'], groupIds);

  // 3. Merge the group data with membership relationships
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
