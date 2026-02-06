import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export const useTimelineStreaming = (type) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = new WebSocket('wss://://your-instance.com');

    socket.onmessage = (event) => {
      const { event: eventType, payload } = JSON.parse(event.data);

      if (eventType === 'update') {
        const newPost = JSON.parse(payload);

        // Update the infinite query cache
        queryClient.setQueryData(['timeline', type], (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            // Insert the new post at the very beginning of the first page
            pages: oldData.pages.map((page, index) =>
              index === 0 ? [newPost, ...page] : page
            ),
          };
        });

        // Also seed the individual status cache so clicking it is instant
        queryClient.setQueryData(['statuses', newPost.id], newPost);
      }
    };

    return () => socket.close();
  }, [type, queryClient]);
};
