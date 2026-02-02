// src/features/events/api/useEventRequestActions.js
export const useEventRequestAction = (eventId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, action }) => // action = 'approve' or 'reject'
      api.post(`/api/v1/pleroma/events/${eventId}/participation_requests/${requestId}/${action}`),
    
    onMutate: async ({ requestId }) => {
      await queryClient.cancelQueries({ queryKey: ['events', eventId, 'participation-requests'] });
      
      // Optimistically remove the request from the infinite list
      queryClient.setQueryData(['events', eventId, 'participation-requests'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            requests: page.requests.filter(r => r.id !== requestId)
          }))
        };
      });
    },
    onSettled: () => {
      // Refresh the participant count/list
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'participants'] });
    }
  });
};

/*
Data Integrity: In Redux, you had to manually map data.map(({ account }) => account). Here, that transformation happens once in the queryFn, and the results are cached TanStack Query Data Transformation.
Atomic Updates: When an admin approves a request, the onMutate logic ensures that specific item vanishes instantly without a full page refetch.
No Slice Bloat: You can delete the FETCH_EVENT_PARTICIPATION_REQUESTS constants and the corresponding state in your eventsSlice.
*/

//=================================================
//authorizeEventParticipationRequest 
// This thunk is not required. You can replace it with a Mutation that provides built-in loading states and handles the cache update automatically.
//In TanStack Query, you use Optimistic Updates to remove the request from the list instantly, making the admin interface feel extremely snappy.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { toast } from '@/components/Toast';

export const useAuthorizeEventRequest = (eventId) => {
  const queryClient = useQueryClient();

  return useMutation({
    // REPLACES: The .post() call in your thunk
    mutationFn: (accountId) =>
      api.post(`/api/v1/pleroma/events/${eventId}/participation_requests/${accountId}/authorize`),

    // REPLACES: authorizeEventParticipationRequestRequest
    onMutate: async (accountId) => {
      // 1. Cancel outgoing fetches for this specific event's request list
      await queryClient.cancelQueries({ queryKey: ['events', eventId, 'participation-requests'] });

      // 2. Snapshot the current list (for rollback)
      const previousData = queryClient.getQueryData(['events', eventId, 'participation-requests']);

      // 3. Optimistically remove the request from the cache
      queryClient.setQueryData(['events', eventId, 'participation-requests'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            requests: page.requests.filter(r => r.account.id !== accountId)
          }))
        };
      });

      return { previousData };
    },

    // REPLACES: authorizeEventParticipationRequestFail
    onError: (err, accountId, context) => {
      queryClient.setQueryData(['events', eventId, 'participation-requests'], context.previousData);
      toast.error("Failed to authorize request.");
    },

    // REPLACES: authorizeEventParticipationRequestSuccess
    onSuccess: () => {
      toast.success("User authorized successfully!");
      // 4. Invalidate the participants list so it shows the new member
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'participants'] });
    },
  });
};

/*
const RequestItem = ({ eventId, request }) => {
  const { mutate: authorize, isPending } = useAuthorizeEventRequest(eventId);

  return (
    <div className="request-row">
      <span>{request.account.display_name}</span>
      <p>{request.participation_message}</p>
      <button 
        onClick={() => authorize(request.account.id)}
        disabled={isPending}
      >
        {isPending ? 'Authorizing...' : 'Approve'}
      </button>
    </div>
  );
};

*/
//==================================================================================
// src/features/events/api/useEventRequestActions.js

export const useRejectEventRequest = (eventId) => {
  const queryClient = useQueryClient();

  return useMutation({
    // REPLACES: The .post() call in your thunk
    mutationFn: (accountId) =>
      api.post(`/api/v1/pleroma/events/${eventId}/participation_requests/${accountId}/reject`),

    // REPLACES: rejectEventParticipationRequestRequest
    onMutate: async (accountId) => {
      await queryClient.cancelQueries({ queryKey: ['events', eventId, 'participation-requests'] });
      const previousData = queryClient.getQueryData(['events', eventId, 'participation-requests']);

      // Optimistically remove the request from the list
      queryClient.setQueryData(['events', eventId, 'participation-requests'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            requests: page.requests.filter(r => r.account.id !== accountId)
          }))
        };
      });

      return { previousData };
    },

    // REPLACES: rejectEventParticipationRequestFail
    onError: (err, accountId, context) => {
      queryClient.setQueryData(['events', eventId, 'participation-requests'], context.previousData);
      toast.error("Failed to reject request.");
    },

    // REPLACES: rejectEventParticipationRequestSuccess
    onSuccess: () => {
      toast.success("Request rejected.");
    },
  });
};

/*
const ParticipationRequestItem = ({ eventId, request }) => {
  const { mutate: authorize, isPending: isAuthorizing } = useAuthorizeEventRequest(eventId);
  const { mutate: reject, isPending: isRejecting } = useRejectEventRequest(eventId);

  const isWorking = isAuthorizing || isRejecting;

  return (
    <div className="request-card">
      <div className="user-info">
        <img src={request.account.avatar} alt="" />
        <span>{request.account.username}</span>
      </div>
      
      <p className="message">{request.participation_message}</p>

      <div className="actions">
        <button 
          onClick={() => authorize(request.account.id)} 
          disabled={isWorking}
        >
          {isAuthorizing ? '...' : 'Approve'}
        </button>
        <button 
          className="btn-danger"
          onClick={() => reject(request.account.id)} 
          disabled={isWorking}
        >
          {isRejecting ? '...' : 'Reject'}
        </button>
      </div>
    </div>
  );
};

*/
