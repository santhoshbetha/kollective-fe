import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';


/*
2. Actions: Dismiss & Clear (Mutations)
These replace your dismissNotification and 
clearNotifications reducers. We use setQueriesData to remove items from the cache optimistically.
*/

export const useNotificationActions = () => {
  const queryClient = useQueryClient();

  // 1. Dismiss Single Notification
  const dismissMutation = useMutation({
    mutationFn: (id) => api.post(`/api/v1/notifications/${id}/dismiss`),
    onMutate: (id) => {
      // Remove from all notification caches (all filters)
      queryClient.setQueriesData({ queryKey: ['notifications'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(page => page.filter(n => n.id !== id))
        };
      });
    }
  });

  // 2. Clear All Notifications
  const clearMutation = useMutation({
    mutationFn: () => api.post('/api/v1/notifications/clear'),
    onSuccess: () => {
      // Wipe the cache for notifications entirely
      queryClient.setQueryData(['notifications'], { pages: [], pageParams: [] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  //"Muted Notifications"
  // Handling the "Unmute" Reappearance
  // When you unmute an account, you want their notifications to potentially reappear. 
  // Since the select function is reactive, simply invalidating the notifications query 
  // will trigger a re-run of the filter.

   const unmuteMutation = useMutation({
    mutationFn: (accountId) => api.post(`/api/v1/accounts/${accountId}/unmute`),
    onSuccess: () => {
      // 1. Refresh notifications so the 'select' filter allows them back in
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // 2. Update the 'muted' flag on the account object in cache
      queryClient.setQueriesData({ queryKey: ['accounts'] }, (old) => 
        old ? { ...old, muted: false } : old
      );
    }
  });


  return { dismissMutation, clearMutation, unmuteMutation };
};
/*
    Performance: The TanStack Query select option is memoized. It only re-calculates the filtered list if the raw data or the filter criteria change.
    UI Consistency: By filtering at the data layer, your NotificationList component doesn't need to know about "Mute" logic at all—it just renders whatever valid items it receives.
    No "Ghost" Counts: Since the items are filtered before they reach the UI, your Notification Badge Count logic can simply check data.pages.length and it will be accurate to what the user actually sees.

Summary of Visibility Migration

Feature	Logic Location	Implementation
Keyword Mutes	useTimeline select	Filter statuses by phrase match
Domain Mutes	useBlockDomain mutation	setQueriesData to scrub by domain string
User Mutes	useNotifications select	Filter by account.muted property
*/
//========================================================================================
//Replaces markReadNotifications and clearNotifications.
// src/features/notifications/api/useNotificationActions.js
export const useNotificationActions = () => {
  const queryClient = useQueryClient();

  // Clear (Replaces clearNotifications)
  const clearAll = useMutation({
    mutationFn: () => api.post('/api/v1/notifications/clear'),
    onSuccess: () => queryClient.setQueryData(['notifications'], null),
  });

  // Mark Read (Replaces markReadNotifications & markReadKollective)
  const markRead = useMutation({
    mutationFn: (id) => {
      // Logic handles both standard and Kollective-specific markers
      return api.post('/api/v1/kollective/notifications/read', { max_id: id });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return { clearAll, markRead };
};

// ==================================================================================
