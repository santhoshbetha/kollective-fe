import { useState, useMemo, memo } from 'react';
import { ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import Markup from './Markup';

/** Minimized PostContent */
const PostContent = ({ status, onClick, collapsable = false }) => {
  const [isExpanded, setIsExpanded] = useState(!collapsable);

  const content = useMemo(() => {
    // Basic emoji check (optional simplification)
    const isOnlyEmoji = status.content?.length < 20 && !status.content.includes('<a');
    
    return {
      html: { __html: status.content },
      className: clsx('text-gray-900 dark:text-gray-100 break-words', {
        'line-clamp-6 overflow-hidden': !isExpanded,
        'text-4xl leading-normal': isOnlyEmoji,
      }),
    };
  }, [status.content, isExpanded]);

  if (!status.content) return null;

  return (
    <div className="relative">
      <Markup
        className={content.className}
        emojis={status.emojis?.toJS?.() || status.emojis}
        html={content.html}
      />

      {collapsable && !isExpanded && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(true);
            if (onClick) onClick();
          }}
          className="flex items-center mt-2 text-blue-500 hover:underline text-sm font-medium"
        >
          Read more
          <ChevronRight size={16} className="ml-1" />
        </button>
      )}

      {status.poll && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {/* Simple Poll Placeholder or Component */}
          <p className="text-xs text-gray-500">Poll attached</p>
        </div>
      )}
    </div>
  );
};

export default memo(PostContent);
