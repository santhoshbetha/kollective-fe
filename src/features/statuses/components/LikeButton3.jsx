import { useLikeStatus } from "../api/useStatusActions";

//"Retry" Logic for Search Actions
const LikeButton3 = ({ status }) => {
  const { mutate, isPending, isPaused } = useLikeStatus();

  return (
    <button onClick={() => mutate({ id: status.id, isLiked: status.favourited })}>
      <HeartIcon active={status.favourited} />
      {/* 3. Tell the user it's queued but waiting for signal */}
      {isPaused && <span className="status-badge">Waiting for network...</span>}
    </button>
  );
};

export default LikeButton3;