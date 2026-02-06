import { useQuery } from '@tanstack/react-query';

export function useNotificationsCount() {
  const api = useApi();

  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => api.get('/api/v1/notifications/unread_count').then(r => r.json()),
    // Poll the server every 30 seconds for new alerts
    refetchInterval: 1000 * 30, 
    // Data is fresh for only a few seconds on high-traffic apps
    staleTime: 1000 * 5, 
  });
}

/*
useNotifications2
*/