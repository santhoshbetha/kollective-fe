import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeleteGroupStatus(group, statusId) {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    // 1. The API Action
    mutationFn: () => api.delete(`/api/v1/groups/${group.id}/statuses/${statusId}`),

    // 2. Optimistic Update (The "Delete" logic)
    onMutate: async () => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['statuses', statusId] });

      // Snapshot the previous value
      const previousStatus = queryClient.getQueryData(['statuses', statusId]);

      // Optimistically remove from the individual cache
      queryClient.removeQueries({ queryKey: ['statuses', statusId] });

      // Return a context object with the snapshotted value
      return { previousStatus };
    },

    // 3. Rollback Logic (The "Re-import" logic)
    onError: (err, variables, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(['statuses', statusId], context.previousStatus);
      }
    },

    // 4. Final Cleanup
    onSettled: () => {
      // Refresh the group's media/timeline to ensure lists are accurate
      queryClient.invalidateQueries({ queryKey: ['timeline', 'groupMedia', group.id] });
    },
  });
}

/*
const { mutate: deleteStatus, isPending } = useDeleteGroupStatus(group, status.id);

<button onClick={() => deleteStatus()} disabled={isPending}>
  {isPending ? 'Deleting...' : 'Delete Post'}
</button>

*/
