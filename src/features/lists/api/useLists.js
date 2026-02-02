import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useStatusImporter } from '@/features/statuses/hooks/useStatusImporter';

// 1. Fetch all available lists (List of Lists)
export const useUserLists = () => useQuery({
  queryKey: ['lists'],
  queryFn: () => api.get('/api/v1/lists').then(res => res.data),
  staleTime: 1000 * 60 * 10, // Lists don't change often
});

// 2. Fetch a specific list's timeline (Infinite Scroll)
export const useListTimeline = (listId) => {
  const { importStatusEntities } = useStatusImporter();

  return useInfiniteQuery({
    queryKey: ['statuses', 'list', listId],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get(`/api/v1/timelines/list/${listId}`, {
        params: { max_id: pageParam, limit: 20 }
      });
      
      // SIDE-LOADING: Seed the cache for any accounts/polls found
      importStatusEntities(data);
      return data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage[lastPage.length - 1]?.id,
    enabled: !!listId,
  });
};

//================================================================================
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

// REPLACES: fetchLists
export const useUserLists = () => useQuery({
  queryKey: ['lists'],
  queryFn: () => api.get('/api/v1/lists').then(res => res.data),
  staleTime: 1000 * 60 * 15, // Lists are stable
});

// REPLACES: fetchList
export const useList = (id) => useQuery({
  queryKey: ['lists', id],
  queryFn: () => api.get(`/api/v1/lists/${id}`).then(res => res.data),
  enabled: !!id,
});

// REPLACES: fetchListAccounts
export const useListMembers = (listId) => useQuery({
  queryKey: ['lists', listId, 'members'],
  queryFn: () => api.get(`/api/v1/lists/${listId}/accounts`).then(res => res.data),
  enabled: !!listId,
});

// REPLACES: fetchAccountLists (Which lists contain this user?)
export const useAccountMemberships = (accountId) => useQuery({
  queryKey: ['accounts', accountId, 'memberships'],
  queryFn: () => api.get(`/api/v1/accounts/${accountId}/lists`).then(res => res.data),
  enabled: !!accountId,
});

// /Replaces fetchListSuggestions

export const useListSuggestions = (q) => useQuery({
  queryKey: ['accounts', 'search', 'suggestions', q],
  queryFn: () => api.get('/api/v1/accounts/search', {
    params: { q, resolve: false, limit: 4, following: true }
  }).then(res => res.data),
  enabled: q.length > 1,
});

//==================================================================================
//"List Autocomplete"
//To implement List Autocomplete (filtering through your own created lists as you type), you should 
// use the select option in your useUserLists hook. This allows you to fetch all your lists once
//  and filter them in memory, providing an instant, zero-latency search experience.

// src/features/lists/api/useLists.js
export const useSearchableLists = (query = '') => {
  return useQuery({
    queryKey: ['lists'], // Keep the same base key to share cache
    queryFn: () => api.get('/api/v1/lists').then(res => res.data),
    staleTime: 1000 * 60 * 15,
    // THE FILTERING ENGINE
    select: (lists) => {
      if (!query) return lists;
      const lowerQuery = query.toLowerCase();
      return lists.filter(list => 
        list.title.toLowerCase().includes(lowerQuery)
      );
    }
  });
};

/*
const ListAutocomplete = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: filteredLists, isLoading } = useSearchableLists(searchTerm);

  return (
    <div className="list-autocomplete">
      <input 
        type="text" 
        placeholder="Filter your lists..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} 
      />

      {isLoading ? <Spinner /> : (
        <ul className="results-dropdown">
          {filteredLists?.map(list => (
            <li key={list.id}>
              <Link href={`/lists/${list.id}`}>{list.title}</Link>
            </li>
          ))}
          {filteredLists?.length === 0 && <li>No lists found</li>}
        </ul>
      )}
    </div>
  );
};

*/

//==================================================================================
//"List Pinning"
// src/features/lists/api/useLists.js
import { usePinnedListsStore } from '../store/usePinnedListsStore';

export const useUserLists = () => {
  const pinnedIds = usePinnedListsStore((s) => s.pinnedIds);

  return useQuery({
    queryKey: ['lists'],
    queryFn: () => api.get('/api/v1/lists').then(res => res.data),
    select: (lists) => {
      // Logic: Move pinned lists to the top of the array
      const pinned = lists.filter(list => pinnedIds.includes(list.id));
      const unpinned = lists.filter(list => !pinnedIds.includes(list.id));
      
      return {
        all: [...pinned, ...unpinned],
        pinnedCount: pinned.length
      };
    },
    staleTime: 1000 * 60 * 15,
  });
};
/*
const ListSidebar = () => {
  const { data, isLoading } = useUserLists();
  const { togglePin, pinnedIds } = usePinnedListsStore();

  if (isLoading) return <Skeleton />;

  return (
    <nav className="list-nav">
      {data.all.map(list => (
        <div key={list.id} className="list-item">
          <Link href={`/lists/${list.id}`}>{list.title}</Link>
          <button onClick={() => togglePin(list.id)} className="pin-toggle">
            {pinnedIds.includes(list.id) ? '📌' : '📍'}
          </button>
        </div>
      ))}
    </nav>
  );
};

*/






