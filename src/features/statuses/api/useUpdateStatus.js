import { useMutation, useQueryClient } from '@tanstack/react-query';
import produce from 'immer'; // Optional: makes immutable updates much easier

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

export const useUpdateStatus = (statusId, conversationId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updatedData) => patchStatus(statusId, updatedData),
    onSuccess: (newStatus) => {
      // 1. Update the individual status query
      queryClient.setQueryData(['status', statusId], newStatus);

      // 2. Update the status inside the conversation collection
      queryClient.setQueryData(['status', 'context', conversationId], (oldContext) => {
        if (!oldContext) return oldContext;

        // Use immer's 'produce' or standard immutable patterns to update the Map
        return produce(oldContext, (draft) => {
          draft.allStatuses.set(statusId, newStatus);
        });
      });
    },
  });
};

/*
Use useUpdateStatus (The Mutation) 
Use this hook when you need to change data on the server, such as liking, editing, or deleting a post. 

    User Actions: Trigger it imperatively inside an onClick or onSubmit handler 
    (e.g., clicking a "Save" or "Favorite" button).
    Multi-Cache Synchronization: Use it specifically when you need the updated version 
    of a single item to appear everywhere in the app simultaneously—both in its individual view and in its parent list—without forcing a full page refresh.
    Performance: It ensures your UI remains snappy by manually updating the 
    cache instead of waiting for the server to tell the app to refetch everything. 
*/
