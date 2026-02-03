import { useLikeStatus } from "../api/useStatusActions";
//"Optimistic Likes"
const LikeButton2 = ({ status }) => {
  const { mutate: toggleLike, isPending } = useLikeStatus();

  return (
    <button 
      className={`like-btn ${status.favourited ? 'active' : ''}`}
      onClick={() => toggleLike({ id: status.id, isLiked: status.favourited })}
      disabled={isPending}
    >
      <HeartIcon filled={status.favourited} />
      <span>{status.favourites_count}</span>
    </button>
  );
};

export default LikeButton2;