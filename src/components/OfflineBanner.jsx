// src/components/OfflineBanner.jsx
import React, { useState, useEffect } from 'react';
import { onlineManager } from '@tanstack/react-query';

const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(onlineManager.isOnline());

  useEffect(() => {
    // Subscribe to TanStack's online manager
    return onlineManager.subscribe((online) => {
      setIsOnline(online);
    });
  }, []);

  if (isOnline) return null;

  return (
    <div style={{
      backgroundColor: '#ff4d4f',
      color: 'white',
      textAlign: 'center',
      padding: '8px',
      fontSize: '14px',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      📡 You are currently offline. Using cached data.
    </div>
  );
};

export default OfflineBanner;
/*
Global Visibility: Since your TanStack Query Persister affects the whole app, the warning should be global.
User Expectations: Users need to know why they can't "Post" or "Like" even though they can see their "Events" and "Feed."
Auto-Sync: As soon as onlineManager detects a connection, this banner will vanish and TanStack will automatically trigger background refetches.
*/
