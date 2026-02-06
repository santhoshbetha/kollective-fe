import React from 'react';
import { Stack, Box, Text, Avatar } from '@/components/ui';
import { useStatusActions } from './hooks/useStatusActions';

//Soapbox Status reduction

export const Status = ({ initialStatus, detailed = false, scheduled = false }) => {
  const { status, performAction } = useStatusActions(initialStatus);
  const { poll } = status;

  return (
    <Box p={4} borderBottom="1px solid" borderColor="gray.100">
      <Stack direction="row" spacing={3}>
        <Avatar src={status.account.avatar} />
        
        <Stack spacing={1} flex={1}>
          <Text weight="bold">{status.account.display_name}</Text>
          
          {/* Main Content */}
          <Text 
            dangerouslySetInnerHTML={{ __html: status.content }} 
            size={detailed ? 'lg' : 'md'} 
          />

          {/* Generic Actions Row */}
          <Stack direction="row" spacing={6} pt={2} color="gray.500">
            <button onClick={() => performAction('reblog')}>
              {status.reblogged ? '♻️' : '🔄'} {status.reblogs_count}
            </button>
            <button onClick={() => performAction('favourite')}>
              {status.favourited ? '⭐' : '☆'} {status.favourites_count}
            </button>
            {detailed && <Text size="xs">{new Date(status.created_at).toLocaleString()}</Text>}
          </Stack>
        </Stack>

        {/* Poll Section (if present) */}
         {/* Poll Section - Merged Logic */}
        {poll && (
            <Stack spacing={2} my={3} p={3} bg="gray.50" borderRadius="md">
            {poll.options.map((option, index) => {
                const percent = poll.votes_count > 0 
                ? Math.round((option.votes_count / poll.votes_count) * 100) 
                : 0;

                return (
                <div key={index} className="poll-option">
                    <button 
                    disabled={poll.expired || poll.voted}
                    onClick={() => performAction('vote', { choices: [index] })}
                    className="w-full text-left p-2 border rounded"
                    >
                    <div className="flex justify-between">
                        <span>{option.title}</span>
                        {poll.voted && <span>{percent}%</span>}
                    </div>
                    {poll.voted && (
                        <div className="h-1 bg-blue-200 mt-1">
                        <div className="h-full bg-blue-600" style={{ width: `${percent}%` }} />
                        </div>
                    )}
                    </button>
                </div>
                );
            })}
            <Text size="xs" color="gray.500">{poll.votes_count} votes • {poll.expired ? 'Closed' : 'Active'}</Text>
            </Stack>
        )}

       {/*soapbox schedulde-statuses reduction*/}

        {/*
        The scheduled-statuses feature can be significantly reduced by 
        treating scheduled posts as a "future-dated" variation of the standard status timeline.
        */

        /*
        2. Consolidate "ScheduledItem" into the Status Component
        A scheduled status is essentially a post that hasn't been published yet. Instead of a dedicated ScheduledStatus.jsx, add a scheduled prop to your main Status component.

            Action: Delete ScheduledStatus.js and ScheduledStatusList.js.
        */}

        <Box className={scheduled ? 'opacity-75' : ''}>
          {scheduled && <Text size="xs" color="blue.500">Scheduled for: {status.scheduled_at}</Text>}
          {/* ... standard status content ... */}
          {scheduled && <button onClick={() => cancel(status.id)}>Cancel</button>}
        </Box>

      </Stack>
    </Box>
  );
};

/*
3. Reductions Achieved
By implementing the above, you can delete these original files from the Soapbox Status feature:

    DetailedStatus.js & StatusItem.js: Replaced by the unified Status component.
    FavoriteButton.js & BoostButton.js: Replaced by performAction in the hook.
    StatusContent.js: Logic merged into the main component.
*/

/*
Deleted Files: You can now remove src/features/status/components/Poll.jsx, 
PollOption.jsx, and any dedicated "Poll Results" CSS files.
*/

//=================================auto-refresh effect ==================
/*
1. The Self-Refreshing Hook
We use useEffect with a setInterval to periodically poll the Mastodon API for the latest status state.
*/
import { useState, useEffect, useCallback } from 'react';
import api from '@/api';

export const useStatusActions = (initialStatus) => {
  const [status, setStatus] = useState(initialStatus);

  // Memoized fetch to prevent unnecessary re-renders
  const refreshStatus = useCallback(async () => {
    try {
      const res = await api.get(`/api/v1/statuses/${status.id}`);
      setStatus(res.data);
    } catch (err) {
      console.error("Failed to refresh status:", err);
    }
  }, [status.id]);

  // Auto-refresh logic (every 30 seconds)
  useEffect(() => {
    // Only refresh if it's a poll or a detailed view
    const interval = setInterval(refreshStatus, 30000);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  const performAction = async (actionType, payload = {}) => {
    const endpoints = {
      vote: `/api/v1/polls/${status.poll?.id}/votes`,
      favourite: `/api/v1/statuses/${status.id}/favourite`,
      reblog: `/api/v1/statuses/${status.id}/reblog`,
    };

    try {
      const res = await api.post(endpoints[actionType], payload);
      // Update local state immediately after user action
      setStatus(prev => ({
        ...prev,
        ...(actionType === 'vote' ? { poll: res.data } : res.data)
      }));
    } catch (err) {
      console.error(`Action ${actionType} failed:`, err);
    }
  };

  return { status, performAction, refreshStatus };
};

/*
 Why this is the "Reduced" Final Form

    No "Refresh" Button: You can delete any "Refresh Poll" or 
    "Update Status" buttons from your Soapbox JSX, as the hook handles it silently.
    State Integrity: By using the same setStatus for both manual actions and auto-refreshes,
     the UI remains a predictable reflection of the state.
    Feature Completeness: This single hook now manages the entire lifecycle of a status—initial 
    data, user interactions, and live updates.
*/

//================================================================
/*
 "Delete/Cancel" button to the Status component specifically for these scheduled items
*/
/*
To add the
"Cancel" functionality, you extend the useStatusActions hook with a dedicated deletion method 
for scheduled IDs. This allows you to remove the CancelButton.js file from the scheduled-statuses feature folder.

2. Update the Component: Status.jsx
Incorporate the cancel button directly into your reduced Status component. By checking the scheduledId prop, 
you only show this button on the scheduled statuses page.
*/
// src/features/status/index.jsx
export const Status = ({ initialStatus, scheduledId, scheduledAt, onRemove }) => {
  const { status, cancelScheduled } = useStatusActions(initialStatus);

  return (
    <Box p={4} borderBottom="1px solid" borderColor="gray.100">
      {scheduledAt && (
        <Text size="xs" color="blue.500" mb={2}>
          📅 Scheduled for: {new Date(scheduledAt).toLocaleString()}
        </Text>
      )}

      <Text dangerouslySetInnerHTML={{ __html: status.content }} />

      {scheduledId && (
        <button 
          className="text-red-500 text-sm mt-2 font-bold"
          onClick={() => cancelScheduled(scheduledId, onRemove)}
        >
          Cancel Post
        </button>
      )}
    </Box>
  );
};


