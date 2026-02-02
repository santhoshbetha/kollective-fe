import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { toast } from '@/components/Toast';

export const useCancelScheduledStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/api/v1/scheduled_statuses/${id}`),
    
    // Optimistic Logic: Remove from the list immediately
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['statuses', 'scheduled'] });
      const previous = queryClient.getQueryData(['statuses', 'scheduled']);

      queryClient.setQueryData(['statuses', 'scheduled'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            items: page.items.filter(status => status.id !== id)
          }))
        };
      });

      return { previous };
    },
    
    onError: (err, id, context) => {
      queryClient.setQueryData(['statuses', 'scheduled'], context.previous);
      toast.error("Failed to cancel scheduled post.");
    },
    
    onSuccess: () => {
      toast.success("Post canceled successfully.");
    }
  });
};
