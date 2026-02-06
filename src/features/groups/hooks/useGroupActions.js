import { useMutation, useQueryClient } from '@tanstack/react-query';

//useEntityActions replacement

//In the original Soapbox code, useEntityActions is a "Swiss Army Knife" hook that bundles POST, 
// PATCH, and DELETE operations into one object. It relies on string replacement (like :id) to build URLs.

//In TanStack Query, we don't need a massive generic wrapper like this. Instead, we use Composition.
//  You create a single hook for a feature (e.g., useGroupActions) and return multiple useMutation 
// instances. This is cleaner, type-safe, and avoids the "regex-style" URL builders.

//The Modern Replacement (JS)
//Instead of a generic useEntityActions, you create a Domain-Specific Action Hook.

export function useGroupActions(groupId) {
  const api = useApi();
  const queryClient = useQueryClient();

  // 1. Create Mutation (POST)
  const create = useMutation({
    mutationFn: (data) => api.post('/api/v1/groups', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });

  // 2. Update Mutation (PATCH/PUT)
  const update = useMutation({
    mutationFn: (data) => api.patch(`/api/v1/groups/${groupId}`, data),
    onSuccess: (updatedGroup) => {
      // Direct update of the specific group cache
      queryClient.setQueryData(['groups', groupId], updatedGroup);
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  // 3. Delete Mutation (DELETE)
  const remove = useMutation({
    mutationFn: () => api.delete(`/api/v1/groups/${groupId}`),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['groups', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  return {
    create: create.mutate,
    update: update.mutate,
    remove: remove.mutate,
    // Unified loading state like the original code
    isSubmitting: create.isPending || update.isPending || remove.isPending,
    // Access to specific errors if needed
    errors: {
      create: create.error,
      update: update.error,
      remove: remove.error,
    }
  };
}

/*
Why this is better than the original useEntityActions:

    1. No String Replacement Hacks: The original code used .replace(/:id/g, entityId).
    In the TanStack version, we use standard template literals, which are less error-prone and easier for IDEs to track.
    2. Specific Invalidation: In the old Redux code, useCreateEntity was generic, so it didn't always
       know exactly which lists to refresh. Here, you can specify exactly which Query Keys (like ['groups', 'joined']) should be updated.
    3. Granular Feedback: The original hook gave you one isSubmitting for all three actions. While I 
       kept that for compatibility, TanStack allows you to check update.isPending specifically, so you can show a spinner only on the "Update" button while the "Delete" button remains clickable.
    4. No Boilerplate: You no longer need to pass an endpoints configuration object with different 
       URL patterns. The logic is co-located with the function.
*/

/*
const { create, update, remove, isSubmitting } = useGroupActions(group.id);

return (
  <form onSubmit={(e) => update(formData)}>
    <button type="submit" disabled={isSubmitting}>Save Changes</button>
    <button onClick={() => remove()} disabled={isSubmitting}>Delete Group</button>
  </form>
);
*/