//status details:
// src/features/statuses/api/useStatus.js
import { useQuery } from '@tanstack/react-query';
import { useFilters } from '@/features/filters/api/useFilters';
import { checkFiltered } from '../utils/filterUtils';

//replaces makeGetStatus
//This replaces the makeGetStatus selector. It handles the
// reblog nesting and the filter-checking (Social/Content filtering) at the data layer.

export const useStatus = (statusId, expectedUsername) => {
  const { data: filters } = useFilters(); // Get current user filters
  const me = useAuthStore(s => s.me?.id);

  return useQuery({
    queryKey: ['statuses', 'detail', statusId],
    queryFn: () => api.get(`/api/v1/statuses/${statusId}`).then(res => res.data),
    
    // REPLACES: The 'combiner' logic from your selector
    select: (status) => {
      if (!status || !status.account) return null;

      // 1. Ownership/Username Validation (Logic from your selector)
      if (expectedUsername && status.account.acct !== expectedUsername) {
        return null;
      }

      // 2. Handle Reblog Nesting
      // If it's a reblog, the 'reblog' property is already part of the object
      const targetStatus = status.reblog || status;

      // 3. Content Filtering (Logic from checkFiltered)
      let filtered = false;
      if (status.account.id !== me) {
        filtered = checkFiltered(targetStatus.search_index || '', filters);
      }

      return {
        ...status,
        filtered,
        // Ensure reblog is flattened or nested as needed by your UI
        reblog: status.reblog || null, 
      };
    },
    enabled: !!statusId,
  });
};
/*
Scoped Memoization: The select function only re-runs if the status data or the filters change. It doesn't trigger when unrelated parts of the Redux state (like your chat messages or notifications) update TanStack Query Selectors.
Zero Infrastructure: You don't need to "make" a selector factory (makeGetStatus). Every component that calls useStatus(id) gets its own subscription to that specific status data.
Built-in Null Safety: If the status is deleted or not found, TanStack Query handles the isLoading and isError states natively, so you don't have to return null and check for it manually in every component.
*/
/*
const StatusDetail = ({ id, username }) => {
  const { data: status, isLoading } = useStatus(id, username);

  if (isLoading) return <LoadingSpinner />;
  if (!status || status.filtered) return <FilteredPlaceholder />;

  return (
    <div className="status-detail">
       <StatusContent content={status.content} />
       <ActionBar status={status} />
    </div>
  );
};
*/

//================================================================================
//Background Refresh
export const useStatus = (statusId) => {
  return useQuery({
    queryKey: ['statuses', 'detail', statusId],
    queryFn: () => api.get(`/api/v1/statuses/${statusId}`).then(res => res.data),
    
    // 1. BACKGROUND POLL: Refresh every 60s while looking at the post
    refetchInterval: 60000,
    
    // 2. SMART SYNC: Only poll if the tab is focused
    refetchIntervalInBackground: false,
    
    // 3. CACHE SYNC: Ensure timelines update when the detail is refetched
    onSuccess: (data) => {
      syncStatusInCache(queryClient, statusId, data);
    }
  });
};
/*
const StatusCard = ({ status }) => {
  // If the background refresh changes the content, this component re-renders instantly
  return (
    <div className="status-card">
      <p>{status.content}</p>
      {status.edited_at && (
        <span className="text-xs italic" title={`Last edit: ${status.edited_at}`}>
          (edited)
        </span>
      )}
    </div>
  );
};
*/


