import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useAnnouncements = () => {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/announcements');
      return data; // Returns Array of Announcement objects
    },
    // Announcements change rarely; fetch on mount but don't spam the server
    staleTime: 1000 * 60 * 30, // 30 minutes
    // Background polling: keep the "News" fresh every 15 minutes
    refetchInterval: 1000 * 60 * 15,
  });
};
