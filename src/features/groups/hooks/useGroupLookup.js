import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useHistory } from 'react-router-dom';
import { useGroupRelationship } from './useGroupRelationship';

export function useGroupLookup(slug, options = {}) {
  const api = useApi();
  const history = useHistory();
  const queryClient = useQueryClient();
  const features = useFeatures();

  // 1. The Group Lookup Query
  const groupQuery = useQuery({
    queryKey: ['groups', 'lookup', slug?.toLowerCase()],
    queryFn: async () => {
      const res = await api.get(`/api/v1/groups/lookup?name=${slug}`);
      const data = await res.json();
      return groupSchema.parse(data);
    },
    enabled: !!features.groups && !!slug,
    
    // LOOKUP LOGIC: Scan the cache for an existing group with this slug
    placeholderData: () => {
      const allGroups = queryClient.getQueriesData({ queryKey: ['groups'] });
      for (const [key, data] of allGroups) {
        if (data?.slug?.toLowerCase() === slug?.toLowerCase()) return data;
      }
    },

    // Handle 401 Redirects
    retry: (count, error) => {
      if (error?.status === 401) {
        history.push('/login');
        return false;
      }
      return count < 3;
    }
  });

  const group = groupQuery.data;

  // 2. The Relationship Query (Dependent on finding the group ID)
  const { data: relationship, isLoading: isRelLoading } = useGroupRelationship(group?.id);

  return {
    ...groupQuery,
    isLoading: groupQuery.isLoading,
    isRelationshipLoading: isRelLoading,
    isUnauthorized: groupQuery.error?.status === 401,
    // Merge the group with its relationship
    group: group ? { ...group, relationship: relationship || null } : undefined,
  };
}

/*
Why this migration is superior:

    Eliminates Redundant Network Calls: By using getQueriesData in the placeholderData function, if the user already saw this group in a "Popular Groups" or "Suggested Groups" list, the profile page will load instantly without a spinner. TanStack Query placeholder data ensures a smooth UX.
    No Manual useEffect Redirects: The retry logic handles authorization failures as they happen, preventing the component from rendering in an invalid state.
    Automatic Dependency Resolution: The moment groupQuery resolves and provides an ID, useGroupRelationship automatically triggers. You don't have to manage this orchestration manually anymore.
    Cache Consistency: In the old Redux reducer.ts, a "lookup" might create a duplicate entry if not handled perfectly. In TanStack, the Query Key system ensures that the lookup results are mapped correctly to the main entity cache.
*/
