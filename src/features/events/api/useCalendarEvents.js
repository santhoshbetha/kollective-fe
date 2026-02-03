// Thinking a little longer
//To implement an Event Calendar, you shouldn't use a separate state slice. Instead, you'll use a TanStack Query useQuery to fetch all events for a specific month and a lightweight library like react-calendar or FullCalendar to display them.
//This approach replaces the manual date-filtering logic from your old eventsSlice.js.

import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useCalendarEvents = (year, month) => {
  return useQuery({
    // Cache key is unique per month
    queryKey: ['events', 'calendar', { year, month }],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/kollective/events', {
        params: { 
          limit: 100, // Fetch more to fill the month
          // Note: If your backend supports start_time filters, add them here
        }
      });
      return data;
    },
    // Transform data for the calendar UI
    select: (events) => events.map(event => ({
      ...event,
      start: new Date(event.start_time),
      end: new Date(event.end_time || event.start_time),
      title: event.title
    })),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/*
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useCalendarEvents } from '../api/useCalendarEvents';

const EventCalendarView = () => {
  const [viewDate, setViewDate] = useState(new Date());
  const { data: events, isLoading } = useCalendarEvents(
    viewDate.getFullYear(), 
    viewDate.getMonth() + 1
  );

  // Helper to find events for a specific day
  const getEventsForDate = (date) => {
    return events?.filter(e => 
      e.start.toDateString() === date.toDateString()
    ) || [];
  };

  return (
    <div className="calendar-container">
      <Calendar
        onActiveStartDateChange={({ activeStartDate }) => setViewDate(activeStartDate)}
        tileContent={({ date, view }) => {
          if (view === 'month') {
            const dayEvents = getEventsForDate(date);
            return dayEvents.length > 0 ? <div className="event-dot" /> : null;
          }
        }}
      />
      
      <div className="selected-day-events">
        <h4>Events for {viewDate.toLocaleDateString()}</h4>
        {getEventsForDate(viewDate).map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};
Events: Fully migrated to useEvents, useUpcomingEvents, and useCalendarEvents.
State: Deleted eventsSlice.js and composeEventSlice.js.
Toasts: Moved to mutation onSuccess callbacks.

Direct Action: Add maxPages: 1 to your useCalendarEvents if you want to ensure the browser only keeps the current month's data in active memory.

*/
