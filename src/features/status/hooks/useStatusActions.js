import { useState } from 'react';
import api from '@/api';

//Soapbox Status reduction

export const useStatusActions = (initialStatus) => {
  const [status, setStatus] = useState(initialStatus);

   const performAction = async (actionType, payload = {}) => {
    // Maps UI actions to Mastodon API endpoints
    const endpoints = {
      favourite: `/api/v1/statuses/${status.id}/favourite`,
      reblog: `/api/v1/statuses/${status.id}/reblog`,
      bookmark: `/api/v1/statuses/${status.id}/bookmark`,
      vote: `/api/v1/polls/${status.poll?.id}/votes`,
    };

    try {
    const res = await api.post(endpoints[actionType], payload);
      // For polls, the API often returns the updated Poll object directly
      // Update local state with the new counts/active states
      setStatus(prev => ({
        ...prev,
        poll: actionType === 'vote' ? res.data : prev.poll
      }));
    } catch (err) {
      console.error(`Failed to ${actionType} status:`, err);
    }
  };

  return { status, performAction };
};

//==================================================================================
/*
 "Delete/Cancel" button to the Status component specifically for these scheduled items
*/
/*
To add the
"Cancel" functionality, you extend the useStatusActions hook with a dedicated deletion method 
for scheduled IDs. This allows you to remove the CancelButton.js file from the scheduled-statuses feature folder.

1. Update the Hook: useStatusActions.js
Add a cancelScheduled method that hits the Mastodon API endpoint for scheduled statuses.
*/
// src/features/status/hooks/useStatusActions.js
export const useStatusActions = (initialStatus) => {
  const [status, setStatus] = useState(initialStatus);

  const cancelScheduled = async (scheduledId, onDelete) => {
    try {
      await api.delete(`/api/v1/scheduled_statuses/${scheduledId}`);
      if (onDelete) onDelete(scheduledId); // Callback to remove it from the UI list
    } catch (err) {
      console.error('Failed to cancel scheduled status:', err);
    }
  };

  // ... other actions like favourite, reblog ...

  return { status, cancelScheduled };
};
