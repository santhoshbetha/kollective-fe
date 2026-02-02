import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

// 1. Fetch the list of muted domains
export const useMutedDomains = () => useQuery({
  queryKey: ['filters', 'domains'],
  queryFn: () => api.get('/api/v1/domain_blocks').then(res => res.data),
  staleTime: Infinity, // These change very rarely
});

// 2. The Mutation to block a new domain
export const useBlockDomain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (domain) => api.post('/api/v1/domain_blocks', { domain }),
    
    // OPTIMISTIC UI: Scrub the cache of all posts from this domain immediately
    onMutate: async (domain) => {
      await queryClient.cancelQueries({ queryKey: ['statuses'] });

      queryClient.setQueriesData({ queryKey: ['statuses'] }, (old) => {
        if (!old || !old.pages) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            items: page.items.filter(status => {
              // Check the author's domain (e.g., user@domain.com)
              const accountDomain = status.account.acct.split('@')[1];
              return accountDomain !== domain;
            })
          }))
        };
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filters', 'domains'] });
    }
  });
};

//======================================================================
// /Muted Domain Search
// To implement Muted Domain Search, you use the select option in your useMutedDomains hook. 
// This allows you to filter the list of domains already stored in the TanStack Query cache 
// without sending new requests to the server.

// The Searchable Muted Domains Hook
// This pattern ensures that searching through 100+ muted domains is instant 
// and memoized TanStack Query Select Documentation.
// src/features/filters/api/useDomainMutes.js
export const useSearchableMutedDomains = (query = '') => {
  return useQuery({
    queryKey: ['filters', 'domains'],
    queryFn: () => api.get('/api/v1/domain_blocks').then(res => res.data),
    staleTime: 1000 * 60 * 60, // 1 hour
    // THE FILTERING ENGINE
    select: (domains) => {
      if (!query) return domains;
      const lowerQuery = query.toLowerCase();
      return domains.filter(domain => 
        domain.toLowerCase().includes(lowerQuery)
      );
    }
  });
};
/*
const MutedDomainManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: filteredDomains, isLoading } = useSearchableMutedDomains(searchTerm);
  const { mutate: unmute } = useUnmuteDomain();

  return (
    <div className="domain-manager">
      <input 
        type="text" 
        placeholder="Search muted domains..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      <div className="domain-list">
        {isLoading ? <Spinner /> : filteredDomains?.map(domain => (
          <div key={domain} className="domain-row">
            <span>{domain}</span>
            <button onClick={() => unmute(domain)}>Unmute</button>
          </div>
        ))}
      </div>
    </div>
  );
};

*/



