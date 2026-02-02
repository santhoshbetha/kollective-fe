// src/features/notifications/hooks/useNotificationWatcher.js
export const useNotificationWatcher = () => {
  const { theme, soundsEnabled } = useSettingsStore();

  return useQuery({
    queryKey: ['notifications', 'latest'],
    queryFn: () => api.get('/api/v1/notifications', { params: { limit: 1 } }),
    refetchInterval: 15000, // Background poll every 15s
    onSuccess: (data) => {
      const notification = data[0];
      if (!notification) return;

      // 1. Browser Notification (Replaces the try/catch in your thunk)
      if (Notification.permission === 'granted') {
        new Notification(`New ${notification.type}`, {
          body: notification.account.username,
          icon: notification.account.avatar,
        });
      }

      // 2. Sound Effect
      if (soundsEnabled) {
        new Audio('/sounds/boop.mp3').play();
      }
    }
  });
};
