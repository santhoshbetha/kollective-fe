//soapbox search reduction:

/*
 we’ll apply the
Generic Reduction pattern to the Search feature in src/features/search
*/

/*
In the original Soapbox, search is often split into Results.js, AccountResults.js, and 
StatusResults.js. We can delete all of those by reusing the Timeline.jsx and EntityCard.jsx 
components we've already built.
*/

/*
1. The Logic Hook: useSearch.js
Instead of local state in the component, use a hook to manage the three types of results 
Mastodon returns: Accounts, Statuses, and Hashtags.
*/
import { useState, useCallback } from 'react';
import api from '@/api';

export const useSearch = () => {
  const [results, setResults] = useState({ accounts: [], statuses: [], hashtags: [] });
  const [loading, setLoading] = useState(false);

  const executeSearch = useCallback(async (query) => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await api.get('/api/v2/search', { params: { q: query } });
      setResults(res.data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, executeSearch };
};
