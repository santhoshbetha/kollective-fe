import { useEffect, useState, useRef } from 'react';
import { onlineManager, useMutationState } from '@tanstack/react-query';
import { toast } from '@/components/Toast'; // Or your preferred toast library

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(onlineManager.isOnline());
  const wasOffline = useRef(false);

  // Monitor the count of pending mutations
  const pendingCount = useMutationState({
    filters: { status: 'pending' },
    select: (mutation) => mutation.state.status,
  }).length;

  useEffect(() => {
    return onlineManager.subscribe((online) => {
      // 1. Detect transition from Offline -> Online
      if (online && wasOffline.current) {
        toast.info("Back online! Syncing your actions...");
      }
      
      if (!online) wasOffline.current = true;
      setIsOnline(online);
    });
  }, []);

  // 2. Watch for when the queue hits zero after being online
  useEffect(() => {
    if (isOnline && wasOffline.current && pendingCount === 0) {
      toast.success("All actions synced successfully!");
      wasOffline.current = false; // Reset the flag
    }
  }, [isOnline, pendingCount]);

  return isOnline;
};
