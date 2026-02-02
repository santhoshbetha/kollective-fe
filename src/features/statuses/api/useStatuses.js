import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useStatusImporter } from '../hooks/useStatusImporter';

export const useStatuses = (timelineType = 'home') => {
    const queryClient = useQueryClient();
    const { importFetchedStatuses } = useStatusImporter();

    // REPLACES: fetchStatuses thunk
    const statusesQuery = useInfiniteQuery({
        queryKey: ['statuses', timelineType],
        queryFn: async ({ pageParam }) => {
        const response = await api.get(`/api/v1/timelines/${timelineType}`, {
            params: { max_id: pageParam, limit: 20 }
        });
        
        // SIDE-LOADING: Seed the cache for accounts/polls immediately
        importFetchedStatuses(response.data); 
        
        return response.data;
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage[lastPage.length - 1]?.id ?? undefined,
    });

    // REPLACES: postStatus thunk
    const postMutation = useMutation({
        mutationFn: (newStatus) => api.post('/api/v1/statuses', newStatus),
        onSuccess: () => {
        // Refresh the timeline immediately after posting
        queryClient.invalidateQueries({ queryKey: ['statuses', timelineType] });
        },
    });
    
    // 1. Fetch Single Status (fetchStatus)
    const useStatus = (id) => useQuery({
        queryKey: ['statuses', 'detail', id],
        queryFn: () => api.get(`/api/v1/statuses/${id}`).then(res => res.data),
    });

    // 2. Infinite Feed (fetchNext)
    const useTimeline = (type = 'home') => useInfiniteQuery({
        queryKey: ['statuses', 'timeline', type],
        queryFn: ({ pageParam }) => api.get(`/api/v1/timelines/${type}`, { params: { max_id: pageParam } }).then(res => res.data),
        getNextPageParam: (lastPage) => lastPage[lastPage.length - 1]?.id,
    });

    // 3. Thread Context (fetchAncestors / fetchDescendants)
    const useStatusContext = (id) => useQuery({
        queryKey: ['statuses', 'context', id],
        queryFn: () => api.get(`/api/v1/statuses/${id}/context`).then(res => res.data),
    });



  return { statusesQuery, postMutation, useStatus, useTimeline, useStatusContext };
};

/*
// src/components/Timeline.js
const Timeline = () => {
  const { statusesQuery } = useStatuses('home');
  const { data, fetchNextPage, hasNextPage, isLoading } = statusesQuery;

  if (isLoading) return <Spinner />;

  return (
    <div className="timeline">
      {data.pages.map((page) => 
        page.map((status) => <StatusCard key={status.id} status={status} />)
      )}
      {hasNextPage && <button onClick={() => fetchNextPage()}>Load More</button>}
    </div>
  );
};


Move to TanStack: items, isLoading, error, pagination.
Move to Zustand/Redux: isComposeModalOpen, draftContent
*/
