import { useEvents } from "./hooks/useEvents";

const EventPage = () => {
  const { id } = useParams();
  const { data: event, loading } = useEvents(id);

  if (loading || !event) return <div>Loading Event...</div>;

  return (
    <Stack spacing={4}>
        <EntityCard
            entity={event}  
            action={
            <button onClick={() => console.log('RSVP to event:', id)}>
                {event.is_joined ? 'Leave Event' : 'Join Event'}
            </button>
            }
        />
        {event.location && <EventMap location={event.location} />}
        <Timeline endpoint={`/api/v1/events/${id}/statuses`} />
    </Stack>
  );
};
