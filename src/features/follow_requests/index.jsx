import React from 'react';
import { useTimeline } from '@/hooks/useTimeline';
import { EntityCard } from '@/components/EntityCard';
import { API_ENDPOINTS } from '@/constants/endpoints';
import api from '@/api';

/*
To wrap up the reduction of the identity-based features, we’ll apply the same pattern to
Follow Requests. This feature is slightly more complex because it requires 
two actions (Accept and Reject), but our generic EntityCard can handle both easily.

1. The Reduced Entry Point
By reusing the setItems logic, you can remove users from the list as soon as you approve
or deny them, creating a very responsive Soapbox 3.0 experience.
*/

const FollowRequestsPage = () => {
  const { items, setItems, isLoading } = useTimeline(API_ENDPOINTS.FOLLOW_REQUESTS);

  const handleAction = async (id, action) => {
    try {
      // action is either 'authorize' or 'reject' per Mastodon API
      await api.post(`/api/v1/follow_requests/${id}/${action}`);
      // Remove the user from the list immediately
      setItems(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      console.error(`Failed to ${action} request:`, err);
    }
  };

  if (isLoading && items.length === 0) return <div>Loading requests...</div>;

  return (
    <div className="follow-requests-view p-4">
      <h1 className="text-xl font-bold mb-4">Follow Requests</h1>
      
      {items.length === 0 && <p className="text-gray-500">No pending requests.</p>}

      <div className="flex flex-col gap-3">
        {items.map(user => (
          <div>
            <EntityCard
                entity={user}  
                action={
                <button onClick={() => handleAction(user.id, 'authorize')} 
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold">
                    Accept
                </button>
                }
            />
            <EntityCard
                entity={user}  
                action={
                <button onClick={() => handleAction(user.id, 'reject')} 
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-bold">
                    Reject
                </button>
                }
            />
        </div>
        ))}
      </div>
    </div>
  );
};

export default FollowRequestsPage;

/*
2. Why this is the "Reduced" Winner

    Action Mapping: Instead of separate AuthorizeButton.js and RejectButton.js files, you use a single handleAction function that takes the API command as a string.
    Consistent Identity: Reusing EntityCard ensures that follow requests look exactly like your follower list or search results.
    Deleted Files: You can now delete the entire src/features/follow_requests/components folder.
*/