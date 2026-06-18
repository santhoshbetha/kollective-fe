import React, { useState, useEffect } from 'react';
import { socket } from '../socket'; // Your socket instance

/*
Global Alert
This component should be placed in your top-level layout (e.g., App.js) so it is always active. It listens for the emergency_broadcast event and displays a themed banner. 

*/
const GlobalBanner = () => {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const channel = socket.channel("admin:alerts", {});
    channel.join();

    channel.on("emergency_broadcast", (payload) => {
      // payload = { message: "Stay away from District X", level: "emergency", id: "..." }
      setAlert(payload);
    });

    return () => channel.leave();
  }, []);

  if (!alert) return null;

  const bgStyles = {
    emergency: 'bg-red-600 animate-pulse',
    warning: 'bg-orange-500',
    info: 'bg-blue-600'
  };

  return (
    <div className={`w-full py-3 px-6 text-white font-bold flex justify-between items-center ${bgStyles[alert.level] || bgStyles.info}`}>
      <div className="flex items-center gap-2">
        {alert.level === 'emergency' && <span>⚠️</span>}
        <p>{alert.message}</p>
      </div>
      <button onClick={() => setAlert(null)} className="hover:opacity-70 text-xl">✕</button>
    </div>
  );
};

export default GlobalBanner;
/*
4. Admin Trigger (The "Emergency" Button) 
In your Admin Dashboard, add a form to push the alert via the socket.
*/
const sendAlert = (message, level) => {
  // adminChannel is the channel joined by the admin specifically
  adminChannel.push("send_global_alert", { message, level });
};
/*
Why this works:

    Real-time Propagation: Using Phoenix Channels ensures the banner appears on every active user's screen in milliseconds without a refresh.
    Multiplexing: Users stay on their current socket connection (used for their feed) but multiplex this additional "alert" channel.
    Emergency Persistence: By placing the component in the root layout, the alert stays visible even if the user switches tabs or navigates between local and world feeds. 
*/