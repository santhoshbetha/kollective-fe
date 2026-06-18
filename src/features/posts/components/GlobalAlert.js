import React, { useState, useEffect } from 'react';
import { socket } from '../socket'; // Your existing Phoenix Socket instance


/*
Global Admin Banner, we’ll use a dedicated Phoenix Channel ("admin:alerts") that all users join. When an admin pushes a message,
 it appears instantly at the top of every user's screen, pushing the content down without covering it.

 This component sits at the very top of your main Layout (above the Navbar) and stays hidden until a message arrives.
*/
const GlobalAlert = () => {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    // 1. Join the global alerts channel
    const channel = socket.channel("admin:alerts", {});
    
    channel.join()
      .receive("ok", () => console.log("Joined Global Alerts"))
      .receive("error", resp => console.error("Unable to join", resp));

    // 2. Listen for the "emergency_broadcast" event
    channel.on("emergency_broadcast", (payload) => {
      // payload = { message: "...", level: "info" | "emergency", id: "..." }
      setAlert(payload);
      
      // Auto-hide after 30 seconds if it's just info
      if (payload.level !== 'emergency') {
        setTimeout(() => setAlert(null), 30000);
      }
    });

    // 3. Listen for a "clear" event from admins
    channel.on("clear_alert", () => setAlert(null));

    return () => channel.leave();
  }, []);

  if (!alert) return null;

  const isEmergency = alert.level === 'emergency';

  return (
    <div className={`w-full py-3 px-6 transition-all duration-500 animate-slide-down ${
      isEmergency ? 'bg-red-600 text-white font-bold' : 'bg-blue-500 text-white'
    }`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          {isEmergency && <span className="animate-pulse">⚠️</span>}
          <p className="text-sm md:text-base">{alert.message}</p>
        </div>
        
        <button 
          onClick={() => setAlert(null)}
          className="ml-4 p-1 hover:bg-white/20 rounded-full transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default GlobalAlert;
