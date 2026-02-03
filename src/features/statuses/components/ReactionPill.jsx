import { useEmojiReaction } from "../api/useStatusActions";

const ReactionPill = ({ statusId, reaction, emojiUrl }) => {
  const { mutate: toggleReaction, isPending } = useEmojiReaction(statusId);

  return (
    <button 
      className={`reaction-pill ${reaction.me ? 'active' : ''}`}
      onClick={() => toggleReaction({ emoji: reaction.name, active: reaction.me })}
      disabled={isPending}
    >
      <img src={emojiUrl} alt={reaction.name} />
      <span className="count">{reaction.count}</span>
    </button>
  );
};

export default ReactionPill;