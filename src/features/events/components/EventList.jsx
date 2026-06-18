import { useEffect } from "react";
//Event Cancellation 
/*
To handle
Event Cancellation in a standalone app, you must perform a "Double Cleanup": remove the 
record from the database and cancel the scheduled Oban jobs so users don't receive reminders
for an event that no longer exists.
*/

/*
2. React Frontend: The "Vanish" Signal
When a user is looking at their "Upcoming Events" list in React, they should 
see the card disappear instantly when the delete_event broadcast hits.
*/
// /// Inside your EventsList component
const EventsList = () => {
  
    // Inside your EventsList component
    useEffect(() => {
        const channel = socket.channel("timeline:public", {});
        
        channel.on("delete_event", (payload) => {
            // Optimistically remove from local state
            setEvents((prev) => prev.filter(e => e.id !== payload.id));
            
            toast({
            title: "Event Cancelled",
            description: "An event you were interested in was removed.",
            variant: "destructive"
            });
        });
    }, []);
  return (
    <div>

    </div>
  );
};

/*
3. Why this is the "Golden Path":

    Oban Integrity: Without cancel_pending_reminders, your server would still "wake up" at the scheduled time and try to process a job for a non-existent event_id, causing errors in your logs.
    Notification Value: By explicitly calling notify_cancellation, participants aren't left wondering why the event disappeared; they get a clear "Event Cancelled" alert.
    Atomic Safety: Wrapping the delete and the job cancellation in a Repo.transaction ensures that if the DB fails to delete the event, the reminders stay active.
*/

/*
Summary of the "Cancel" Sequence:

    Organizer clicks "Cancel Event".
    Backend flips the Oban job status to cancelled.
    Backend sends "Event Cancelled" notifications to all followers/attendees.
    Database deletes the event and all event_participants.
    UI removes the event card from all active user screens via WebSocket.

You have now built a world-class, timezone-aware, real-time Event system.
*/
