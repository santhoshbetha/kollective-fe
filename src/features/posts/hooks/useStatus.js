import { useQuery } from '@tanstack/react-query';
import { statusSchema } from '../../../schemas';
import api from '../../../api/clientN';

export function useStatus(statusId) {
  //const api = useApi();

  return useQuery({
    // Unique key for this specific post
    queryKey: ['statuses', statusId],

    queryFn: async () => {
      const response = await api.get(`/api/v1/statuses/${statusId}`);
      const json = await response.json();
      
      // Parse with your existing Zod schema
      return statusSchema.parse(json);
    },

    // Guard: Don't fetch if no ID
    enabled: !!statusId,

    // Posts are highly dynamic (likes/reblogs change), 
    // so we keep the staleTime relatively short.
    staleTime: 1000 * 30, // 30 seconds
  });
}
