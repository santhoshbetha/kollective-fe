import { Quote } from 'lucide-react';

/**
 * Minimized QuotedPostIndicator
 * Shows a simple link/icon for a quoted post.
 */
const QuotedPostIndicator = ({ status }) => {
  // If status isn't loaded or doesn't exist, show nothing
  if (!status) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <Quote size={16} className="shrink-0" />
      <span className="truncate hover:underline cursor-pointer">
        {status.url || `post/${status.id}`}
      </span>
    </div>
  );
};

export default QuotedPostIndicator;
