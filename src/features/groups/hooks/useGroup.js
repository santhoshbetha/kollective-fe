import { useQuery } from '@tanstack/react-query';
import { useHistory } from 'react-router-dom';
import { useGroupRelationship } from './useGroupRelationship';
import { groupSchema } from '../../../schemas/group';
import api from '../../../api/clientN';

export function useGroup(groupId, options = {}) {
  const history = useHistory();

  // 1. Fetch Group Data
  const groupQuery = useQuery({
    queryKey: ['groups', groupId],
    queryFn: async () => {
      const response = await api.get(`/api/v1/groups/${groupId}`);
      const json = await response.json();
      return groupSchema.parse(json);
    },
    enabled: !!groupId && (options.enabled ?? true),
    // Handle redirect via meta or error callbacks
    retry: (count, error) => {
      if (error?.status === 401) {
        history.push('/login');
        return false;
      }
      return count < 3;
    },
  });

  // 2. Fetch Group Relationship (Our other TanStack hook)
  const { data: relationship, isLoading: isRelLoading } = useGroupRelationship(groupId);

  // 3. Combine Data
  const group = groupQuery.data 
    ? { ...groupQuery.data, relationship: relationship || null } 
    : undefined;

  return {
    group,
    isLoading: groupQuery.isLoading,
    isRelationshipLoading: isRelLoading,
    error: groupQuery.error,
    isUnauthorized: groupQuery.error?.status === 401,
  };
}

/*
Removal of refetch param: In the Redux version, you had to pass refetch: true to force a network call. In TanStack, you control this with staleTime. If you want the group data to be fresh every time the component mounts, you set staleTime: 0. If you want it to be cached for a while, set it to 1000 * 60.
No useEffect for Redirects: Instead of watching a state variable in an effect, you can handle the 401 redirect directly in the retry or onError logic of the query. This prevents a "flash" of unauthorized content.
Automatic Relationship Sync: If the user joins or leaves the group (triggering a mutation that updates ['group-relationships', groupId]), this hook will automatically re-render with the new relationship state because it is subscribed to that key.
*/
