/*
Unread Notifications count (Red bubble)
 listen for the update.
*/ 

// Sidebar.js
const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  // 1. Initial Load from REST API
  axios.get('/api/notifications/unread_count').then(res => {
    setUnreadCount(res.data.count);
  });

  // 2. Live Updates via WebSocket
  const channel = socket.channel(`user_notifications:${currentUser.id}`, {});
  channel.join();

  channel.on("new_notification", (payload) => {
    setUnreadCount(payload.unread_count);
    playNotificationSound(); // Optional
  });

  channel.on("clear_unread", () => setUnreadCount(0));

  return () => channel.leave();
}, []);

return (
  <div className="relative">
    <NotificationsIcon />
    {unreadCount > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    )}
  </div>
);

//=============================================
// React Frontend (Dual Badge UI)#
//In your React navigation, you can now render two distinct bubbles based on the counts payload.
//  "Mention" logic to ensure that @mentions specifically trigger a different color bubble (e.g., Blue for mentions, Red for alerts)?
const [counts, setCounts] = useState({ mentions: 0, alerts: 0 });

useEffect(() => {
  // 1. Initial Fetch
  axios.get('/api/notifications/counts').then(res => setCounts(res.data));

  // 2. Real-time Sync
  const channel = socket.channel(`user_notifications:${currentUser.id}`, {});
  channel.join();

  channel.on("new_notification", (payload) => {
    setCounts(payload.counts);
    
    // Play different sounds based on type!
    if (payload.notification.type === 'mention') {
      playChime(); 
    } else {
      playAlert();
    }
  });

  channel.on("clear_unread", () => setCounts({ mentions: 0, alerts: 0 }));

  return () => channel.leave();
}, []);

return (
  <div className="flex gap-4">
    {/* Mention Badge (Blue) */}
    <div className="relative">
      <MentionIcon />
      {counts.mentions > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
          {counts.mentions}
        </span>
      )}
    </div>

    {/* Standard Alerts (Red) */}
    <div className="relative">
      <BellIcon />
      {counts.alerts > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-bold animate-pulse">
          {counts.alerts}
        </span>
      )}
    </div>
  </div>
);
