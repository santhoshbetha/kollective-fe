import { useQueryClient } from '@tanstack/react-query';
import { useStatusImporter } from '@/features/statuses/hooks/useStatusImporter';
import { useSettingsStore } from '@/features/settings/store/useSettingsStore'; // Zustand

export const useNotificationStream = () => {
  const queryClient = useQueryClient();
  const { importStatusEntities } = useStatusImporter();
  const showSettings = useSettingsStore(s => s.notifications.shows);

  const processIncomingNotification = (notification) => {
    // 1. Side-load Accounts (replaces importFetchedAccount)
    if (notification.account) {
      queryClient.setQueryData(['accounts', notification.account.id], notification.account);
    }
    if (notification.target) {
      queryClient.setQueryData(['accounts', notification.target.id], notification.target);
    }

    // 2. Side-load Status (replaces importFetchedStatus)
    if (notification.status) {
      importStatusEntities(notification.status);
    }

    // 3. Logic: Should this be added to the UI column?
    const showInColumn = showSettings[notification.type] ?? true;

    if (showInColumn) {
      // Prepend to the notification infinite query cache
      queryClient.setQueryData(['notifications', 'all'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: [
            { ...old.pages[0], items: [notification, ...old.pages[0].items] },
            ...old.pages.slice(1),
          ],
        };
      });

      // 4. Handle Relationships (replaces fetchRelatedRelationships)
      // We simply invalidate the relationship query so it refetches in the background
      if (notification.account) {
        queryClient.invalidateQueries({ queryKey: ['relationships', notification.account.id] });
      }
    }
  };

  return { processIncomingNotification };
};


/* Usage
useEffect(() => {
  const listener = (data) => processIncomingNotification(data);
  socket.on('notification', listener);
  return () => socket.off('notification', listener);
}, []);
*/

/*
Key Differences from your Redux code:

    1. Settings Access: Instead of getState(), we pull settings from a Zustand Store. 
      This is much faster and cleaner in a hook.
    2. No "NOTIFICATIONS_UPDATE" Action: You update the cache directly via setQueryData. 
      Any component using useNotifications() will re-render automatically.
    3. Relationship Management: Instead of manually dispatching a fetch for relationships, 
      we use TanStack Query Invalidation. This ensures that if the user actually opens the notification, the relationship data is fresh.
*/

/*
By moving this to TanStack, you remove the need for the NOTIFICATIONS_UPDATE constant 
and the complex logic in your notificationsSlice that handles merging new items into arrays. 
TanStack Query's Infinite Query structure manages the "First Page" vs "Old Pages" distinction for you.
*/

/*
1. ReducerRecord & QueuedNotificationRecord
Verdict: DELETE.
TanStack Query provides isLoading, isError, and hasNextPage automatically. The "Queue" logic (for showing "New Items Available") is better handled by comparing the first item of your current cache with the first item of a "background poll" results, rather than maintaining a manual Immutable Map of queued items.
2. comparator and parseId
Verdict: DELETE.
Social timelines are already sorted by the server. In TanStack Query, you keep the order the API gives you. If you need to re-sort, you can do it in the select option of your hook, but manual sorting in a reducer is a common source of performance lag in social apps.
3. isValid (Validation)
Verdict: REPLACE WITH ZOD.
Instead of a try/catch and manual if checks, use the Zod Schema we built earlier.

    Your !notification.account check becomes: account: z.object({ id: z.string() })
    Your null status check becomes: .refine() or .transform() in Zod.
    Zod is faster, typed, and fails gracefully before data enters the cache.

4. minifyNotification (Normalization)
Verdict: DELETE (Let the Cache handle it).
This was used to save memory in Redux by only storing IDs. In TanStack Query, we store the full object but use Side-loading (the importStatusEntities we built) to ensure that if the same Status appears in multiple places, the object reference is shared. Minifying to IDs and re-inflating them is "The Redux Way" and is unnecessarily complex for TanStack.
5. countFuture & unread
Verdict: MOVE TO COMPONENT LOGIC.
Calculating "unread" notifications by comparing IDs to lastRead should be a derived value inside your UI component or a small useMemo, not a value synced in a reducer.
6. filterNotifications & deleteByStatus
Verdict: REPLACE WITH setQueriesData.
Instead of these Immutable helpers, use the deletePostInPages utility we wrote earlier.
*/