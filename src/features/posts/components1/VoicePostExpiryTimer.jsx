import React, { useState, useEffect } from 'react';

const VoicePostExpiryTimer = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTime = () => {
      const difference = new Date(expiresAt) - new Date(); // Both are treated as UTC
      
      if (difference <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const m = Math.floor((difference / 1000 / 60) % 60);
      const s = Math.floor((difference / 1000) % 60);

      setTimeLeft(`${h}h ${m}m ${s}s`);
    };

    const timer = setInterval(calculateTime, 1000);
    calculateTime(); // Initial call

    return () => clearInterval(timer);
  }, [expiresAt]);

  if (!expiresAt) return null;

  return (
    <div className="flex items-center text-red-600 font-mono text-sm animate-pulse">
      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {timeLeft}
    </div>
  );
};

export default VoicePostExpiryTimer;

/*
Use a useEffect hook with an interval to update the remaining time every second. This prevents "stale" timers when a user leaves the tab open.
*/

/*
3. Why this works for Discovery

    Urgency Visualized: In your "Local Connections" or "Electoral District" feeds, seeing a red ticking clock on a Voice Post signals to the user that they need to act (upvote/reply) now before the post vanishes.
    Automatic Sync: Since the browser handles the difference between new Date() (local system time) and expiresAt (UTC), the "Time Remaining" is identical regardless of the user's timezone settings.
*/

/*
4. Handling "Ghost" Posts
If a user is looking at a post that hits 00h 00m 00s, the Oban Job on your server will mark it as deleted_at. In your React app, you can add a simple check: if timeLeft === 'Expired', you can trigger a UI state to fade the post out or show a "This post has concluded" message.
*/