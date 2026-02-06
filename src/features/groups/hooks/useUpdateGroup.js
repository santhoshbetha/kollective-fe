import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateGroup(groupId) {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    // 1. The API Action (using PUT as in your original code)
    mutationFn: (params) => {
      return api.put(`/api/v1/groups/${groupId}`, params, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },

    // 2. Success logic (The replacement for importEntities)
    onSuccess: async (response) => {
      const updatedGroup = await response.json();

      // Directly update the single group cache
      queryClient.setQueryData(['groups', groupId], updatedGroup);

      // Invalidate any list that might contain this group (Search, Discover, etc.)
      // This ensures names/icons update everywhere in the app.
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },

    // Optional: Add onError to log or show a toast
    onError: (error) => {
      console.error('Update failed:', error);
    }
  });
}

/*
const { mutate: updateGroup, isPending } = useUpdateGroup(group.id);

const onSave = (formData) => {
  updateGroup(formData, {
    onSuccess: () => alert('Group updated!')
  });
};
*/

/*
Why this is a major improvement:
Cache Precision: The original useCreateEntity pushed the data into the store, but it didn't necessarily trigger other components to re-render unless they were specifically watching that exact path. TanStack's setQueryData notifies all components using useGroup(groupId) to re-render instantly.
No more "Stale Data" bugs: By invalidating the base ['groups'] key, you ensure that if the group's name changed, it updates in the sidebar, the search results, and the profile page simultaneously.
Multipart Handling: Just like the creation hook, TanStack handles the multipart/form-data (for uploading new banners or avatars) without any extra boilerplate.
Pending State: You get isPending for free, so you can show a "Saving..." state on your form submit button.
*/
