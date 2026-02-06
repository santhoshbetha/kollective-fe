import { useMemo } from 'react';
import { useInfiniteEntities } from '../../../hooks/useInfiniteEntities';
import { useGroupRelationships } from './useGroupRelationships';

export function useSuggestedGroups() {
  const api = useApi();
  const features = useFeatures();

  // 1. Fetch the suggested groups list
  const queryKey = ['groups', 'suggested'];

  const query = useInfiniteEntities(
    queryKey,
    () => api.get('/api/v1/truth/suggestions/groups'),
    {
      enabled: !!features.groupsDiscovery,
      // Suggestions can be cached for a while (e.g., 15 minutes)
      staleTime: 1000 * 60 * 15,
    }
  );

  // Flatten the pages for relationship lookup
  const allGroups = useMemo(() => 
    query.data?.pages.flatMap(page => page.items) ?? [], 
    [query.data]
  );

  // 2. Fetch relationships (member/moderator status) for these groups
  const groupIds = allGroups.map(g => g.id);
  const { data: relationships = {} } = useGroupRelationships(['suggested'], groupIds);

  // 3. Combine group data with their relationships
  const groups = useMemo(() => {
    return allGroups.map(group => ({
      ...group,
      relationship: relationships[group.id] || null,
    }));
  }, [allAccounts, relationships]);

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
