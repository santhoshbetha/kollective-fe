import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useInfiniteEntities } from '../../../hooks/useInfiniteEntities';
import { useGroupRelationship } from './useGroupRelationship';

export function useGroupMembershipRequests(groupId) {
  const api = useApi();
  const queryClient = useQueryClient();

  // 1. Check permissions first (replaces original logic)
  const { data: relationship } = useGroupRelationship(groupId);
  const isAdmin = relationship?.role === 'owner' || relationship?.role === 'admin';

  // 2. Fetch the list (Infinite Query)
  const queryKey = ['group-membership-requests', groupId];
  const query = useInfiniteEntities(
    queryKey,
    () => api.get(`/api/v1/groups/${groupId}/membership_requests`),
    { enabled: !!groupId && isAdmin }
  );

  // 3. Mutation: Authorize
  const authorize = useMutation({
    mutationFn: (accountId) => 
      api.post(`/api/v1/groups/${groupId}/membership_requests/${accountId}/authorize`),
    onSuccess: () => {
      // Refresh the list automatically
      queryClient.invalidateQueries({ queryKey });
    }
  });

  // 4. Mutation: Reject
  const reject = useMutation({
    mutationFn: (accountId) => 
      api.post(`/api/v1/groups/${groupId}/membership_requests/${accountId}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  return {
    accounts: query.data?.pages.flatMap(page => page.items) ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    // Using .mutate so the component can just call authorize(id)
    authorize: authorize.mutate,
    reject: reject.mutate,
    isProcessing: authorize.isPending || reject.isPending,
  };
}
