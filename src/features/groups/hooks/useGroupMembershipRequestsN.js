import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useInfiniteEntities } from '../../../hooks/useInfiniteEntities';
import { useGroupRelationship } from './useGroupRelationship';

// /In the Soapbox code, useDismissEntity is used to remove a specific item from a list (like a "pending" 
// request) after an API call. In TanStack Query, we replace this by manually patching the infinite list 
// cache or simply invalidating the list. Since social apps feel better when the "Accept" or "Reject" 
// happens instantly, we will implement this with an Optimistic Update.
//The New Implementation (JS)

export function useGroupMembershipRequests(groupId) {
  const api = useApi();
  const queryClient = useQueryClient();

  // 1. Permissions Check
  const { data: relationship } = useGroupRelationship(groupId);
  const isAdmin = relationship?.role === 'owner' || relationship?.role === 'admin';

  // 2. Fetch the List
  const queryKey = ['group-membership-requests', groupId];
  const query = useInfiniteEntities(
    queryKey,
    () => api.get(`/api/v1/groups/${groupId}/membership_requests`),
    { enabled: !!groupId && isAdmin }
  );

  // 3. The "Dismiss" Mutation (Handles both Authorize and Reject)
  const useDismissRequest = (action) => {
    return useMutation({
      mutationFn: (accountId) => 
        api.post(`/api/v1/groups/${groupId}/membership_requests/${accountId}/${action}`),
      
      // OPTIMISTIC UPDATE: Remove the user from the UI immediately
      onMutate: async (accountId) => {
        await queryClient.cancelQueries({ queryKey });
        const previousData = queryClient.getQueryData(queryKey);

        // Patch the infinite query cache to "dismiss" the entity
        queryClient.setQueryData(queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              items: page.items.filter(account => account.id !== accountId)
            }))
          };
        });

        return { previousData };
      },
      // Rollback if the server fails
      onError: (err, accountId, context) => {
        queryClient.setQueryData(queryKey, context.previousData);
      },
      // Refetch anyway in the background to ensure list integrity
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey });
      }
    });
  };

  const authorize = useDismissRequest('authorize');
  const reject = useDismissRequest('reject');

  return {
    accounts: query.data?.pages.flatMap(page => page.items) ?? [],
    authorize: authorize.mutate,
    reject: reject.mutate,
    isLoading: query.isLoading,
    isProcessing: authorize.isPending || reject.isPending,
    refetch: query.refetch,
  };
}

/*
const { accounts, authorize, reject } = useGroupMembershipRequests(groupId);

{accounts.map(user => (
  <div key={user.id}>
    {user.acct}
    <button onClick={() => authorize(user.id)}>Approve</button>
    <button onClick={() => reject(user.id)}>Decline</button>
  </div>
))}

*/
