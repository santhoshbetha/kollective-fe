// src/features/settings/hooks/useNotificationPermission.js
export const useRequestNotifications = () => {
  return async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };
};
