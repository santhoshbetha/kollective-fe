// src/features/moderation/hooks/useMutationActions.js
import { useQueryClient } from '@tanstack/react-query';

export const useMutationActions = () => {
  const queryClient = useQueryClient();

  const cancelQueuedAction = (mutationId) => {
    const mutationCache = queryClient.getMutationCache();
    // Find the specific mutation by its internal ID and remove it
    const mutation = mutationCache.find({ mutationId });
    if (mutation) {
      mutationCache.remove(mutation);
    }
  };

  return { cancelQueuedAction };
};

/*
//Update the Queue UI
//Now, add the button to your OutgoingQueue component. Since we used useMutationState earlier, 
// we already have access to the mutationId.

const OutgoingQueue = () => {
  const queue = useOutgoingQueue(); // Hook from previous step
  const { cancelQueuedAction } = useMutationActions();

  if (queue.length === 0) return null;

  return (
    <div className="sync-queue">
      {queue.map((item) => (
        <div key={item.mutationId} className="queue-item">
          <span>{item.type}</span>
          {/* 1. Only show Cancel if the mutation is currently paused/offline *//*}
          {item.isPaused && (
            <button 
              onClick={() => cancelQueuedAction(item.mutationId)}
              className="btn-cancel"
            >
              Cancel
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

*/

/*
If you cancel a Like mutation, your UI might still show the "Red Heart" 
because of your Optimistic Update. You must manually rollback the cache when canceling:

const handleCancel = (item) => {
  cancelQueuedAction(item.mutationId);
  
  // 2. Manually rollback the UI for that specific action
  if (item.type === 'LIKE_STATUS') {
    queryClient.invalidateQueries({ queryKey: ['statuses'] });
  }
};

User Control: Prevents "Oops" moments where a user posts something while offline and regrets it before syncing.
Cache Integrity: Using mutationCache.remove() is the cleanest way to stop the TanStack Query observer from waiting for a network resolution.
No Redux Middleware: In Redux, canceling a pending thunk required complex AbortController logic; here, it's a simple cache removal.
*/

//=======================================================================================
// To implement a "Clear All" button for the outgoing queue, you simply wipe the entire Mutation Cache. 
// This is extremely useful for users who want to "reset" their app state after a long period of 
// being offline without sending a flood of old posts or likes.
export const useMutationActions = () => {
  const queryClient = useQueryClient();

  const clearEntireQueue = () => {
    const mutationCache = queryClient.getMutationCache();
    
    // 1. Remove all mutations from the cache
    mutationCache.clear();
    
    // 2. IMPORTANT: Invalidate your feeds
    // Since we cleared mutations, we must refetch the server state 
    // to ensure the UI doesn't show optimistic "Likes" that were never sent.
    queryClient.invalidateQueries({ queryKey: ['statuses'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  return { clearEntireQueue };
};
/*
const OutgoingQueue = () => {
  const queue = useOutgoingQueue();
  const { clearEntireQueue } = useMutationActions();

  if (queue.length === 0) return null;

  return (
    <div className="sync-queue-container">
      <div className="queue-header">
        <h4>{queue.length} Pending Actions</h4>
        <button onClick={clearEntireQueue} className="btn-clear-all">
          Clear All
        </button>
      </div>
      
      {/* ... mapping over queue items ... *//*}
    </div>
  );
};

1. Preventing "Stale" Actions: If a user was offline for 2 days, their "Likes" or "Replies" 
might no longer be relevant. mutationCache.clear() ensures they don't accidentally "spam" 
the server when they reconnect.
2. Forced Sync: By calling invalidateQueries, you force the app to pull the Source of Truth 
from the server, erasing any local optimistic changes that were tied to the cleared mutations.
3. Simple State Management: Unlike Redux, where you'd have to clear multiple arrays across 
different slices, TanStack Query's Mutation Cache is a single, centralized "waiting room" for all outgoing traffic.

*/

