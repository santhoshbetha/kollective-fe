
/*
#"Join Organization" search feature in React, so journalists can find and
#request to join existing news groups or newspapers

3.In React, use a debounced search input to query the API as the journalist types.
*/

import React, { useState, useEffect } from 'react';
import { debounce } from 'lodash';

const OrgSearch = ({ token }) => {
  const [results, setResults] = useState([]);

  // Debounced search to avoid hitting the API on every keystroke
  const handleSearch = debounce(async (query) => {
    if (query.length < 2) return;
    const res = await fetch(`/api/organizations/search?q=${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const json = await res.json();
    setResults(json.data);
  }, 300);

  const handleJoin = async (orgId) => {
    const res = await fetch('/api/organizations/join_request', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ org_id: orgId })
    });
    if (res.ok) alert("Request submitted!");
  };

  return (
    <div className="w-full max-w-lg">
      <input 
        type="text" 
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search for a newspaper or news group..."
        className="w-full p-2 border rounded"
      />
      <div className="mt-4 space-y-2">
        {results.map(org => (
          <div key={org.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span>{org.name}</span>
            <button 
              onClick={() => handleJoin(org.id)}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
            >Request to Join</button>
          </div>
        ))}
      </div>
    </div>
  );
};

/*
4. Why this is effective for Discovery

    Expert Networking: Journalists and scholars can easily find established organizations (like "Texas Economics Review" or "The Houston Daily") to amplify their voices.
    Unified Presence: Once approved, their posts appear under the Organization's Identity, which carries more trust in the State and Country feeds.
    Notification Loop: When a join request is created, it should trigger a notification to the Organization Admin's Dashboard that we built in the previous step.
*/