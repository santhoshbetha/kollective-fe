// Inside a WebSocket listener hook
socket.onmessage = (event) => {
  const { event: type, payload } = JSON.parse(event.data);
  if (type === 'notification') {
    const newNotify = JSON.parse(payload);
    
    // Increment the badge count optimistically
    queryClient.setQueryData(['notifications', 'unread-count'], (old) => ({
      count: (old?.count || 0) + 1
    }));

    // Inject notification into the infinite list cache
    queryClient.setQueryData(['notifications'], (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page, i) => i === 0 ? [newNotify, ...page] : page)
      };
    });
  }
};


//useNotifications2

//========================================"Delete Post"=================================

/*
To handle a
"Delete Post" event via WebSockets in TanStack Query, you use queryClient.removeQueries for 
the specific post and queryClient.setQueriesData to scrub it from all active timelines
 (Home, Lists, Group feeds).
This replaces the manual deleteEntities action in the Soapbox reducer.ts.
*/
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useStreamingUpdates() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Replace with your actual streaming URL and Auth token
    const socket = new WebSocket('wss://://your-instance.com');

    socket.onmessage = (event) => {
      const { event: type, payload } = JSON.parse(event.data);
      const data = JSON.parse(payload); // payload is the ID or the full object

      switch (type) {
        case 'delete': {
          const deletedStatusId = data; // Usually just the ID string

          // 1. Remove the individual post from the cache
          queryClient.removeQueries({ queryKey: ['statuses', deletedStatusId] });

          // 2. Scrub the post from EVERY active timeline/list
          // We use a partial key ['timeline'] to find Home, Public, Group feeds, etc.
          queryClient.setQueriesData({ queryKey: ['timeline'] }, (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                // Filter out the deleted post from the items array
                items: page.items.filter((status) => status.id !== deletedStatusId),
              })),
            };
          });
          break;
        }

        case 'update':
          // ... (existing logic for new posts)
          break;
      }
    };

    return () => socket.close();
  }, [queryClient]);
}

/*
// src/App.js
import { useStreamingUpdates } from 'features/streaming/hooks/useStreamingUpdates';

function App() {
  useStreamingUpdates(); // Keeps the TanStack cache in sync with the server
  return <Layout>...</Layout>;
}

*/

////////////////////////Connection Status Indicator/////////////////////////
/*
To add a Connection Status Indicator, we need to track the state of the WebSocket inside our useStreamingUpdates hook. Since this state needs to be shared with the UI (to show the user a "Reconnecting..." bar), we can use Zustand or a simple React Context.
Here is the implementation using a simple local state that you can later move to a global store.
*/
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useStreamingUpdates() {
  const queryClient = useQueryClient();
  // Statuses: 'connecting', 'connected', 'disconnected'
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    let socket;
    let reconnectTimeout;

    const connect = () => {
      socket = new WebSocket('wss://://your-instance.com');

      socket.onopen = () => {
        setStatus('connected');
      };

      socket.onmessage = (event) => {
        const { event: type, payload } = JSON.parse(event.data);
        // ... (Existing logic to update queryClient cache)
      };

      socket.onclose = () => {
        setStatus('disconnected');
        // Simple auto-reconnect logic
        reconnectTimeout = setTimeout(connect, 3000);
      };

      socket.onerror = () => {
        setStatus('disconnected');
        socket.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      socket.close();
    };
  }, [queryClient]);

  return { status };
}

/*
src/features/streaming/components/StreamingStatus.jsx  :
import React from 'react';
import { useStreamingUpdates } from '../hooks/useStreamingUpdates';

export function StreamingStatus() {
  const { status } = useStreamingUpdates();

  if (status === 'connected') return null; // Hide if everything is fine

  return (
    <div style={{
      backgroundColor: status === 'connecting' ? '#ff9800' : '#f44336',
      color: 'white',
      textAlign: 'center',
      padding: '5px',
      fontSize: '12px',
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 9999
    }}>
      {status === 'connecting' ? 'Connecting to live feed...' : 'Disconnected. Retrying...'}
    </div>
  );
}


*/


