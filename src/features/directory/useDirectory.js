import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useStatusImporter } from '@/features/statuses/hooks/useStatusImporter';

export const useDirectory = (params = {}) => {
  const queryClient = useQueryClient();
  const { importAccounts } = useStatusImporter();

  return useInfiniteQuery({
    // Cache is partitioned by search/filter params (e.g., 'local' vs 'global')
    queryKey: ['accounts', 'directory', params],
    queryFn: async ({ pageParam = 0 }) => {
      // Replaces fetchDirectory & expandDirectory
      const response = await api.get('/api/v1/directory', {
        params: { ...params, offset: pageParam, limit: 20 }
      });
      const data = response.data;

      // 1. SIDE-LOADING: Seed global account cache
      importAccounts(data);

      // 2. RELATIONSHIPS: Prefetch relationship statuses
      // Replaces dispatch(fetchRelationships(ids))
      const ids = data.map(acc => acc.id);
      if (ids.length > 0) {
        queryClient.prefetchQuery({
          queryKey: ['relationships', ids.sort()],
          queryFn: () => api.get('/api/v1/accounts/relationships', { params: { id: ids } }).then(res => res.data)
        });
      }

      return data;
    },
    initialPageParam: 0,
    // Logic Port: Use the length of items as the next offset
    getNextPageParam: (lastPage, allPages) => {
      const currentOffset = allPages.flat().length;
      return lastPage.length === 20 ? currentOffset : undefined;
    },
    staleTime: 1000 * 60 * 5, // Directory data is stable for 5m
  });
};
/*
const DirectoryList = ({ order }) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useDirectory({ order });

  if (isLoading) return <DirectorySkeleton />;

  return (
    <div className="directory-grid">
      {data?.pages.map((page) => 
        page.map((account) => <AccountCard key={account.id} account={account} />)
      )}

      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </button>
      )}
    </div>
  );
};

*/
//================================================================================
//Directory Filtering
//Update your useDirectory hook in src/features/directory/api/useDirectory.js. By passing the order (active, new)
// or local flag into the queryKey, you ensure that switching tabs doesn't overwrite your previous data.


// src/features/directory/api/useDirectory.js
export const useDirectory = (filters) => {
  const { importAccounts } = useStatusImporter();

  return useInfiniteQuery({
    // Cache is partitioned by filter: ['directory', { order: 'active' }]
    queryKey: ['accounts', 'directory', filters],
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await api.get('/api/v1/directory', {
        params: { 
          ...filters, 
          offset: pageParam, 
          limit: 20 
        }
      });
      
      importAccounts(data);
      return data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const nextOffset = allPages.flat().length;
      return lastPage.length === 20 ? nextOffset : undefined;
    },
    // High staleTime because the directory doesn't change rapidly
    staleTime: 1000 * 60 * 10, 
  });
};
/*
const DirectoryPage = () => {
  const [filters, setFilters] = useState({ order: 'active', local: true });
  const { data, fetchNextPage, hasNextPage } = useDirectory(filters);

  return (
    <div>
      <div className="filter-tabs">
        <button onClick={() => setFilters({ ...filters, order: 'active' })}>
          Recently Active
        </button>
        <button onClick={() => setFilters({ ...filters, order: 'new' })}>
          New Arrivals
        </button>
        <label>
          <input 
            type="checkbox" 
            checked={filters.local} 
            onChange={(e) => setFilters({ ...filters, local: e.target.checked })} 
          />
          Local Only
        </label>
      </div>

      <div className="grid">
        {data?.pages.map(page => 
           page.map(account => <AccountCard key={account.id} account={account} />)
        )}
      </div>
    </div>
  );
};

*/
//==================================================================================
//Directory Search
//Thinking
//To implement Directory Search, you integrate the search query directly into your useDirectory hook.
//  By adding the search string to the Query Key, TanStack Query automatically manages debouncing 
// nd caching, allowing you to delete any specialized "Search" slices in Redux.
// src/features/directory/api/useDirectory.js
//Update src/features/directory/api/useDirectory.js. 
// By passing the q parameter, you transform the static directory into a dynamic search engine.
export const useDirectory = (filters, query = '') => {
  const { importAccounts } = useStatusImporter();

  return useInfiniteQuery({
    // Cache is unique to the filter + search string combo
    queryKey: ['accounts', 'directory', { ...filters, q: query }],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await api.get('/api/v1/directory', {
        params: { 
          ...filters, 
          q: query,
          offset: pageParam, 
          limit: 20 
        }
      });
      
      importAccounts(response.data);
      return response.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const nextOffset = allPages.flat().length;
      return lastPage.length === 20 ? nextOffset : undefined;
    },
    // Only enable search if query is empty or >= 2 chars to prevent API spam
    enabled: !query || query.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
};
/*
const DirectorySearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedQuery = useDebounce(searchTerm, 300);
  
  const { data, isLoading } = useDirectory({ order: 'active' }, debouncedQuery);

  return (
    <div className="directory-container">
      <input 
        type="search"
        placeholder="Search directory..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <div className="results-grid">
        {isLoading ? <Spinner /> : (
          data?.pages.map(page => 
            page.map(account => <AccountCard key={account.id} account={account} />)
          )
        )}
      </div>
    </div>
  );
};

*/
//==================================================================================




