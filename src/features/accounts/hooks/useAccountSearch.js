import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useStatusImporter } from '../hooks/useStatusImporter';

export const useAccountSearch = (searchTerm, limit = 10) => {
  const { importAccounts } = useStatusImporter();

  return useQuery({
    // The queryKey includes searchTerm so TanStack handles the cache for each search
    queryKey: ['accounts', 'search', { q: searchTerm, limit }],
    queryFn: async ({ signal }) => {
      // 1. Fetch search results
      // 'signal' is automatically provided by TanStack for request cancellation
      const { data } = await api.get('/api/v1/accounts/search', {
        params: { q: searchTerm, limit },
        signal, 
      });

      // 2. SIDE-LOADING: Seed the global account cache
      // This replaces dispatch(importFetchedAccounts(accounts))
      importAccounts(data);

      return data;
    },
    // 3. Logic: Don't search until the user types at least 2 characters
    enabled: searchTerm.length >= 2,
    // Keep results for 5 minutes so clicking 'back' is instant
    staleTime: 1000 * 60 * 5,
  });
};


/*
const SearchBar = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300); // 300ms delay

  const { data: results, isLoading, isFetching } = useAccountSearch(debouncedQuery);

  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
        placeholder="Search accounts..." 
      />
      
      {(isLoading || isFetching) && <Spinner />}
      
      <ul>
        {results?.map(account => (
          <AccountRow key={account.id} account={account} />
        ))}
      </ul>
    </div>
  );
};

*/