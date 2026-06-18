import { useReblogPost } from "../api/usePostActions";
//"Optimistic Reblogs"
const ReblogButton = ({ post }) => {
  const { mutate: toggleReblog, isPending } = useReblogPost();

  return (
    <button 
      className={`reblog-btn ${post.reblogged ? 'active' : ''}`}
      onClick={() => toggleReblog({ id: post.id, isReblogged: post.reblogged })}
      disabled={isPending}
    >
      <ReblogIcon active={post.reblogged} />
      <span>{post.reblogs_count}</span>
    </button>
  );
};

export default ReblogButton;