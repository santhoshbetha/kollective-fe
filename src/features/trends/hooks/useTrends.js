import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useTrends = () => {
  return useQuery({
    queryKey: ['trends', 'tags'],
    queryFn: () => api.get('/api/v1/trends').then(res => res.data),
    // Trends don't change every second; cache for 15 minutes
    staleTime: 1000 * 60 * 15,
    // Optional: Only fetch if the user is logged in
    enabled: !!localStorage.getItem('access_token'),
  });
};
