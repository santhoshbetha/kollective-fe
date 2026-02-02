import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useInstance } from '@/features/instance/api/useInstance';

export const useScheduledStatuses = () => {
  const { data: instance } = useInstance();
  
  // Logic Port: Only enable the query if the instance supports scheduled statuses
  const isEnabled = !!instance?.configuration?.statuses?.max_scheduled_at;

  return useInfiniteQuery({
    queryKey: ['statuses', 'scheduled'],
    queryFn: async ({ pageParam }) => {
      const response = await api.get('/api/v1/scheduled_statuses', {
        params: { max_id: pageParam, limit: 20 }
      });
      
      return {
        items: response.data,
        nextMaxId: extractMaxIdFromLink(response.headers.get('Link')),
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextMaxId ?? undefined,
    enabled: isEnabled,
  });
};
