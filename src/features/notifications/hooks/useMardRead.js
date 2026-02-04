import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { compareId } from '@/utils/statusUtils';

export const useMarkRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (topNotificationId) => {
      // 1. Standard Mastodon Markers API
      const markerPromise = api.post('/api/v1/markers', {
        notifications: { last_read_id: topNotificationId },
      });

      // 2. Specialized Kollective Read API (Conditional)
      // Note: You can get 'software' from your Instance Query or Zustand Store
      const software = queryClient.getQueryData(['instance'])?.software;
      
      const promises = [markerPromise];
      if (software === 'kollective') {
        promises.push(api.post('/api/v1/kollective/notifications/read', { max_id: topNotificationId }));
      }

      return Promise.all(promises);
    },
    
    onSuccess: (_, topNotificationId) => {
      // Update local 'lastRead' cache so we don't repeat the call
      queryClient.setQueryData(['notifications', 'lastRead'], topNotificationId);
    },
  });
};
/* Usage Example:
const NotificationList = () => {
  const { data } = useNotifications();
  const { mutate: markRead } = useMarkRead();
  const queryClient = useQueryClient();

  const topId = data?.pages[0]?.items[0]?.id;
  const lastReadId = queryClient.getQueryData(['notifications', 'lastRead']);

  useEffect(() => {
    // Ported Logic: If top notification is newer than last read, sync with server
    if (topId && (!lastReadId || compareId(topId, lastReadId) > 0)) {
      markRead(topId);
    }
  }, [topId, lastReadId, markRead]);

  // Render notifications...
};

*/
/*
1. Version Detection: By using queryClient.getQueryData(['instance']), 
you get the software type (Kollective/Mastodon) directly from your global instance cache 
instead of passing it through thunk arguments.
2. Elimination of -1 Logic: You can use standard JavaScript falsy checks (!lastReadId) rather 
than managing magic numbers like -1 in your Redux state.
3. Automatic Sync: Since lastRead is now in the TanStack cache, if you open the app on another tab, 
it will know not to fire the markRead mutation again.
*/
