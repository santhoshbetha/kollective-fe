import { useMutation } from '@tanstack/react-query';
import { api } from '@/api/client';

// src/features/notifications/api/useMarkers.js
export const useUpdateMarkers = () => {
  return useMutation({
    mutationFn: (lastReadId) => 
      api.post('/api/v1/markers', { 
        notifications: { last_read_id: lastReadId } 
      }),
  });
};

/*
3. Syncing Markers (Read Status)
Mastodon uses Markers to track how far you've read. 
You can trigger this when the component unmounts or when the user scrolls.
Why this is better than your notificationsSlice:

    1.Automatic Sync: In your Redux code, if you dismiss a notification in one tab, 
      the other tab doesn't know. With TanStack Query's background polling and invalidateQueries, 
      all tabs stay in sync.
    2.Memory Management: Redux stores notifications forever. 
      TanStack Query will delete the "Mentions" list from memory
       if the user hasn't looked at it for 5 minutes (gcTime).
    3.Filter Logic: You don't need state.filter in a reducer. 
      The filterType comes from your UI state (like a URL param or a 
      Zustand store) and TanStack Query handles the different "buckets" of data automatically.
*/
