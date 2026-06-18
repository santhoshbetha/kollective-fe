import { useLikePost } from "../api/usePostActions";

//"Retry" Logic for Search Actions
const LikeButton3 = ({ post }) => {
  const { mutate, isPending, isPaused } = useLikePost();

  return (
    <button onClick={() => mutate({ id: post.id, isLiked: post.favourited })}>
      <HeartIcon active={post.favourited} />
      {/* 3. Tell the user it's queued but waiting for signal */}
      {isPaused && <span className="post-badge">Waiting for network...</span>}
    </button>
  );
};

export default LikeButton3;