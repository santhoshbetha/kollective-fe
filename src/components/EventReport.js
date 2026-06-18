/*
Event Reporting
In your Local Tab, the reporting action should trigger a local UI update to remove the event card immediately. 
*/
const handleReportEvent = async (reason) => {
  await axios.post(`/api/events/${event.id}/report`, { 
    reason, 
    author_id: event.organizer_id 
  });
  
  // Instantly remove the gathering from the local discovery map/list
  setEvents(prev => prev.filter(e => e.id !== event.id));
  toast.success("Event reported and hidden from your feed.");
};
/*
Why this is effective for the "Local" Tab:

    Privacy Guard: Using auto_mute ensures the user never sees content from that organizer again, providing an immediate sense of control over their local environment.
    Mass Safety: Because physical gatherings (Voice/Protests) can be high-risk, real-time admin alerts ensure moderators can intervene before an event occurs.
    Consistency: The logic mirrors your Post reporting, making it easier for your team to maintain and for users to understand.
*/