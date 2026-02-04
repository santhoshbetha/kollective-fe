import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { queryClient } from '../../../lib/queryClient';
import { syncStatusInCache } from '../utils/cacheSync';

//Background Refresh
export const useRefreshStatus = (statusId) => {
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