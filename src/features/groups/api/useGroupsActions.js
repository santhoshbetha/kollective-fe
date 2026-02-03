
// REPLACES: deleteGroup & groupKick
export const useGroupActions = () => {
  const queryClient = useQueryClient();

  const deleteGroup = useMutation({
    mutationFn: (id) => api.delete(`/api/v1/groups/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['groups', 'list'] });
      queryClient.removeQueries({ queryKey: ['groups', 'detail', id] });
    }
  });

  const kickMember = useMutation({
    mutationFn: ({ groupId, accountId }) => 
      api.post(`/api/v1/groups/${groupId}/kick`, { account_ids: [accountId] }),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'members'] });
    }
  });

  return { deleteGroup, kickMember };
};

/*
Shared Query Keys: useGroupBlocks and useGroupRelationship both rely on the groupId. Keeping them in the same file makes it easier to manage the base query key ['groups', groupId].
Circular Dependency Prevention: By separating Queries (fetching) from Mutations (actions like kicking), you avoid issues where a component needs to both fetch and act on data React Query Folder Structure.
*/

//"Optimistic Kick"
// To implement Optimistic Kick, you use the onMutate property of your mutation to remove the account
// from the group member list cache immediately. This makes the admin interface feel instantaneous for moderators.
//

// It targets both the member list and the infinite scroll cache.
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useKickMember = (groupId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId) => 
      api.post(`/api/v1/groups/${groupId}/kick`, { account_ids: [accountId] }),

    // REPLACES: groupKickRequest
    onMutate: async (accountId) => {
      // 1. Cancel outgoing fetches for the member list
      await queryClient.cancelQueries({ queryKey: ['groups', groupId, 'members'] });

      // 2. Snapshot the current member list for rollback
      const previousMembers = queryClient.getQueryData(['groups', groupId, 'members']);

      // 3. Optimistically remove the user from the cache
      queryClient.setQueryData(['groups', groupId, 'members'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            items: page.items.filter(member => member.id !== accountId)
          }))
        };
      });

      return { previousMembers };
    },

    // REPLACES: groupKickFail
    onError: (err, accountId, context) => {
      queryClient.setQueryData(['groups', groupId, 'members'], context.previousMembers);
    },

    // REPLACES: groupKickSuccess
    onSuccess: () => {
      // Final sync to ensure counts and lists are perfectly accurate
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
    }
  });
};
/*
The UI stays snappy. The isPending state can be used to show a 
subtle "Processing..." indicator on the specific user row.

const MemberRow = ({ groupId, member }) => {
  const { mutate: kick, isPending } = useKickMember(groupId);

  return (
    <div className="member-row">
      <span>{member.username}</span>
      <button 
        onClick={() => kick(member.id)} 
        disabled={isPending}
        className="btn-kick"
      >
        {isPending ? 'Kicking...' : 'Kick'}
      </button>
    </div>
  );
};

Eliminates "Ghost" Members: In Redux, you often had to wait for the SUCCESS action before the UI updated. Here, the user vanishes the millisecond the button is clicked TanStack Optimistic Updates.
Automatic Rollback: If the network fails or the admin doesn't have permission, the member "pops back" into the list automatically, keeping the UI honest.
Scoped State: You don't need a kickingIds array in your groupsSlice. Each button tracks its own state.

*/
//==================================================================================
// src/features/groups/api/useGroupActions.js

export const useInviteToGroup = (groupId) => {
  const queryClient = useQueryClient();

  return useMutation({
    // 1. API Call (Kollective specific)
    mutationFn: (accountId) =>
      api.post(`/api/v1/groups/${groupId}/invite`, { account_ids: [accountId] }),

    // 2. Success Logic: Sync the lists
    onSuccess: () => {
      // Refresh the member list to show the new invitee
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'members'] });
      
      // Update group metadata (e.g., member count)
      queryClient.invalidateQueries({ queryKey: ['groups', 'detail', groupId] });
      
      toast.success("Invitation sent!");
    },
    
    onError: (err) => {
      toast.error(err?.response?.data?.error || "Failed to invite user");
    }
  });
};
/*
const InviteUserRow = ({ groupId, account }) => {
  const { mutate: invite, isPending } = useInviteToGroup(groupId);

  return (
    <div className="invite-row">
      <img src={account.avatar} alt="" className="avatar-sm" />
      <span>{account.username}</span>
      
      <button 
        onClick={() => invite(account.id)} 
        disabled={isPending}
      >
        {isPending ? 'Inviting...' : 'Invite to Group'}
      </button>
    </div>
  );
};
Decoupled UI State: You don't need to track invitingIds: [] in a Redux slice. The isPending state is local to each button instance TanStack Mutation Docs.
Automatic Refresh: By calling invalidateQueries, you ensure that when the user navigates back to the Group Members page, the data is already being updated in the background.
Error Handling: Instead of complex Redux error states, you use a simple onError callback to show a Toast notification.

*/

