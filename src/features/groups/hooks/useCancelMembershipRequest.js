import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOwnAccount } from '../../accounts/hooks/useOwnAccount';

export function useCancelMembershipRequest(group) {
  const api = useApi();
  const queryClient = useQueryClient();
  const { account: me } = useOwnAccount();

  return useMutation({
    // 1. The API Action
    mutationFn: () => 
      api.post(`/api/v1/groups/${group.id}/membership_requests/${me?.id}/reject`),

    // 2. The Cache Update (Replaces the 'importEntities' dispatch)
    onSuccess: (response) => {
      // Refresh the group relationship so the "Join" button reappears
      queryClient.invalidateQueries({ 
        queryKey: ['group-relationships', group.id] 
      });

      // Optionally refresh the pending groups list
      queryClient.invalidateQueries({ 
        queryKey: ['groups', 'pending', me?.id] 
      });
    },

    // 3. Error handling is built-in
    onError: (error) => {
      console.error("Failed to cancel request:", error);
    }
  });
}

/*
const { mutate: cancelRequest, isPending } = useCancelMembershipRequest(group);

<button onClick={() => cancelRequest()} disabled={isPending}>
  {isPending ? 'Canceling...' : 'Cancel Membership Request'}
</button>
*/

/*
Why we usually prefer invalidateQueries instead:

    Complexity: importEntities requires you to know exactly what the new state should look like. In Mastodon, a "Reject" action might change multiple things (member counts, role status, etc.). It's easier to let the server tell you the new state.
    Consistency: If you manually update the cache but forget to update one specific list, you get "ghost" data where a user appears joined in one view but pending in another.
    Simplicity: queryClient.invalidateQueries({ queryKey: ['group-relationships', group.id] }) is one line and is always 100% accurate.
*/
