import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useInstance = () => {
  return useQuery({
    queryKey: ['instance'],
    queryFn: async () => {
      // Mastodon V2 API provides more detail
      const { data } = await api.get('/api/v2/instance');
      return data;
    },
    // The instance configuration almost never changes; cache it forever
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24, // Keep for 24 hours
  });
};

//check later if above is enough
export const useInstance = () => useQuery({
  queryKey: ['instance'],
  queryFn: () => api.get('/api/v1/instance').then(res => res.data),
  staleTime: Infinity, // Never refetch unless the page reloads
});
