// src/features/settings/components/NotificationPermissionPrompt.jsx
import React, { useState, useEffect } from 'react';

const NotificationPermissionPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications and if we need to ask
    if ("Notification" in window && Notification.permission === 'default') {
      setShowPrompt(true);
    }
  }, []);

  const handleRequest = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="notification-banner">
      <p>Want to get reminders for upcoming events?</p>
      <button onClick={handleRequest}>Enable Notifications</button>
      <button onClick={() => setShowPrompt(false)}>Dismiss</button>
    </div>
  );
};

export default NotificationPermissionPrompt;

/*
Why this belongs in the UI layer (not a hook):
While the logic for checking permission can be a hook, the Prompt itself is a visual element that needs to be placed in your layout (usually at the top of the feed or inside the settings page).
In your Kollective-FE structure, placing it in src/features/settings is ideal because that's where users expect to manage their privacy and alert preferences.
Next Step: Are you ready to see the "Offline Support" implementation using the TanStack Query Persist Plugin to make the app work without internet?
Proactive Follow-up: Should we also add a "Mute Sounds" toggle to your settings store to control those event reminders?
*/
