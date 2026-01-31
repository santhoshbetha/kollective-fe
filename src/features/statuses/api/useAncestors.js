import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useStatusImporter } from '../hooks/useStatusImporter'; // Feature-local import

export const useAncestors = (id) => {
  const { importFetchedStatuses } = useStatusImporter();
  
  return useQuery({
    queryKey: ['statuses', id, 'ancestors'],
    queryFn: async () => {
      const data = await api.getAncestors(id);
      importFetchedStatuses(data); // Side-load into cache
      return data;
    },
  });
};
