import { useMutation, useQueryClient } from '@tanstack/react-query';

export const patchPost = async (postId, updatedData) => {  //chack later for right function
  const response = await fetch(`/api/v1/posts/${postId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      // Include authorization if your API requires it
      //'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`, 
    },
    body: JSON.stringify(updatedData), // e.g., { sensitive: true } or { content: "New text" }
  });

  if (!response.ok) {
    throw new Error('Failed to update post');
  }

  return response.json(); // Returns the newly updated post object from the server
};

/*
Implementing an optimistic update allows your UI to feel instantaneous by assuming 
the server request will succeed and updating the cache before the network call even 
finishes. If the request fails, the UI "rolls back" to its previous state
*/
export const useUpdatePostOptimistic = (postId, conversationId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newData) => patchPost(postId, newData),

    onMutate: async (newData) => {
      // 1. Cancel both queries so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['post', postId] });
      await queryClient.cancelQueries({ queryKey: ['post', 'context', conversationId] });

      // 2. Snapshot both states for rollback
      const previousPost = queryClient.getQueryData(['post', postId]);
      const previousContext = queryClient.getQueryData(['post', 'context', conversationId]);

      // 3. Update the individual post
      queryClient.setQueryData(['post', postId], (old) => ({ ...old, ...newData }));

      // 4. Update the post INSIDE the conversation Map
      if (previousContext) {
        queryClient.setQueryData(['post', 'context', conversationId], (old) => {
          // We create a new Map to trigger a re-render in React
          const newMap = new Map(old.allPosts);
          const existingItem = newMap.get(postId);
          
          if (existingItem) {
            newMap.set(postId, { ...existingItem, ...newData });
          }
          
          return { ...old, allPosts: newMap };
        });
      }

      // Return snapshots to onError
      return { previousPost, previousContext };
    },

    // Roll back on error using the snapshot
    onError: (err, newData, context) => {
      // 5. Rollback both if the server says "No"
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
      if (context?.previousContext) {
        queryClient.setQueryData(['post', 'context', conversationId], context.previousContext);
      }
      // 5. Trigger Error Toast
     // toast.error(`Update failed: ${err.message || 'Please try again'}`, {
      //  id: 'post-update-error', // Prevents duplicate toast spam
      //});
    },

    
    //onSuccess: () => {
    //  toast.success('Saved!', { duration: 2000 });
    //},

    // Refetch after settlement
    onSettled: () => {
      // 6. Refetch to ensure we match the server exactly
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', 'context', conversationId] });
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
const { mutate, isPending } = useUpdatePostOptimistic(id, convId);

// Add a slight transparency or 'syncing' icon if isPending is true
<article className={isPending ? 'opacity-50' : ''}> ... </article>
*/

/*
TOAST LATER
*/