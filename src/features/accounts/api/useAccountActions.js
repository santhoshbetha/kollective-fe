import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { deleteByAccountInPages } from '../utils/accountCacheHelpers';
import { relationshipSchema } from '../schemas/relationshipSchemas';

export const useBlockAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId) => api.post(`/api/v1/accounts/${accountId}/block`),
    
    onMutate: async (accountId) => {
      // Cancel all outgoing fetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['statuses'] });
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      // 1. Scrub Statuses (Home, Public, etc)
      queryClient.setQueriesData({ queryKey: ['statuses'] }, (old) => 
        deleteByAccountInPages(old, accountId)
      );

      // 2. Scrub Notifications
      queryClient.setQueriesData({ queryKey: ['notifications'] }, (old) => 
        deleteByAccountInPages(old, accountId)
      );
    },
    
    onSuccess: () => {
      // Invalidate to ensure the server-side block is fully synced
      queryClient.invalidateQueries({ queryKey: ['relationships'] });
    }
  });
};

/*
3. Comparison with your Redux Logic
Scenario	                Old Redux logic (filterNotifications)	                    TanStack Query Equivalent
Mute/Block	              Dispatch action -> Loop through Immutable Map	          onMutate -> deleteByAccountInPages
Scope	                         Manually call per slice	                      setQueriesData with partial keys
UI Result	              User disappears from the specific slice	              User disappears from entire app cache instantly
*/

export const useAccountActions = () => {
    const queryClient = useQueryClient();

    // Helper to update the relationship cache optimistically
    const updateRelationshipCache = async (accountId, newFields) => {
        // 1. Cancel outgoing fetches for this relationship
        await queryClient.cancelQueries({ queryKey: ['relationship', accountId] });

        // 2. Snapshot the current value (for rollback)
        const previous = queryClient.getQueryData(['relationship', accountId]);

        // 3. Optimistically update the cache
        queryClient.setQueryData(['relationship', accountId], (old) => ({
            ...old,
            ...newFields,
        }));

        return { previous };
    };

    // Follow Mutation
    const followMutation = useMutation({
        mutationFn: (id) => api.post(`/api/v1/accounts/${id}/follow`),
        onMutate: (id) => updateRelationshipCache(id, { following: true, requested: false }),
        onError: (err, id, context) => {
            queryClient.setQueryData(['relationship', id], context.previous);
        },
        onSettled: (data, err, id) => {
            // Final sync with server
            queryClient.invalidateQueries({ queryKey: ['relationship', id] });
        },
    });

    // Unfollow Mutation
    const unfollowMutation = useMutation({
        mutationFn: (id) => api.post(`/api/v1/accounts/${id}/unfollow`),
        onMutate: (id) => updateRelationshipCache(id, { following: false }),
        onError: (err, id, context) => {
            queryClient.setQueryData(['relationship', id], context.previous);
        },
        onSettled: (data, err, id) => {
            queryClient.invalidateQueries({ queryKey: ['relationship', id] });
        },
    });

    return { followMutation, unfollowMutation };
};

/*
1. No Manual "isFollowing" logic: You don't need a followRequest and followSuccess action. 
TanStack's onMutate handles the visual change, and onError handles the rollback automatically.
2. Cross-Component Sync: If you follow a user from a Hover Card, the "Follow" button on their 
Profile Page will update instantly because they both listen to ['relationship', accountId].
*/

/*
const FollowButton = ({ accountId }) => {
  const { data: rel } = useRelationship(accountId); // The hook we built earlier
  const { followMutation, unfollowMutation } = useAccountActions();

  const isFollowing = rel?.following;
  const isPending = followMutation.isPending || unfollowMutation.isPending;

  const handleClick = () => {
    if (isFollowing) {
      unfollowMutation.mutate(accountId);
    } else {
      followMutation.mutate(accountId);
    }
  };

  return (
    <button onClick={handleClick} disabled={isPending}>
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
};
*/

//=============================================================
// /"Optimistic UI"
// /Thinking
//In a social app, "Following" is a Relationship action. In TanStack Query, we use Optimistic 
//Updates to flip the button state instantly (within ~16ms) while the network request runs in the background.
//This replaces the manual logic in your relationshipsSlice where you likely had to find the account
//  ID in a map and toggle a following boolean.
/*
const FollowButton = ({ accountId }) => {
..
};

*/
/*
1. Automatic Synchronization: If you follow a user in the "Followers List," the Account 
Profile Page will update instantly because both components are "subscribed" to the 
same ['relationship', accountId] key.
2. Cleanup: You can delete the FOLLOW_REQUEST, FOLLOW_SUCCESS, and FOLLOW_FAIL 
constants from your relationshipsSlice.
*/


export const useFollowRequestActions = () => {
  const queryClient = useQueryClient();

  const handleAction = async (accountId, action) => { // action = 'authorize' or 'reject'
    return api.post(`/api/v1/follow_requests/${accountId}/${action}`);
  };

  return useMutation({
    mutationFn: ({ id, action }) => handleAction(id, action),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['accounts', 'follow-requests'] });

      // Remove the user from the requests list immediately
      queryClient.setQueryData(['accounts', 'follow-requests'], (old) => 
        deleteByAccountInPages(old, id)
      );
    },
    onSettled: () => {
      // Invalidate so the "Followers" count on your profile stays accurate
      queryClient.invalidateQueries({ queryKey: ['accounts', 'me'] });
    }
  });
};
/*
No Manual State: You don't need to track isLoading or error in a Redux slice; 
the useInfiniteQuery hook provides them.
Automatic Empty States: If response.data is empty, hasNextPage becomes false automatically.
Shared Logic: By using importAccounts, you ensure that the follow request list 
stays in sync with the rest of the app's user data.
*/
//===================================
export const useAuthorizeFollowRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // REPLACES: The .post() call in your thunk
    mutationFn: (id) => api.post(`/api/v1/follow_requests/${id}/authorize`),

    // REPLACES: authorizeFollowRequestRequest
    onMutate: async (id) => {
      // 1. Cancel outgoing fetches for the requests list
      await queryClient.cancelQueries({ queryKey: ['accounts', 'follow-requests'] });

      // 2. Snapshot the current list (for rollback if it fails)
      const previousRequests = queryClient.getQueryData(['accounts', 'follow-requests']);

      // 3. Optimistically remove the user from the requests list
      queryClient.setQueryData(['accounts', 'follow-requests'], (old) => 
        deleteByAccountInPages(old, id)
      );

      return { previousRequests };
    },

    // REPLACES: authorizeFollowRequestFail
    onError: (err, id, context) => {
      // Rollback to the previous list if the server error occurs
      queryClient.setQueryData(['accounts', 'follow-requests'], context.previousRequests);
    },

    // REPLACES: authorizeFollowRequestSuccess
    onSuccess: (_, id) => {
      // 4. Update the relationship cache for this specific user
      queryClient.setQueryData(['relationship', id], (old) => ({
        ...old,
        requested: false,
        followed_by: true,
      }));
      
      // 5. Invalidate your own profile to update follower counts
      queryClient.invalidateQueries({ queryKey: ['accounts', 'me'] });
    },
  });
};

/*
const FollowRequestItem = ({ account }) => {
  const { mutate: authorize, isPending } = useAuthorizeFollowRequest();

  return (
    <div className="request-item">
      <span>{account.username}</span>
      <button 
        onClick={() => authorize(account.id)} 
        disabled={isPending}
      >
        {isPending ? 'Authorizing...' : 'Accept'}
      </button>
    </div>
  );
};
*/
//------------------------------------------
// src/features/accounts/api/useAccountActions.js

export const useRejectFollowRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // REPLACES: The .post() call in your thunk
    mutationFn: (id) => api.post(`/api/v1/follow_requests/${id}/reject`),

    // REPLACES: rejectFollowRequestRequest
    onMutate: async (id) => {
        await queryClient.cancelQueries({ queryKey: ['accounts', 'follow-requests'] });
        const previousRequests = queryClient.getQueryData(['accounts', 'follow-requests']);

        // Optimistically remove from list
        queryClient.setQueryData(['accounts', 'follow-requests'], (old) => 
            deleteByAccountInPages(old, id)
        );

        return { previousRequests };
    },

    // REPLACES: rejectFollowRequestFail
    onError: (err, id, context) => {
        queryClient.setQueryData(['accounts', 'follow-requests'], context.previousRequests);
    },

    // REPLACES: rejectFollowRequestSuccess
    onSuccess: (_, id) => {
        // Update relationship to show we are no longer waiting on this request
        queryClient.setQueryData(['relationship', id], (old) => ({
            ...old,
            requested: false,
        }));
    },
  });
};
/*
const FollowRequestItem = ({ account }) => {
  const { mutate: authorize, isPending: isAccepting } = useAuthorizeFollowRequest();
  const { mutate: reject, isPending: isRejecting } = useRejectFollowRequest();

  return (
    <div className="request-card">
      <p>{account.username}</p>
      <button onClick={() => authorize(account.id)} disabled={isAccepting || isRejecting}>
        {isAccepting ? '...' : 'Accept'}
      </button>
      <button onClick={() => reject(account.id)} disabled={isAccepting || isRejecting}>
        {isRejecting ? '...' : 'Reject'}
      </button>
    </div>
  );
};
*/

// src/features/accounts/api/useAccountActions.js
export const usePinAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Handles both Pin and Unpin via a 'pin' boolean argument
    mutationFn: ({ id, pin }) => 
      api.post(`/api/v1/accounts/${id}/${pin ? 'pin' : 'unpin'}`).then(res => res.data),

    // REPLACES: pinAccountRequest / unpinAccountRequest
    onMutate: async ({ id, pin }) => {
      await queryClient.cancelQueries({ queryKey: ['relationship', id] });
      const previousRelationship = queryClient.getQueryData(['relationship', id]);

      // Optimistically toggle the 'pinned' flag
      queryClient.setQueryData(['relationship', id], (old) => ({
        ...old,
        pinned: pin,
      }));

      return { previousRelationship };
    },

    // REPLACES: pinAccountFail / unpinAccountFail
    onError: (err, { id }, context) => {
      queryClient.setQueryData(['relationship', id], context.previousRelationship);
    },

    // REPLACES: pinAccountSuccess / unpinAccountSuccess
    onSuccess: (data, { id }) => {
      // Ensure the cache is in sync with the exact object from the server
      queryClient.setQueryData(['relationship', id], data);
    },
  });
};

/*
const AccountMenu = ({ accountId }) => {
...
};
*/


//======================================================================================
// src/features/accounts/api/useAccountActions.js
export const useUnmuteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId) => api.post(`/api/v1/accounts/${accountId}/unmute`),

    onMutate: async (accountId) => {
      await queryClient.cancelQueries({ queryKey: ['accounts', 'mutes'] });
      const previousMutes = queryClient.getQueryData(['accounts', 'mutes']);

      // 1. Remove from the Mutes List cache immediately
      queryClient.setQueryData(['accounts', 'mutes'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            items: page.items.filter(acc => acc.id !== accountId)
          }))
        };
      });

      // 2. Update the specific relationship cache
      queryClient.setQueryData(['relationship', accountId], (old) => ({
        ...old,
        muting: false
      }));

      return { previousMutes };
    },

    onError: (err, accountId, context) => {
      queryClient.setQueryData(['accounts', 'mutes'], context.previousMutes);
    },

    onSuccess: (_, accountId) => {
      // Find every status by this user in the cache and flip isMuted to false
      queryClient.setQueriesData({ queryKey: ['statuses'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            items: page.items.map(status => 
              status.account.id === accountId ? { ...status, isMuted: false } : status
            )
          }))
        };
      });
    },

    onSettled: (data, err, accountId) => {
      queryClient.invalidateQueries({ queryKey: ['accounts', 'mutes'] });
      queryClient.invalidateQueries({ queryKey: ['relationship', accountId] });
    }
  });
};
/*
Why this is better than Redux:

    State Separation: The fact that a specific post is "revealed" is Transient UI State. It shouldn't live in Redux or the global cache. useState is the right tool here.
    Global Sync: If you unmute a user via the USPS-style Admin API or a profile button, the setQueriesData call ensures their posts "pop back" to normal visibility across the whole app.
    Memory: If you decide to "Hard Mute" (remove entirely), you just change .map to .filter in the select function, and you don't have to touch a single component.

Next Step: This completes the Visibility & Filtering domain. Should we now look at Direct Messages (DMs) or the Report/Moderation workflow?
Proactive Follow-up: Would you like to see how to implement "Muted Notifications" (hiding notifications from people you've muted) using this same pattern?

*/
//========================================================================================
//Optimistic Unblock mutation
//Add this to src/features/accounts/api/useAccountActions.js. 
// This replaces the unblockAccount thunk and its associated Redux actions.

export const useUnblockAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // 1. The API Call
    mutationFn: (accountId) => 
      api.post(`/api/v1/accounts/${accountId}/unblock`),

    // 2. Optimistic Update (The "Instant Removal")
    onMutate: async (accountId) => {
      // Cancel outgoing fetches for the blocks list
      await queryClient.cancelQueries({ queryKey: ['accounts', 'blocks'] });

      // Snapshot current data for rollback
      const previousBlocks = queryClient.getQueryData(['accounts', 'blocks']);

      // Remove the user from the infinite scroll pages immediately
      queryClient.setQueryData(['accounts', 'blocks'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.filter((acc) => acc.id !== accountId),
          })),
        };
      });

        // 2. Optimistically remove from the blocks list (check later ifabove is enough)
        queryClient.setQueryData(['accounts', 'blocks'], (old) => 
            deleteByAccountInPages(old, accountId)
        );

      // Update the relationship cache so the button on their profile flips too
      queryClient.setQueryData(['relationship', accountId], (old) => ({
        ...old,
        blocking: false,
      }));

      return { previousBlocks };
    },

    // 3. Rollback on Error
    onError: (err, accountId, context) => {
      queryClient.setQueryData(['accounts', 'blocks'], context.previousBlocks);
    },

    // 4. Final Sync
    onSettled: (data, err, accountId) => {
      // Invalidate so the "Blocked Users" count stays accurate
      queryClient.invalidateQueries({ queryKey: ['accounts', 'blocks'] });
      queryClient.invalidateQueries({ queryKey: ['relationship', accountId] });

      // Ensure sync
      queryClient.invalidateQueries({ queryKey: ['relationships'] });
    },
  });
};

/*
Redux Part	          TanStack Query Equivalent
Fetch Profile	         useAccount(id)
Follow/Unfollow	         useAccountActions().followMutation
Blocks/Mutes List	    useBlockedAccounts()
Unblock/Unmute	         useUnblockAccount()
*/
/*
const UnblockButton = ({ accountId }) => {
...
};
No Manual List Filtering: In Redux, you had to manually filter the blocks array in your reducer after the SUCCESS action. Here, TanStack Query handles the UI update instantly.
Coordinated State: When you unblock a user here, any other part of the app showing that user (like a Status Card or Profile Header) will also reflect the change because they share the ['relationship', accountId] key.
Clean Reducers: You can now delete the UNBLOCK_ACCOUNT_REQUEST, SUCCESS, and FAIL constants from your accountsSlice.js.
*/



//======================================================================
// src/features/accounts/api/useAccountActions.js

/*
const MutesList = () => {
  ...
};

*/
//==================================================================================
// src/features/accounts/api/useAccountActions.js
export const useDismissSuggestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId) => api.delete(`/api/v1/suggestions/${accountId}`),
    
    // REPLACES: dispatch({ type: SUGGESTIONS_DISMISS })
    onMutate: async (accountId) => {
      await queryClient.cancelQueries({ queryKey: ['accounts', 'suggestions'] });
      const previous = queryClient.getQueryData(['accounts', 'suggestions']);

      queryClient.setQueryData(['accounts', 'suggestions'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            items: page.items.filter(item => {
              const id = item.account ? item.account.id : item.id;
              return id !== accountId;
            })
          }))
        };
      });

      return { previous };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['accounts', 'suggestions'], context.previous);
    }
  });
};
/*
const SuggestionsList = () => {
...
};

*/
//==========================================================
export const useToggleFollow = (accountId) => {
  const queryClient = useQueryClient();

  return useMutation({
    // 1. API Call
    mutationFn: ({ isFollowing, isLocked }) => {
      const action = isFollowing ? 'unfollow' : 'follow';
      return api.post(`/api/v1/accounts/${accountId}/${action}`);
    },

    // 2. Optimistic Update
    onMutate: async ({ isFollowing, isLocked }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic state
      await queryClient.cancelQueries({ queryKey: ['relationships', accountId] });

      // Snapshot the previous relationship for rollback
      const previousRelationship = queryClient.getQueryData(['relationships', accountId]);

      // Instantly update the cache using our Zod-validated structure
      queryClient.setQueryData(['relationships', accountId], (old) => {
        return relationshipSchema.parse({
          ...(old || { id: accountId }),
          // If they are locked, we set 'requested', otherwise 'following'
          following: !isFollowing && !isLocked,
          requested: !isFollowing && isLocked,
        });
      });

      return { previousRelationship };
    },

    // 3. Rollback on Error
    onError: (err, variables, context) => {
      queryClient.setQueryData(['relationships', accountId], context.previousRelationship);
    },

    // 4. Final Sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['relationships', accountId] });
    }
  });
};






