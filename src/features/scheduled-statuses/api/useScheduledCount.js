// src/features/scheduled-statuses/api/useScheduledCount.js
export const useScheduledCount = () => {
  const { data: scheduledData } = useScheduledStatuses();

  // DERIVED STATE: Calculate total items across all infinite pages
  // This is highly efficient as it uses the existing cache
  const count = scheduledData?.pages.reduce(
    (acc, page) => acc + page.items.length, 0
  ) || 0;

  return count;
};

/*
const ScheduledOutboxIcon = () => {
  const count = useScheduledCount();

  return (
    <div className="outbox-icon-wrapper">
      <Link href="/settings/scheduled_statuses">
        <ClockIcon />
        {count > 0 && (
          <span className="badge-count animate-pop-in">
            {count}
          </span>
        )}
      </Link>
    </div>
  );
};
Reactive Consistency: Because the badge reads from the same cache key (['statuses', 'scheduled']) as the main list, the count decreases the exact millisecond a user cancels a post TanStack Query Select Documentation.
Zero Logic in Redux: You don't need a scheduledCount variable in a slice that requires manual increment/decrement actions.
Background Updates: If a scheduled post is successfully published by the server, the next Background Refetch will automatically update the badge without any manual intervention.

*/
