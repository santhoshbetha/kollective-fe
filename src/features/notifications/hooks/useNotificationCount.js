import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";

// 1.Instead of refetching the whole list, you poll a lightweight "counts" endpoint. 
// This is battery-efficient and keeps the "Unread" badge updated. 
export const useNotificationCount = () => {
  return useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: () => api.get('/api/v1/notifications/unread_count').then(res => res.data),
    
    // Poll every 30 seconds
    refetchInterval: 30000, 
    
    // Continue polling even if the user switches tabs (optional)
    refetchIntervalInBackground: true, 
    
    // Don't show a loading spinner for background polls
    placeholderData: (previousData) => previousData,
  });
};
