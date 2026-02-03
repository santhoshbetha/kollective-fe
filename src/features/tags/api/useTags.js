import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import extractMaxIdFromLink from '@/utils/extractMaxIdFromLink';

// REPLACES: fetchHashtag
export const useTag = (name) => useQuery({
  queryKey: ['tags', 'detail', name],
  queryFn: () => api.get(`/api/v1/tags/${name}`).then(res => res.data),
  enabled: !!name,
});

// REPLACES: fetchFollowedHashtags & expandFollowedHashtags
export const useFollowedTags = () => useInfiniteQuery({
  queryKey: ['tags', 'followed'],
  queryFn: async ({ pageParam }) => {
    const response = await api.get('/api/v1/followed_tags', {
      params: { max_id: pageParam, limit: 20 }
    });
    return {
      items: response.data,
      next: extractMaxIdFromLink(response.headers.get('Link')),
    };
  },
  initialPageParam: null,
  getNextPageParam: (lastPage) => lastPage.next ?? undefined,
});

//================================================================================
//Trending Tags Sidebar
// src/features/tags/api/useTags.js
export const useTrendingTags = (limit = 5) => {
  return useQuery({
    queryKey: ['tags', 'trending', { limit }],
    queryFn: () => api.get('/api/v1/trends/tags').then(res => res.data),
    // Limit to the top X tags for the sidebar
    select: (tags) => tags.slice(0, limit),
    staleTime: 1000 * 60 * 30, // Trends change slowly
  });
};


