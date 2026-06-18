import { useEmojiReaction } from "../api/usePostActions";

const ReactionButton = ({ post, emojiName, url, count, me }) => {
  const { mutate: react, isPending } = useEmojiReaction(post.id);

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