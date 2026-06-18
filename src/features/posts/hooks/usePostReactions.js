// src/features/posts/api/usePostReactions.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

//This replaces fetchEmojiReacts. It handles 
// fetching the list of users who reacted with a specific emoji (or all emojis).
export const useReactionParticipants = (postId, emoji) => {
  return useQuery({
    queryKey: [posts', 'reactions', postId, emoji || 'all'],
    queryFn: async () => {
      const url = emoji 
        ? `/api/v1/kollective/posts/${postId}/reactions/${emoji}`
        : `/api/v1/kollective/posts/${postId}/reactions`;
      
      const { data } = await api.get(url);
      // Data is typically an array of { name: string, count: number, accounts: Account[], me: boolean }
      return data;
    },
    enabled: !!postId,
    staleTime: 1000 * 60 * 2, // 2 mins
  });
};
