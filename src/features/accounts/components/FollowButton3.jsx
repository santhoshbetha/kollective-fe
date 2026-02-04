import { useRelationship } from './useRelationship';
import { useFollowMutation } from './useFollowMutation';

//simple useRelationship(accountId) hook (singular) that pulls this data for a single Follow button

//The Final Follow Button Component
// Now, we combine useRelationship (to read) and useFollowMutation (to write).

export const FollowButton3 = ({ accountId, listKey = 'home' }) => {
  const { data: rel, isLoading } = useRelationship(accountId, listKey);
  const mutation = useFollowMutation(accountId, listKey);

  if (isLoading) return <div className="w-20 h-8 bg-gray-100 animate-pulse rounded-full" />;

  const isFollowing = rel?.following;
  const isPending = mutation.isPending;

  const handleToggle = () => {
    // Only fire if not already processing
    if (isPending) return;
    
    mutation.mutate({ isFollowing });
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      className={`
        px-4 py-1 rounded-full font-bold text-sm transition-all duration-200
        ${isFollowing 
          ? 'bg-white border border-gray-200 text-black hover:border-red-100 hover:bg-red-50 hover:text-red-600' 
          : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'}
        ${isPending ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {isPending ? '...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
};

export default FollowButton3;

/*
Why this is the "Golden Standard" for Mastodon Apps:

    Cache Sync: Because onSuccess uses setQueryData, the relationship is updated in the QueryCache immediately. Any other component displaying this user's follow status will flip simultaneously.
    Optimistic Feel: The user gets immediate feedback.
    Atomic Logic: The button doesn't need to know about the Zustand Store or the Timeline; it only cares about the specific ['relationship', accountId] key.

Pro-Tip: Global Invalidation
If you want the user's Profile Page to update its "Followers count" after you click this button, you can add queryClient.invalidateQueries({ queryKey: ['account', accountId] }) to the onSuccess block.
*/
