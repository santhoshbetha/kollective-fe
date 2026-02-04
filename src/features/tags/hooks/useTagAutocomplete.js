import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

//Tag Autocomplete
export const useTagAutocomplete = (query) => {
  return useQuery({
    // Cache unique results for each string typed
    queryKey: ['tags', 'autocomplete', query],
    queryFn: async ({ signal }) => {
      const { data } = await api.get('/api/v2/search', {
        params: {
          q: query,
          type: 'hashtags',
          limit: 5,
          resolve: false
        },
        signal, // Automatically cancels previous request if user keeps typing
      });
      return data.hashtags;
    },
    // Only run if query is at least 2 characters
    enabled: query.length >= 2,
    // Keep results in memory so backspacing is instant
    staleTime: 1000 * 60 * 5, 
  });
};

/*
const TagSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: suggestions, isFetching } = useTagAutocomplete(searchTerm);

  return (
    <div className="search-container">
      <input 
        type="text" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search hashtags..."
      />

      {suggestions && suggestions.length > 0 && (
        <ul className="autocomplete-dropdown">
          {suggestions.map(tag => (
            <li key={tag.name}>
              <Link href={`/tags/${tag.name}`}>
                #{tag.name} <span>({tag.history[0].accounts} posts)</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

*/
