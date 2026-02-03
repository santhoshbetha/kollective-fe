import { useReblogStatus } from "../api/useStatusActions";
//"Optimistic Reblogs"
const ReblogButton = ({ status }) => {
  const { mutate: toggleReblog, isPending } = useReblogStatus();

  return (
    <button 
      className={`reblog-btn ${status.reblogged ? 'active' : ''}`}
      onClick={() => toggleReblog({ id: status.id, isReblogged: status.reblogged })}
      disabled={isPending}
    >
      <ReblogIcon active={status.reblogged} />
      <span>{status.reblogs_count}</span>
    </button>
  );
};

export default ReblogButton;