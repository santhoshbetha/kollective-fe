import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useBlockDomain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (domain) => api.post('/api/v1/domain_blocks', { domain }),
    onSuccess: (_, domain) => {
      // 1. Remove all posts from this domain immediately
      queryClient.setQueriesData({ queryKey: ['statuses'] }, (old) => ({
        ...old,
        pages: old.pages.map(page => ({
          ...page,
          items: page.items.filter(status => !status.account.acct.endsWith(`@${domain}`))
        }))
      }));
      // 2. Invalidate the domain blocks list
      queryClient.invalidateQueries({ queryKey: ['settings', 'domain_blocks'] });
    }
  });
};

/*
Why this is better than Redux:

    1. Encapsulated State: Content warnings are mostly "transient" UI states. 
    Storing them in local useState is more performant than global Redux state because 
    it prevents app-wide re-renders when a single post is expanded.
    2. Automatic Propagation: When you mute a domain, TanStack Query's setQueriesData
     applies the filter to every timeline (Home, Local, Federated) simultaneously.
    3. Simplified Cleanup: You no longer need to manage a complex mutedDomains array 
    in a reducer; the Query Client handles the state update and synchronization. 
*/
