import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/clientN';

export const useJoinGroup = () => {
  const queryClient = useQueryClient();
  //const api = useApi();

  return useMutation({
    mutationFn: (groupId) => 
      api.post(`/api/v1/groups/${groupId}/join`),
    
    onSuccess: (_, groupId) => {
      // 1. Refresh the membership status
      // This tells TanStack: "The membership status for this group is now wrong."
      // useGroupRelationship will immediately trigger a background fetch.
      queryClient.invalidateQueries({ queryKey: ['group-relationships', groupId] });
      
      // 2. Refresh the group itself (to update member counts)
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      
      // 3. Refresh the user's list of joined groups
      queryClient.invalidateQueries({ queryKey: ['groups', 'joined'] });
    },
  });
};


/*
How to handle "Joining a Group" (The Mutation)
When the user clicks "Join Group," you don't use a hook like the one above. 
You use a mutation that invalidates this specific key:
*/

/*
const { mutate: join, isPending } = useJoinGroup();

<button onClick={() => join(group.id)} disabled={isPending}>
  {isPending ? 'Joining...' : 'Join Group'}
</button>
*/

