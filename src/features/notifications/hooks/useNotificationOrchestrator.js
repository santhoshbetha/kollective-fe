import { useQueryClient } from '@tanstack/react-query';
import { useSettingsStore } from '@/features/settings/store/useSettingsStore';
import { useFilterStore } from '@/features/filters/store/useFilterStore';
import { htmlToPlaintext, regexFromFilters } from '@/utils/statusUtils';

/*
In TanStack Query, you handle this logic inside a Subscriber Hook. Instead of a complex Redux thunk that manages UI side-effects (sounds, desktop alerts), you use a centralized 
"Notification Orchestrator" that leverages your Zustand stores for settings and the Query Client for cache updates.
*/
/*
1. The Logic Breakdown
You are moving away from dispatch and getState to:

    Zustand: To read settings and filters (fast, reactive).
    TanStack Query: To inject the notification into the cache.
    Web APIs: To trigger sounds and browser notifications directly.
*/
/*
Key Differences & Improvements
    1. Removal of intlMessages pass-around: Instead of passing i18n data through the thunk, handle the 
      translation inside triggerDesktopNotification using your app's existing i18n provider (like react-intl) 
      or a global helper.
    2. Service Worker Integration: By keeping the navigator.serviceWorker logic here, you keep your 
      TanStack Query cache focused purely on data, while the hook orchestrates the side-effects.
    3. Path Detection: Instead of checking curPath === '/notifications', TanStack Query allows you to update the 
      ['notifications'] key globally. If the user is on that page, the list will auto-update because it's subscribed 
      to that key. If they aren't, the cache is ready for when they click the tab.

      The Redux version required a soundsMiddleware and multiple action types (NOTIFICATIONS_UPDATE_QUEUE, NOTIFICATIONS_UPDATE_NOOP).
       This new approach is self-contained. One hook manages the entire lifecycle of an incoming event.
*/

export const useNotificationOrchestrator = () => {
  const queryClient = useQueryClient();
  
  // Replace getState() with Zustand selectors
  const settings = useSettingsStore(s => s.notifications);
  const filters = useFilterStore(s => s.getFilters('notifications'));

  const handleIncomingNotification = async (notification) => {
    // 1. Validation & Early Returns
    if (!notification.type || ['chat', 'kollective:chat_mention'].includes(notification.type)) return;

    // 2. Filtering Logic
    let isFiltered = false;
    if (['mention', 'status'].includes(notification.type)) {
      const regex = regexFromFilters(filters);
      const searchIndex = `${notification.status.spoiler_text}\n${htmlToPlaintext(notification.status.content)}`;
      isFiltered = regex && regex.test(searchIndex);
    }
    if (isFiltered) return;

    // 3. Desktop Alerts
    const showAlert = settings.alerts[notification.type];
    if (showAlert && window.Notification?.permission === 'granted') {
      triggerDesktopNotification(notification);
    }

    // 4. Sound Effects (Replaces soundsMiddleware)
    const playSound = settings.sounds[notification.type];
    if (playSound) {
      new Audio('/sounds/boop.mp3').play().catch(() => {});
    }

    // 5. Cache Update (The "Redux Replacement")
    // Logic: If we are on the notifications page, we might want to "Queue" it 
    // or just prepend it. Most modern apps just prepend it to the cache.
    queryClient.setQueriesData({ queryKey: ['notifications'] }, (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: [
          { ...old.pages[0], items: [notification, ...old.pages[0].items] },
          ...old.pages.slice(1),
        ],
      };
    });
  };

  return { handleIncomingNotification };
};

// Helper for Browser API
const triggerDesktopNotification = (n) => {
  navigator.serviceWorker.ready.then(reg => {
    reg.showNotification(n.account.display_name || n.account.username, {
      body: n.status?.spoiler_text || htmlToPlaintext(n.status?.content || ''),
      icon: n.account.avatar,
      tag: n.id,
    });
  });
};

