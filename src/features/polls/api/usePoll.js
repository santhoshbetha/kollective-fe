import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export const usePoll = (pollId) => {
  return useQuery({
    queryKey: ['polls', pollId],
    queryFn: () => api.get(`/api/v1/polls/${pollId}`).then(res => res.data),
    enabled: !!pollId,
    // Poll every 30 seconds to update vote counts/expiration
    refetchInterval: 30000,
    staleTime: 1000 * 10,
  });
};

//=======================================================================
//Live Vote Updates
// src/features/polls/api/usePoll.js
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export const usePoll = (pollId, initialData) => {
  return useQuery({
    queryKey: ['polls', 'detail', pollId],
    queryFn: () => api.get(`/api/v1/polls/${pollId}`).then(res => res.data),
    initialData, // Start with data already found in the timeline cache
    
    // 1. DYNAMIC POLLING: 
    // Poll every 10s if the poll is still open, otherwise stop polling.
    refetchInterval: (query) => {
      const poll = query.state.data;
      if (!poll || poll.expired) return false;
      return 10000; 
    },
    
    // 2. FOCUS SYNC:
    // Only poll when the user is actually looking at the tab.
    refetchOnWindowFocus: true,
  });
};



