/*
In the original Soapbox, search is often split into Results.js, AccountResults.js, and 
StatusResults.js. We can delete all of those by reusing the Timeline.jsx and EntityCard.jsx 
components we've already built.
*/

/*
2. The Reduced Search Index (JSX)
This file becomes a clean "switcher" that uses your existing library of components.
*/

import React, { useState } from 'react';
import { useSearch } from './hooks/useSearch';
import { EntityCard } from '@/components/EntityCard';
import { Status } from '@/features/status'; // Reusing your reduced Status component

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const { results, loading, executeSearch } = useSearch();

  return (
    <div className="search-feature">
      <input 
        type="text" 
        placeholder="Search for people or posts..." 
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          executeSearch(e.target.value);
        }}
        className="w-full p-4 border-b"
      />

      {loading && <div>Searching...</div>}

      <div className="results-container">
        {/* 1. People Results - Reuse EntityCard */}
        {results.accounts.map(acc => (
          
        ))}

        {/* 2. Post Results - Reuse Status */}
        {results.statuses.map(status => (
          <Status key={status.id} initialStatus={status} />
        ))}
      </div>
    </div>
  );
};

export default SearchPage;

/*
Files You Can Now Delete:

    AccountResults.js: Replaced by EntityCard.
    StatusResults.js: Replaced by your reduced Status component.
    HashtagResults.js: Can be handled by a simple list or EntityCard with a hashtag icon.
    SearchContainer.js: Logic merged into index.jsx and the hook.
*/
