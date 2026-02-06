import { useMemo } from 'react';
import { useInfiniteEntities } from '../../../hooks/useInfiniteEntities';
import { useGroupRelationships } from './useGroupRelationships';

export function useGroupsFromTag(tagId) {
  const api = useApi();
  const features = useFeatures();

  // 1. Fetch the list of groups associated with this tag
  const queryKey = ['groups', 'tags', tagId];
  
  const query = useInfiniteEntities(
    queryKey,
    () => api.get(`/api/v1/tags/${tagId}/groups`),
    {
      // Only fetch if the ID exists and the feature is enabled
      enabled: !!tagId && !!features.groupsDiscovery,
      staleTime: 1000 * 60 * 5, // Tags-based lists are relatively static
    }
  );

  // 2. Flatten the pages for relationship lookup
  const allGroups = useMemo(() => 
    query.data?.pages.flatMap(page => page.items) ?? [], 
    [query.data]
  );

  // 3. Fetch relationships for these groups
  const groupIds = allGroups.map(g => g.id);
  const { data: relationships = {} } = useGroupRelationships(['tags', tagId], groupIds);

  // 4. Merge groups with their membership status
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
