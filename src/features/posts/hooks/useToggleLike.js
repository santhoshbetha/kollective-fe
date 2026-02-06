import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/clientN';

export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, liked }) => {
      const method = liked ? 'unfavourite' : 'favourite';
      return api.post(`/api/v1/statuses/${id}/${method}`);
    },

    // Optimistic Update: Update the UI before the server responds
    onMutate: async ({ id, liked }) => {
      await queryClient.cancelQueries({ queryKey: ['statuses', id] });
      const previousStatus = queryClient.getQueryData(['statuses', id]);

      // Patch the cache manually
      queryClient.setQueryData(['statuses', id], (old) => ({
        ...old,
        favourited: !liked,
        favourites_count: liked ? old.favourites_count - 1 : old.favourites_count + 1,
      }));

      return { previousStatus };
    },

    // If the server fails, roll back to the previous state
    onError: (err, { id }, context) => {
      queryClient.setQueryData(['statuses', id], context?.previousStatus);
    },
  });
};
