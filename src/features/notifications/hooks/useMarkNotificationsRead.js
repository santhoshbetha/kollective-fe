import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  const api = useApi();

  return useMutation({
    mutationFn: () => api.post('/api/v1/notifications/clear'),
    onSuccess: () => {
      // 1. Immediately reset the badge to zero
      queryClient.setQueryData(['notifications', 'unread-count'], { count: 0 });
      
      // 2. Invalidate the list to remove "new" styling from items
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

//useNotifications2