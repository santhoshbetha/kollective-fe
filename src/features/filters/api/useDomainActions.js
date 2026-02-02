export const useUnblockDomain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (domain) => api.delete('/api/v1/domain_blocks', { params: { domain } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filters', 'domains'] });
      // Force a refresh of timelines to restore the newly unblocked content
      queryClient.invalidateQueries({ queryKey: ['statuses'] });
    }
  });
};

//========================================================================================
//"Mute Domain" optimistic update"
//This replaces the legacy domainMutesSlice and ensures the UI reacts 
// instantly across all tabs TanStack Query Optimistic Updates.
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { toast } from '@/components/Toast';

export const useMuteDomain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // 1. API Call
    mutationFn: (domain) => api.post('/api/v1/domain_blocks', { domain }),

    // 2. Optimistic Update
    onMutate: async (domain) => {
      // Cancel outgoing fetches for the domain blocks list
      await queryClient.cancelQueries({ queryKey: ['filters', 'domains'] });

      // Snapshot the previous list for rollback
      const previousDomains = queryClient.getQueryData(['filters', 'domains']);

      // 1. Update the Mute List instantly
      queryClient.setQueryData(['filters', 'domains'], (old) => {
        return old ? [...old, domain] : [domain];
      });

      // 2. SURGICAL SCRUB: Remove all posts from this domain from every timeline
      // We use a partial key match to target 'home', 'public', etc.
      queryClient.setQueriesData({ queryKey: ['statuses', 'timeline'] }, (old) => {
        if (!old || !old.pages) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            items: page.items.filter(status => {
              const accountDomain = status.account.acct.split('@')[1] || window.location.host;
              return accountDomain !== domain;
            })
          }))
        };
      });

      return { previousDomains };
    },

    // 3. Handle Errors
    onError: (err, domain, context) => {
      queryClient.setQueryData(['filters', 'domains'], context.previousDomains);
      toast.error(`Failed to mute ${domain}`);
    },

    // 4. Final Sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['filters', 'domains'] });
    }
  });
};
//The Unmute Domain Mutation
//This performs the opposite: it removes the domain 
// from the list and forces a refetch of timelines to restore the content.
export const useUnmuteDomain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (domain) => api.delete('/api/v1/domain_blocks', { params: { domain } }),
    
    onMutate: async (domain) => {
      await queryClient.cancelQueries({ queryKey: ['filters', 'domains'] });
      const previous = queryClient.getQueryData(['filters', 'domains']);

      queryClient.setQueryData(['filters', 'domains'], (old) => 
        old ? old.filter(d => d !== domain) : []
      );

      return { previous };
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['filters', 'domains'] });
      // Invalidate timelines to bring back the unmuted content
      queryClient.invalidateQueries({ queryKey: ['statuses', 'timeline'] });
    }
  });
};

//========================================================================================
//Bulk Unmute
// /. It performs an Optimistic Scrub of the local cache while firing the 
// Pleroma/Mastodon DELETE requests in parallel.
export const useBulkUnmute = () => {
  const queryClient = useQueryClient();
  const clearSelection = useDomainSelectionStore((s) => s.clearSelection);

  return useMutation({
    // 1. Parallel Execution
    mutationFn: (domains) => 
      Promise.all(domains.map(d => api.delete('/api/v1/domain_blocks', { params: { domain: d } }))),

    // 2. Optimistic Update
    onMutate: async (domains) => {
      await queryClient.cancelQueries({ queryKey: ['filters', 'domains'] });
      const previous = queryClient.getQueryData(['filters', 'domains']);

      // Instantly remove all selected domains from the cache
      queryClient.setQueryData(['filters', 'domains'], (old) => 
        old ? old.filter(d => !domains.includes(d)) : []
      );

      return { previous };
    },

    onSuccess: () => {
      clearSelection();
      // Restore posts by refreshing the timelines
      queryClient.invalidateQueries({ queryKey: ['statuses', 'timeline'] });
    },

    onError: (err, domains, context) => {
      queryClient.setQueryData(['filters', 'domains'], context.previous);
    }
  });
};


