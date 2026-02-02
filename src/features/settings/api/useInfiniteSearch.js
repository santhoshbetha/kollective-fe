import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { extractMaxIdFromLink } from '@/utils/apiUtils';

export const useInfiniteSearch = (searchTerm, type = 'all') => {
  return useInfiniteQuery({
    queryKey: ['search', 'infinite', { q: searchTerm, type }],
    queryFn: async ({ pageParam }) => {
      // 1. Fetch search data with pagination parameter
      const response = await api.get('/api/v2/search', {
        params: { 
          q: searchTerm, 
          type: type === 'all' ? undefined : type,
          max_id: pageParam, // Uses ID from the 'Link' header for next results
          limit: 20
        }
      });

      const data = response.data;

      return {
        accounts: data.accounts || [],
        statuses: data.statuses || [],
        hashtags: data.hashtags || [],
        // 2. Parse the Link header for the next cursor
        nextMaxId: extractMaxIdFromLink(response.headers.get('Link'))
      };
    },
    initialPageParam: null,
    // 3. Determine the next cursor from the last page's results
    getNextPageParam: (lastPage) => lastPage.nextMaxId ?? undefined,
    enabled: searchTerm.trim().length > 1,
  });
};

/*
const InfiniteSearchResults = ({ query }) => {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteSearch(query);

  // Helper to flat-map all items from all pages
  const allAccounts = data?.pages.flatMap(page => page.accounts) || [];
  const allStatuses = data?.pages.flatMap(page => page.statuses) || [];

  return (
    <div>
      <section>
        {allAccounts.map(acc => <AccountCard key={acc.id} account={acc} />)}
      </section>
      
      <section>
        {allStatuses.map(status => <StatusCard key={status.id} status={status} />)}
      </section>

      {/* 4. Trigger for next page *//*}
      {hasNextPage && (
        <button 
          onClick={() => fetchNextPage()} 
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </button>
      )}
    </div>
  );
};

*/
//----------------------------------------------------------
// src/features/search/api/useInfiniteSearch.js
// / Search Filtering by Type
export const useInfiniteSearch2 = (searchTerm, type = 'all') => {
  return useInfiniteQuery({
    // queryKey is the "id" of the search. Changing 'type' triggers a new fetch/cache.
    queryKey: ['search', 'infinite', { q: searchTerm, type }],
    queryFn: async ({ pageParam }) => {
      const { data, headers } = await api.get('/api/v2/search', {
        params: { 
          q: searchTerm, 
          // If 'all', we leave type undefined to get everything
          type: type === 'all' ? undefined : type, 
          max_id: pageParam,
          limit: 20,
          resolve: true
        }
      });

      return {
        accounts: data.accounts || [],
        statuses: data.statuses || [],
        hashtags: data.hashtags || [],
        nextMaxId: extractMaxIdFromLink(headers.get('Link'))
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextMaxId ?? undefined,
    enabled: searchTerm.trim().length > 1,
    // Keep data fresh for 5 mins so toggling filters doesn't refetch constantly
    staleTime: 1000 * 60 * 5, 
  });
};
/*
const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'accounts' | 'statuses' | 'hashtags'

  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteSearch(query, activeTab);

  const results = data?.pages.flatMap(p => 
    activeTab === 'all' ? [...p.accounts, ...p.statuses] : p[activeTab]
  ) || [];

  return (
    <div>
      <div className="tabs">
        <button onClick={() => setActiveTab('all')}>All</button>
        <button onClick={() => setActiveTab('accounts')}>People</button>
        <button onClick={() => setActiveTab('statuses')}>Posts</button>
        <button onClick={() => setActiveTab('hashtags')}>Hashtags</button>
      </div>

      <div className="results">
        {isLoading ? <Spinner /> : results.map(item => <ResultItem key={item.id} item={item} />)}
      </div>

      {hasNextPage && <button onClick={() => fetchNextPage()}>Load More</button>}
    </div>
  );
};

*/
//=========================================

