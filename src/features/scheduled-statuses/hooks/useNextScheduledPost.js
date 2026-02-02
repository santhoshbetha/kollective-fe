// src/features/scheduled-statuses/hooks/useNextScheduledPost.js
import { useScheduledStatuses } from '../api/useScheduledStatuses';

//"Scheduled Post Preview"
export const useNextScheduledPost = () => {
  const { data } = useScheduledStatuses();

  // Find the post with the earliest scheduled_at timestamp
  const nextPost = data?.pages
    .flatMap((page) => page.items)
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))[0];

  return nextPost;
};

/*
import * as Tooltip from '@://radix-ui.com';
import { useNextScheduledPost } from '../hooks/useNextScheduledPost';
import { useScheduledCount } from '../api/useScheduledCount';

const ScheduledOutboxIcon = () => {
  const count = useScheduledCount();
  const nextPost = useNextScheduledPost();

  if (count === 0) return null;

  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div className="outbox-icon">
            <ClockIcon />
            <span className="badge">{count}</span>
          </div>
        </Tooltip.Trigger>
        
        <Tooltip.Portal>
          <Tooltip.Content className="tooltip-preview" sideOffset={5}>
            <strong>Next up:</strong>
            <p className="preview-text">
              {nextPost?.params?.text?.substring(0, 100)}...
            </p>
            <small>Scheduled for {new Date(nextPost.scheduled_at).toLocaleString()}</small>
            <Tooltip.Arrow className="tooltip-arrow" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

*/
