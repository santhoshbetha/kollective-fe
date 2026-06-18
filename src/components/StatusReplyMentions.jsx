import { Link } from 'react-router-dom';

/**
 * Minimized StatusReplyMentions
 * Displays "Replying to @user" without the heavy federation hover logic.
 */
const StatusReplyMentions = ({ status }) => {
  // If it's not a reply, render nothing
  if (!status.in_reply_to_id) return null;

  const mentions = status.mentions?.toJS?.() || status.mentions || [];

  // Case: Reply to a post with no specific mentions (rare)
  if (mentions.length === 0) {
    return (
      <div className="mb-1 text-sm text-gray-500">
        Replying to post
      </div>
    );
  }

  // Show first 2 mentions
  const displayMentions = mentions.slice(0, 2).map((account) => (
    <Link
      key={account.id}
      to={`/@${account.acct}`}
      className="text-blue-500 hover:underline mx-0.5"
      onClick={(e) => e.stopPropagation()}
    >
      @{account.username}
    </Link>
  ));

  const extraCount = mentions.length - 2;

  return (
    <div className="mb-1 text-sm text-gray-500 dark:text-gray-400">
      <span>Replying to </span>
      {displayMentions.reduce((prev, curr) => [prev, ', ', curr])}
      {extraCount > 0 && (
        <span className="cursor-pointer hover:underline text-blue-500 ml-1">
          and {extraCount} more
        </span>
      )}
    </div>
  );
};

export default StatusReplyMentions;
