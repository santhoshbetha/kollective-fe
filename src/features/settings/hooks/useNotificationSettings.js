export const useNotificationSettings = () => {
  return useQuery({
    queryKey: ['settings', 'notifications'],
    queryFn: () => api.get('/api/kollective/notification_settings').then(res => res.data),
    staleTime: Infinity, // Settings don't change unless the user acts
  });
};
