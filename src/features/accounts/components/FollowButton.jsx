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
