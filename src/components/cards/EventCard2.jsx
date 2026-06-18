// Inside your EventCard.tsx
// Google AI Event
// When displaying the event, you can use the join_state virtual
// field to show "Joined," "Pending," or "Join Event" on the button.
const EventCard2 = ({ event }) => {

    //conflicts check
    const handleJoin = async () => {
        const res = await fetch(`/api/events/${eventId}/join`, { method: "POST" });
        const data = await res.json();

        if (data.error?.includes("Conflict")) {
            toast({
                variant: "destructive",
                title: "Schedule Conflict! ⚠️",
                description: data.error,
                action: <Button variant="outline">View Calendar</Button>
            });
        }
    };
        
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h3 className="text-xl font-bold text-slate-900">{event.name}</h3>
      <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
      
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
        <MapPin size={14} />
        {event.location_name}, {event.locality}
      </div>

      <Button 
        onClick={() => handleJoin(event.id)}
        variant={event.join_state === 'joined' ? 'outline' : 'default'}
      >
        {event.join_state === 'joined' ? 'Going ✓' : 'Join Event'}
      </Button>
      
      <span className="ml-4 text-xs font-medium">
        {event.participants_count} attending
      </span>
    </div>
  )
}

/*
4. Key Standalone Features for Events:

    Join Modes: "Free" events update the count instantly. "Restricted" events trigger a 
    Notification to the creator (created_by) using the notification system we built.
    Location Data: Since you have longitude and latitude, you can later add a "Map View" 
    of local events without needing an external aggregator.
    Real-time: When someone joins, the broadcast_event_update makes the "attending" count 
    jump on everyone's screen immediately.
*/