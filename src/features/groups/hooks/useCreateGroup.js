import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateGroup() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    // 1. The API call (handling multipart/form-data for icons/banners)
    mutationFn: (params) => {
      return api.post('/api/v1/groups', params, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },

    // 2. The Success Logic (The replacement for importEntities)
    onSuccess: async (response) => {
      const newGroup = await response.json();

      // Seed the individual cache for this group so it's instant when navigating
      queryClient.setQueryData(['groups', newGroup.id], newGroup);

      // Invalidate all group lists to show the new group everywhere
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      
      // Specifically refresh the "Joined" list so the new group appears in the sidebar
      queryClient.invalidateQueries({ queryKey: ['groups', 'joined'] });
    },
  });
}

/*
const { mutate: createGroup } = useCreateGroup();

const handleSubmit = (data) => {
  createGroup(data, {
    onSuccess: (newGroup) => history.push(`/groups/${newGroup.id}`)
  });
};
*/
