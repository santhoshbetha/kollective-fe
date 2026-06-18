/*
Event Cancellation Notification
Your React app needs to handle two things: removing the event 
from the feed and showing a high-priority alert to the users who were planning to attend.
*/
// NotificationListener.js
userChannel.on("new_notification", (notif) => {
  if (notif.type === "event_cancelled") {
    toast.error(`Event Cancelled: "${notif.data.event_title}" has been removed by moderators for safety.`, {
      duration: 10000, // Keep it visible longer
      icon: "🚫"
    });
  }
});

// DiscoveryFeed.js (Local Tab)
channel.on("event_deleted", ({ event_id }) => {
  // Instantly remove the event card from the local discovery map/list
  setEvents(prev => prev.filter(e => e.id !== event_id));
});
/*
Your React app needs to handle two things: removing the event from the feed and showing a high-
priority alert to the users who were planning to attend.
*/