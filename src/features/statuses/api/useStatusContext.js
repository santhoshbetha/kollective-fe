import { useQuery } from "@tanstack/react-query";
import { api } from '@/api/client';
import { useStatusImporter } from '../hooks/useStatusImporter';

export const useStatusContext = (statusId) => {
  const { importFetchedStatuses } = useStatusImporter();

  return useQuery({
    queryKey: ['statuses', statusId, 'context'],
    queryFn: async () => {
      const response = await api.get(`/api/v1/statuses/${statusId}/context`);
      const { ancestors, descendants } = response.data;
      
      // Seed all statuses from the conversation into the global cache
      importFetchedStatuses([...ancestors, ...descendants]);
      
      return response.data;
    },
    enabled: !!statusId,
  });
};