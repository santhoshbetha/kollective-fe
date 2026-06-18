import React, { useState, useEffect } from 'react';

/*
#Settings section
To complete the
Settings section of your React app, you need an API endpoint that lists all blocked/muted 
accounts and a React view to manage them (unblocking or unmuting).

2. The React Settings Page (Settings.js)
This component allows users to toggle between their "Blocked" and "Muted" lists and remove users from them to bring them back into their Discovery Feed.
*/

const FilterSettings = ({ token }) => {
  const [filterType, setFilterType] = useState('block'); // 'block' or 'mute'
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, [filterType]);

  const fetchUsers = async () => {
    const res = await fetch(`/api/relationships?type=${filterType}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const json = await res.json();
    setUsers(json.data);
  };

  const handleRemove = async (userId) => {
    const res = await fetch(`/api/relationships/${userId}?type=${filterType}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Discovery Filters</h2>
      
      <div className="flex space-x-4 mb-6 border-b">
        <button 
          onClick={() => setFilterType('block')}
          className={`pb-2 ${filterType === 'block' ? 'border-b-2 border-red-500 font-bold' : ''}`}
        >Blocked Users</button>
        <button 
          onClick={() => setFilterType('mute')}
          className={`pb-2 ${filterType === 'mute' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
        >Muted Users</button>
      </div>

      <div className="space-y-4">
        {users.length === 0 && <p className="text-gray-500 italic">No {filterType}ed users found.</p>}
        {users.map(user => (
          <div key={user.id} className="flex justify-between items-center p-3 border rounded">
            <div>
              <p className="font-bold">@{user.nickname}</p>
              <p className="text-sm text-gray-500">{user.first_name} {user.last_name}</p>
            </div>
            <button 
              onClick={() => handleRemove(user.id)}
              className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
            >
              {filterType === 'block' ? 'Unblock' : 'Unmute'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterSettings;

/*
3. Impact on Local Discovery

    User Autonomy: In a community-focused app where users are "automatically" connected by Federal District, giving users the power to "Silence" certain accounts is essential for mental health and preventing platform spam.
    Discovery Weight: If many users in a specific City block a single account, you can use that data in Elixir to lower that account's "Search Rank" or "Discoverability" flag automatically.
*/

/*
Summary of the Built Engine
Your app now features:

    Post Architecture: Supports standard, voice, and expiring posts with Quora-style voting.
    User Architecture: Cleaned of federation bloat, optimized with Trigram Fuzzy Search.
    Local Discovery: Tiered connections (City, State Dist, Federal Dist) using OR logic.
    Social Loop: Follows, Blocks, Mutes, and a detailed Notification system with read receipts.
    React Integration: JSON API patterns for infinite scroll, countdown timers, and district badges.
*/
