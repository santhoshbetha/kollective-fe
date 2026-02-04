import { useMutation, useQueryClient } from '@tanstack/react-query';

export const patchStatus = async (statusId, updatedData) => {  //chack later for right function
  const response = await fetch(`/api/v1/statuses/${statusId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      // Include authorization if your API requires it
      //'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`, 
    },
    body: JSON.stringify(updatedData), // e.g., { sensitive: true } or { content: "New text" }
  });

  if (!response.ok) {
    throw new Error('Failed to update status');
  }

  return response.json(); // Returns the newly updated status object from the server
};

/*
Implementing an optimistic update allows your UI to feel instantaneous by assuming 
the server request will succeed and updating the cache before the network call even 
finishes. If the request fails, the UI "rolls back" to its previous state
*/
export const useUpdateStatusOptimistic = (statusId, conversationId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newData) => patchStatus(statusId, newData),

    onMutate: async (newData) => {
      // 1. Cancel both queries so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['status', statusId] });
      await queryClient.cancelQueries({ queryKey: ['status', 'context', conversationId] });

      // 2. Snapshot both states for rollback
      const previousStatus = queryClient.getQueryData(['status', statusId]);
      const previousContext = queryClient.getQueryData(['status', 'context', conversationId]);

      // 3. Update the individual status
      queryClient.setQueryData(['status', statusId], (old) => ({ ...old, ...newData }));

      // 4. Update the status INSIDE the conversation Map
      if (previousContext) {
        queryClient.setQueryData(['status', 'context', conversationId], (old) => {
          // We create a new Map to trigger a re-render in React
          const newMap = new Map(old.allStatuses);
          const existingItem = newMap.get(statusId);
          
          if (existingItem) {
            newMap.set(statusId, { ...existingItem, ...newData });
          }
          
          return { ...old, allStatuses: newMap };
        });
      }

      // Return snapshots to onError
      return { previousStatus, previousContext };
    },

    // Roll back on error using the snapshot
    onError: (err, newData, context) => {
      // 5. Rollback both if the server says "No"
      if (context?.previousStatus) {
        queryClient.setQueryData(['status', statusId], context.previousStatus);
      }
      if (context?.previousContext) {
        queryClient.setQueryData(['status', 'context', conversationId], context.previousContext);
      }
      // 5. Trigger Error Toast
     // toast.error(`Update failed: ${err.message || 'Please try again'}`, {
      //  id: 'status-update-error', // Prevents duplicate toast spam
      //});
    },

    
    //onSuccess: () => {
    //  toast.success('Saved!', { duration: 2000 });
    //},

    // Refetch after settlement
    onSettled: () => {
      // 6. Refetch to ensure we match the server exactly
      queryClient.invalidateQueries({ queryKey: ['status', statusId] });
      queryClient.invalidateQueries({ queryKey: ['status', 'context', conversationId] });
    },
  });
};
/*
To do this safely with TanStack Query, you must handle three specific lifecycle functions in your mutation:

    1. onMutate: Cancel outgoing fetches, save a snapshot of current data, and update the cache immediately.
    2. onError: Use the snapshot to restore the old data if the server request fails.
    3. onSettled: Always refetch (invalidate) to ensure the client is perfectly synced with the 
       final server state.

Liking a post	           Optimistic	Heart turns red instantly; feels fast.
Editing text content	   Standard	    Spinner appears; user sees the "final" saved version.
Deleting a post	           Standard	    Item stays until server confirms; prevents "ghost" items.
Updating Privacy	       Standard	    Wait for confirmation to ensure data isn't accidentally public.
*/

/*
const { mutate, isPending } = useUpdateStatusOptimistic(id, convId);

// Add a slight transparency or 'syncing' icon if isPending is true
<article className={isPending ? 'opacity-50' : ''}> ... </article>
*/

/*
TOAST LATER
*/