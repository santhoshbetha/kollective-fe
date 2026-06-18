import { useLikePost } from "../api/usePostActions";
//"Optimistic Likes"
const LikeButton2 = ({ post }) => {
  const { mutate: toggleLike, isPending } = useLikePost();

  return (
    <button 
      className={`like-btn ${post.favourited ? 'active' : ''}`}
      onClick={() => toggleLike({ id: post.id, isLiked: post.favourited })}
      disabled={isPending}
    >
      <HeartIcon filled={post.favourited} />
      <span>{post.favourites_count}</span>
    </button>
  );
};

export default LikeButton2;