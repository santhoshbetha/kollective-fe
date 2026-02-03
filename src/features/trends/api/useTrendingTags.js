// src/features/trends/api/useTrendingTags.js
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useTrendingTags = (limit = 10) => {
  return useQuery({
    queryKey: ['trends', 'tags', { limit }],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/trends/tags', {
        params: { limit }
      });
      return data; // Returns Array of Tag objects
    },
    // Trends update slowly; 30-minute stale time is often sufficient
    staleTime: 1000 * 60 * 30,
  });
};

//======================================================================
// src/features/trends/api/useTrendingTags.js
export const useTrendingTags2 = () => {
  return useQuery({
    queryKey: ['trends', 'tags'],
    queryFn: () => api.get('/api/v1/trends/tags').then(res => res.data),
    select: (tags) => tags.map(tag => ({
      ...tag,
      totalCount: tag.history.reduce((acc, day) => acc + Number(day.accounts), 0)
    })),
    staleTime: 1000 * 60 * 30,
  });
};
/*

*/

