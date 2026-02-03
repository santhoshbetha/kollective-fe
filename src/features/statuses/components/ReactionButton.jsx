import { useEmojiReaction } from "../api/useStatusActions";

const ReactionButton = ({ status, emojiName, url, count, me }) => {
  const { mutate: react, isPending } = useEmojiReaction(status.id);

  return (
    <button 
      className={`reaction-pill ${me ? 'active' : ''}`}
      onClick={() => react({ emoji: emojiName, active: me })}
      disabled={isPending}
    >
      <img src={url} alt={emojiName} />
      <span>{count}</span>
    </button>
  );
};

export default ReactionButton;