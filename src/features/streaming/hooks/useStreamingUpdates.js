import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

//example of how to handle a WebSocket "Update" event using TanStack's setQueryData

//To handle real-time updates (like a new "Like" or a status update via WebSockets) in
//TanStack Query, you use queryClient.setQueryData. This effectively replaces the logic 
// inside the Soapbox reducer.ts and the importEntities action.

//The WebSocket Implementation
//Instead of dispatching an action to a Redux store, your WebSocket listener identifies which 
//Query Key needs to change and patches it directly.

export const useStreamingUpdates = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = new WebSocket('wss://://mastodon-instance.com');

    socket.onmessage = (event) => {
      const { event: type, payload } = JSON.parse(event.data);

      if (type === 'update') {
        const newStatus = JSON.parse(payload);

        // 1. Update the individual status cache
        queryClient.setQueryData(['statuses', newStatus.id], newStatus);

        // 2. Add it to the top of the timeline cache
        queryClient.setQueryData(['timeline', 'home'], (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page, index) => 
              index === 0 ? [newStatus, ...page] : page
            ),
          };
        });
      }
    };

    return () => socket.close();
  }, [queryClient]);
};


/*
Why this is better than the Reducer

    Scope: You only update the specific caches currently being viewed. If the user isn't looking at the 
    "home" timeline, you don't have to waste resources updating its state.
    No Logic in Reducers: You don't have to write complex switch statements or ...state spreads 
    for every possible entity type.
    Automatic UI Sync: Any component using useQuery(['statuses', id]) will automatically re-render 
    with the new data the moment setQueryData is called.
*/

/*
In a clean architecture, you should move away from
entity-store/ (since that is tied to the Redux mindset) 
and place this in a directory dedicated to external data synchronization.
*/
