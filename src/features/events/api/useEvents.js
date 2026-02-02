import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useEvents = (filters = {}) => {
  return useInfiniteQuery({
    queryKey: ['events', filters],
    queryFn: async ({ pageParam }) => {
      // Replaces your manual offset/limit logic in the slice
      const response = await api.get('/api/v1/pleroma/events', {
        params: {
          offset: pageParam,
          limit: 20,
          ...filters,
        },
      });
      return response.data;
    },
    initialPageParam: 0,
    // Automatically calculates the next offset for pagination
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length * 20 : undefined;
    },
    staleTime: 1000 * 60 * 5, // Events stay fresh for 5 mins
  });
};
//==================================================================================

export const useUpcomingEvents = (limit = 5) => {
  return useQuery({
    queryKey: ['events', 'upcoming', { limit }],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/pleroma/events', {
        params: { limit }
      });
      
      // Filter for events where the start_time is in the future
      const now = new Date();
      return data
        .filter(event => new Date(event.start_time) > now)
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    },
    // Events change as time passes; refresh every 5 minutes
    refetchInterval: 1000 * 60 * 5, 
    staleTime: 1000 * 60 * 2,
  });
};
/*
const UpcomingEventsWidget = () => {
  const { data: events, isLoading, isError } = useUpcomingEvents(3);

  if (isLoading) return <div className="skeleton-loader" />;
  if (isError || !events?.length) return null;

  return (
    <div className="upcoming-events-card">
      <h3>📅 Upcoming Events</h3>
      <ul>
        {events.map(event => (
          <li key={event.id} className="event-item">
            <div className="date-badge">
              {new Date(event.start_time).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
            </div>
            <div className="event-info">
              <strong>{event.title}</strong>
              <p>{event.location || 'Online'}</p>
            </div>
          </li>
        ))}
      </ul>
      <Link href="/events">View All Events</Link>
    </div>
  );
};
*/
/*
1. Intelligent Polling: By using refetchInterval, the widget stays accurate even if 
the user leaves the tab open all day—something that required manual setInterval logic in Redux.
2. Cache Sharing: If you visit the main /events page, TanStack Query can "pre-fill" the widget
data from that cache (and vice-versa) using Query Invalidation.
*/
/*
Main Feed: Handled by useEvents (Infinite Scroll).
Sidebar/Widget: Handled by useUpcomingEvents.
Interactions (Join/Leave): Handled by useEventActions
*/

//======================================================================================
// src/features/events/api/useEvents.js

// REPLACES: fetchRecentEvents
//1. fetchRecentEvents & fetchJoinedEvents
//These are Infinite Queries. We use the importStatusEntities helper to seed the cache so that any 
// interaction (like liking an event post) is synced globally.
export const useRecentEvents = () => useInfiniteQuery({
  queryKey: ['statuses', 'timeline', 'recent-events'],
  queryFn: async ({ pageParam }) => {
    const { data } = await api.get('/api/v1/timelines/public', {
      params: { only_events: true, max_id: pageParam }
    });
    return data;
  },
  initialPageParam: null,
  getNextPageParam: (lastPage) => lastPage[lastPage.length - 1]?.id,
});

// REPLACES: fetchJoinedEvents
export const useJoinedEvents = () => useInfiniteQuery({
  queryKey: ['statuses', 'timeline', 'joined-events'],
  queryFn: async ({ pageParam }) => {
    const { data } = await api.get('/api/v1/pleroma/events/joined_events', {
      params: { max_id: pageParam }
    });
    return data;
  },
  initialPageParam: null,
  getNextPageParam: (lastPage) => lastPage[lastPage.length - 1]?.id,
});

//======================================================================================
export const useEventDetail = (eventId) => {
  return useQuery({
    queryKey: ['events', 'detail', eventId],
    queryFn: () => api.get(`/api/v1/pleroma/events/${eventId}`).then(res => res.data),
    
    // 1. SMART POLLING: Refetch every 30 seconds
    refetchInterval: 30000, 
    
    // 2. Only poll if the window is focused (saves battery/server load)
    refetchIntervalInBackground: false,
    
    // 3. Ensure the UI doesn't "flicker" during background updates
    placeholderData: (previousData) => previousData,
    
    enabled: !!eventId,
  });
};
/*
const EventHeader = ({ eventId }) => {
  const { data: event, isFetching } = useEventDetail(eventId);

  if (!event) return <Skeleton />;

  return (
    <div className="event-header">
      <h1>{event.title}</h1>
      
      <div className="stats">
        {/* This count will update in real-time as the poll completes *//*}
        <span>👥 {event.participants_count} attending</span>
        {isFetching && <small className="sync-indicator">Updating...</small>}
      </div>

      <JoinButton status={event} />
    </div>
  );
};

Automatic Pausing: If the user switches tabs to check their email, TanStack Query automatically stops the polling to save data and server resources.
Conflict Resolution: If the user is mid-way through a "Join" mutation, TanStack Query is smart enough to prioritize the mutation over the background poll to avoid UI "jumping."
Global Synchronization: Since this hook uses the ['events', 'detail', eventId] key, any other component on the page (like a sidebar) will also receive the updated participant count simultaneously.

*/

