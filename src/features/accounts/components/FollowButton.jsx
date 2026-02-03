import { useRelationship, useToggleFollow } from "../api/useRelationships";
//Optimistic Follow

const FollowButton = ({ account }) => {
  // Get relationship from TanStack cache
  const { data: rel } = useRelationship(account.id);
  const { mutate: toggleFollow, isPending } = useToggleFollow(account.id);

  const label = rel?.following ? 'Unfollow' : rel?.requested ? 'Requested' : 'Follow';

  return (
    <button 
      className={`btn-${rel?.following ? 'secondary' : 'primary'}`}
      disabled={isPending}
      onClick={() => toggleFollow({ 
        isFollowing: rel?.following, 
        isLocked: account.locked 
      })}
    >
      {isPending ? 'Processing...' : label}
    </button>
  );
};

export default FollowButton;


//"Optimistic UI" FollowButton version 2
const FollowButton2 = ({ accountId }) => {
  const { data: rel } = useRelationship(accountId); 
  const { followMutation, unfollowMutation } = useAccountActions();

  const isFollowing = rel?.following;
  const isPending = followMutation.isPending || unfollowMutation.isPending;

  const handleClick = () => {
    if (isFollowing) {
      unfollowMutation.mutate(accountId);
    } else {
      followMutation.mutate(accountId);
    }
  };

  return (
    <button 
      onClick={handleClick} 
      disabled={isPending}
      className={isFollowing ? 'btn-unfollow' : 'btn-follow'}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
};

export { FollowButton2 };
