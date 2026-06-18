/*
#To implement the Organization Dashboard in React, you need to create a dedicated administrative
# view where approved admins can manage their members. This requires a new API controller 
#in Phoenix to serve pending requests and a React component to display and act on them.

2. The React Admin Dashboard
This component fetches pending requests and provides "Approve" or "Reject" actions. Using
React Hooks like useEffect allows you to fetch data when the dashboard mounts. 
*/
import React, { useState, useEffect } from 'react';

const OrgAdminDashboard = ({ orgId, token }) => {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    fetchPending();
  }, [orgId]);

  const fetchPending = async () => {
    const res = await fetch(`/api/org-admin/${orgId}/pending`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const json = await res.json();
    setPending(json.data);
  };

  const handleAction = async (membershipId, status) => {
    await fetch(`/api/org-admin/memberships/${membershipId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setPending(prev => prev.filter(m => m.id !== membershipId));
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">Pending Join Requests</h2>
      {pending.length === 0 ? (
        <p className="text-gray-500 italic">No pending requests at this time.</p>
      ) : (
        <ul className="divide-y">
          {pending.map(member => (
            <li key={member.id} className="py-4 flex justify-between items-center">
              <div>
                <p className="font-bold">@{member.user.nickname}</p>
                <p className="text-sm text-gray-500">Requested: {new Date(member.inserted_at).toLocaleDateString()}</p>
              </div>
              <div className="space-x-2">
                <button onClick={() => handleAction(member.id, 'approved')} className="bg-green-500 text-white px-3 py-1 rounded">Approve</button>
                <button onClick={() => handleAction(member.id, 'rejected')} className="bg-red-500 text-white px-3 py-1 rounded">Reject</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
