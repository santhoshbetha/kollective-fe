import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useStatusImporter } from '@/features/statuses/hooks/useStatusImporter';

export const useComposeSuggestions = (token, type) => {
  const { importAccounts } = useStatusImporter();

  return useQuery({
    // Query is keyed by the typing token (e.g., "@san" or "#mast")
    queryKey: ['compose', 'suggestions', type, token],
    queryFn: async ({ signal }) => {
      const q = token.slice(1);
      
      if (type === 'account') {
        const { data } = await api.get('/api/v1/accounts/search', {
          params: { q, resolve: false, limit: 10 },
          signal, // Replaces cancelFetchComposeSuggestions?.abort()
        });
        importAccounts(data);
        return data;
      }

      if (type === 'hashtag') {
        const { data } = await api.get('/api/v2/search', {
          params: { q, limit: 10, type: 'hashtags' },
          signal,
        });
        return data.hashtags;
      }
      
      return [];
    },
    // Only fetch if token is long enough
    enabled: token.length >= 2,
    // Keep results for 5 mins to prevent refetching while typing
    staleTime: 1000 * 60 * 5,
  });
};
