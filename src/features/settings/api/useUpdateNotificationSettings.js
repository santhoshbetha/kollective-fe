import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // REPLACES: api().put(...)
    mutationFn: (params) => 
      api.put('/api/pleroma/notification_settings', params).then(res => res.data),

    // OPTIONAL: Optimistic Update
    // REPLACES: NOTIFICATION_SETTINGS_REQUEST
    onMutate: async (newParams) => {
      await queryClient.cancelQueries({ queryKey: ['settings', 'notifications'] });
      const previousSettings = queryClient.getQueryData(['settings', 'notifications']);

      // Patch the local cache immediately
      queryClient.setQueryData(['settings', 'notifications'], (old) => ({
        ...old,
        ...newParams,
      }));

      return { previousSettings };
    },

    // REPLACES: NOTIFICATION_SETTINGS_FAIL
    onError: (err, params, context) => {
      queryClient.setQueryData(['settings', 'notifications'], context.previousSettings);
    },

    // REPLACES: NOTIFICATION_SETTINGS_SUCCESS
    onSuccess: (data) => {
      // Sync with the actual server response
      queryClient.setQueryData(['settings', 'notifications'], data);
    },
  });
};
