import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useFollowActions = (accountId) => {
  const queryClient = useQueryClient();

  return useMutation({
    // 1. Mutation function handles both follow and unfollow
    mutationFn: (isFollowing) => {
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      return api.post(`/api/v1/accounts/${accountId}/${endpoint}`).then(res => res.data);
    },

    // 2. Optimistic Update (The "Instant" feel)
    onMutate: async (isFollowing) => {
      await queryClient.cancelQueries({ queryKey: ['relationships', accountId] });
      const previousRelationship = queryClient.getQueryData(['relationships', accountId]);

      // Flip the 'following' boolean in the cache immediately
      queryClient.setQueryData(['relationships', accountId], (old) => ({
        ...old,
        following: !isFollowing,
        requested: !isFollowing && old?.locked, // Handle private accounts
      }));

      return { previousRelationship };
    },

    // 3. Rollback if the network fails
    onError: (err, variables, context) => {
      queryClient.setQueryData(['relationships', accountId], context.previousRelationship);
    },

    // 4. Refetch to sync final server state (counts, etc.)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['relationships', accountId] });
      queryClient.invalidateQueries({ queryKey: ['accounts', 'me'] }); // Update follower count
    },
  });
};

/*
const FollowButton = ({ accountId }) => {
  const { data: rel, isLoading } = useRelationship(accountId);
  const { mutate: toggleFollow, isPending } = useFollowActions(accountId);

  if (isLoading) return <button disabled>...</button>;

  const isFollowing = rel?.following;
  const isRequested = rel?.requested;

  return (
    <button 
      className={isFollowing ? 'unfollow' : 'follow'}
      onClick={() => toggleFollow(isFollowing)}
      disabled={isPending}
    >
      {isPending ? 'Updating...' : (
        isRequested ? 'Requested' : (isFollowing ? 'Unfollow' : 'Follow')
      )}
    </button>
  );
};

*/
