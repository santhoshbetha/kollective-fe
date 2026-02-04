import { useMutation, useQueryClient } from '@tanstack/react-query';

//////simple useRelationship(accountId) hook (singular) that pulls this data for a single Follow button

//To make the button functional, we’ll use useMutation to handle the API call and update the cache. 
// This ensures that when you click "Follow," the button UI updates immediately across the entire app.

//1. The Follow Mutation

export const useFollowMutation = (accountId, listKey = 'home') => {
  const queryClient = useQueryClient();

  return useMutation({
    // The API call to Mastodon
    mutationFn: async ({ isFollowing }) => {
      const action = isFollowing ? 'unfollow' : 'follow';
      const response = await api.post(`/api/v1/accounts/${accountId}/${action}`);
      return response.json(); // Returns the updated relationship object
    },

    // When the server responds with success
    onSuccess: (newRelationship) => {
      // Manually update the cache for this specific account
      // This makes the UI update instantly without a re-fetch
      queryClient.setQueryData(['relationship', listKey, accountId], newRelationship);
    },
    
    // Optional: Refresh the whole timeline if following someone might change the feed
    onSettled: () => {
       // queryClient.invalidateQueries({ queryKey: ['statuses', 'timeline', listKey] });
    }
  });
};
