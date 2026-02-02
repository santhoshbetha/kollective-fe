// src/features/events/hooks/useEventReminders.js
import { useEffect } from 'react';
import { useUpcomingEvents } from '../api/useEvents';

export const useEventReminders = () => {
  const { data: events } = useUpcomingEvents();

  useEffect(() => {
    if (!events || window.Notification?.permission !== 'granted') return;

    const now = new Date().getTime();
    
    events.forEach(event => {
      const startTime = new Date(event.start_time).getTime();
      const diffInMinutes = (startTime - now) / 1000 / 60;

      // Logic: Trigger notification if event starts in exactly 15-20 minutes
      // and we haven't notified for this specific ID yet
      if (diffInMinutes > 0 && diffInMinutes <= 20) {
        triggerReminder(event);
      }
    });
  }, [events]);
};

const triggerReminder = (event) => {
  const lastNotified = localStorage.getItem(`notified_event_${event.id}`);
  if (lastNotified) return;

  new Notification(`Upcoming Event: ${event.title}`, {
    body: `Starting at ${new Date(event.start_time).toLocaleTimeString()}`,
    icon: '/icons/event-icon.png',
    tag: `event-${event.id}`, // Prevents duplicate windows
  });

  localStorage.setItem(`notified_event_${event.id}`, 'true');
};

/*
function AppLayout({ children }) {
  // This hook runs in the background, listening to the TanStack Cache
  useEventReminders(); 

  return (
    <main>
      {children}
      <NotificationPermissionPrompt />
    </main>
  );
}

*/
