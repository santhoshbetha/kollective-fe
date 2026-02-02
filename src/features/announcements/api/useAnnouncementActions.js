// src/features/announcements/api/useAnnouncementActions.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useDismissAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.post(`/api/v1/announcements/${id}/dismiss`),
    onMutate: async (id) => {
      // 1. Cancel outgoing fetches
      await queryClient.cancelQueries({ queryKey: ['announcements'] });

      // 2. Optimistic Update: Filter out the dismissed item
      queryClient.setQueryData(['announcements'], (old) => 
        old ? old.filter(announcement => announcement.id !== id) : []
      );
    },
    onSettled: () => {
      // 3. Sync with server
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    }
  });
};

/*
const AnnouncementsFeed = () => {
  const { data: announcements, isLoading } = useAnnouncements();
  const { mutate: dismiss } = useDismissAnnouncement();

  if (isLoading || !announcements?.length) return null;

  return (
    <div className="announcements-area">
      {announcements.map((ann) => (
        <div key={ann.id} className="announcement-item">
          <p dangerouslySetInnerHTML={{ __html: ann.content }} />
          <button onClick={() => dismiss(ann.id)}>Got it</button>
        </div>
      ))}
    </div>
  );
};

DELETE: announcementsSlice.js.
REPLACE: Redux items with data from useAnnouncements.
REPLACE: dismiss action with useDismissAnnouncement mutation.

*/
