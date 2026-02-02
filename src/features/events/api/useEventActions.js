import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { toast } from '@/components/Toast';
import { updatePostInPages } from '@/features/statuses/utils/cacheHelpers';

export const useEventActions = () => {
  const queryClient = useQueryClient();

  const joinEvent = useMutation({
    mutationFn: (eventId) => api.post(`/api/v1/pleroma/events/${eventId}/join`),
    onSuccess: (updatedEvent) => {
      // Optimistically update the event in the list cache
      queryClient.setQueriesData({ queryKey: ['events'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(page => 
            page.map(event => event.id === updatedEvent.id ? updatedEvent : event)
          )
        };
      });
    }
  });

  return { joinEvent };
};
/*
useSelector(state => state.events.items) with const { data } = useEvents().
*/

//===============================================================================

export const useJoinEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // 1. The API Call
    mutationFn: ({ id, participationMessage }) =>
      api.post(`/api/v1/pleroma/events/${id}/join`, {
        participation_message: participationMessage,
      }).then(res => res.data),

    // 2. Optimistic Update (Replaces joinEventRequest)
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['statuses'] });
      const previousData = queryClient.getQueryData(['statuses']);

      // Update the event's join_state instantly in the cache
      queryClient.setQueriesData({ queryKey: ['statuses'] }, (old) =>
        updatePostInPages(old, id, {
          event: { ...old.event, join_state: 'joining' } // Temporary UI state
        })
      );

      return { previousData };
    },

    // 3. Success Logic (Replaces joinEventSuccess)
    onSuccess: (data) => {
      const event = data.pleroma?.event;
      
      // Sync the specific status/event in all caches
      queryClient.setQueriesData({ queryKey: ['statuses'] }, (old) =>
        updatePostInPages(old, data.id, data)
      );

      // Handle Pleroma-specific join states for the toast
      const isPending = event?.join_state === 'pending';
      toast.success(isPending ? "Join request sent!" : "Joined event!", {
        action: {
          label: "View Event",
          onClick: () => window.location.href = `/@${data.account.acct}/events/${data.id}`
        }
      });
    },

    // 4. Rollback (Replaces joinEventFail)
    onError: (err, variables, context) => {
      queryClient.setQueryData(['statuses'], context.previousData);
    }
  });
};

/*
const JoinButton = ({ status }) => {
  const { mutate: join, isPending } = useJoinEvent();

  // Logic: Don't allow joining if already joined or no event exists
  const canJoin = status.event && !status.event.join_state;

  if (!canJoin) return null;

  return (
    <button 
      onClick={() => join({ id: status.id })} 
      disabled={isPending}
    >
      {isPending ? 'Joining...' : 'Join Event'}
    </button>
  );
};

*/
/*
    Decoupled Side Effects: The toast and importFetchedStatus logic are now self-contained side effects of the mutation, not scattered across Redux actions.
    Zero Loading Boilerplate: You no longer need to track joiningEventIds in your eventsSlice.js. The mutation hook handles isPending per-call.
    Cache Integrity: Using updatePostInPages ensures that if the event status appears in multiple timelines (Home, Local, Profile), the "Joined" status updates everywhere simultaneously.

Next Step: Are you re
*/

//===============================================================================
// src/features/events/api/useEventActions.js
export const useLeaveEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // 1. API Call (Pleroma unjoin endpoint)
    mutationFn: (id) =>
      api.post(`/api/v1/pleroma/events/${id}/unjoin`).then(res => res.data),

    // 2. Optimistic Update
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['statuses'] });
      const previousData = queryClient.getQueryData(['statuses']);

      // Optimistically clear the join_state
      queryClient.setQueriesData({ queryKey: ['statuses'] }, (old) =>
        updatePostInPages(old, id, {
          event: { ...old.event, join_state: null }
        })
      );

      return { previousData };
    },

    // 3. Success Logic
    onSuccess: (data) => {
      // Sync the exact server state
      queryClient.setQueriesData({ queryKey: ['statuses'] }, (old) =>
        updatePostInPages(old, data.id, data)
      );
      
      // Update the "My Events" list if it exists in cache
      queryClient.invalidateQueries({ queryKey: ['events', 'mine'] });
      
      toast.success("You have left the event.");
    },

    // 4. Rollback
    onError: (err, id, context) => {
      queryClient.setQueryData(['statuses'], context.previousData);
      toast.error("Failed to leave event. Please try again.");
    }
  });
};
/*
const EventActionButton = ({ status }) => {
  const { mutate: join } = useJoinEvent();
  const { mutate: leave, isPending: isLeaving } = useLeaveEvent();

  const joinState = status.event?.join_state;

  // If already a member or pending, show 'Leave'
  if (joinState === 'accepted' || joinState === 'pending') {
    return (
      <button 
        className="btn-danger" 
        onClick={() => leave(status.id)} 
        disabled={isLeaving}
      >
        {isLeaving ? 'Leaving...' : (joinState === 'pending' ? 'Cancel Request' : 'Leave Event')}
      </button>
    );
  }

  // Otherwise show 'Join' (Logic from previous step)
  return <JoinButton status={status} />;
};
Unified State: Whether a user is "Joining," "Pending," or "Leaving," the state is derived from the server's join_state inside the status object in the cache. No separate joinedEvents array in Redux.
Automatic Cleanup: When a user leaves an event, invalidating ['events', 'mine'] ensures their personal event calendar is updated without you writing a single .filter() in a reducer.
Error Resiliency: If the Pleroma server is slow or down, the heart of the UI (the "Leave" button) won't stay stuck in a loading state; the onError rollback handles the recovery.

*/
//===============================================================================
//"Participation Message"
// /Refactor your useJoinEvent to accept the message from the store.
// src/features/events/api/useEventActions.js
export const useJoinEvent = () => {
  const queryClient = useQueryClient();
  const closeModal = useParticipationStore((s) => s.closeModal);

  return useMutation({
    mutationFn: ({ id, message }) =>
      api.post(`/api/v1/pleroma/events/${id}/join`, {
        participation_message: message,
      }).then(res => res.data),
    
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['statuses'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      closeModal(); // Close the modal on success
      toast.success("Request sent successfully!");
    },
  });
};
/*
const ParticipationModal = () => {
  const { isOpen, message, setMessage, targetEventId, closeModal } = useParticipationStore();
  const { mutate: join, isPending } = useJoinEvent();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Join Request</h3>
        <textarea 
          placeholder="Why do you want to join this event?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="actions">
          <button onClick={closeModal}>Cancel</button>
          <button 
            disabled={isPending || !message.trim()} 
            onClick={() => join({ id: targetEventId, message })}
          >
            {isPending ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
};

*/
/*
//Integration Logic
const JoinButton = ({ status }) => {
  const openModal = useParticipationStore((s) => s.openModal);
  const { mutate: joinDirectly } = useJoinEvent();

  const handleJoin = () => {
    if (status.event.join_mode === 'restricted') {
      openModal(status.id);
    } else {
      joinDirectly({ id: status.id });
    }
  };

  return <button onClick={handleJoin}>Join Event</button>;
};

*/
//===============================================================================
// Optimistic Joining"
// src/features/events/api/useEventActions.js
import { updatePostInPages } from '@/features/statuses/utils/cacheHelpers';

export const useJoinEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }) => api.post(`/api/v1/pleroma/events/${id}/join`),

    // REPLACES: joinEventRequest
    onMutate: async ({ id }) => {
      // 1. Cancel outgoing refetches so they don't overwrite our optimistic state
      await queryClient.cancelQueries({ queryKey: ['statuses'] });
      await queryClient.cancelQueries({ queryKey: ['events'] });

      // 2. Snapshot previous state for rollback
      const previousData = queryClient.getQueriesData({ queryKey: ['statuses'] });

      // 3. Update the join_state across all timelines (Home, Recent, Joined)
      queryClient.setQueriesData({ queryKey: ['statuses'] }, (old) => 
        updatePostInPages(old, id, {
          pleroma: { 
            ...old?.pleroma, 
            event: { ...old?.pleroma?.event, join_state: 'accepted' } 
          }
        })
      );

      return { previousData };
    },

    // REPLACES: joinEventFail
    onError: (err, variables, context) => {
      queryClient.setQueriesData({ queryKey: ['statuses'] }, context.previousData);
      toast.error("Failed to join event.");
    },

    // REPLACES: joinEventSuccess
    onSuccess: (data) => {
      // Sync exact server state and update the "Joined Events" list
      queryClient.invalidateQueries({ queryKey: ['statuses', 'timeline', 'joined-events'] });
      toast.success("Event joined!");
    }
  });
};
/*
const JoinButton = ({ status }) => {
  const { mutate: join, isPending } = useJoinEvent();
  const joinState = status.pleroma?.event?.join_state;

  return (
    <button 
      onClick={() => join({ id: status.id })}
      disabled={isPending || !!joinState}
      className={joinState ? 'joined' : 'join'}
    >
      {joinState === 'accepted' ? '✓ Joined' : (isPending ? 'Joining...' : 'Join Event')}
    </button>
  );
};

*/
//===============================================================================




