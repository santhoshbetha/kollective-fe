import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { deletePostInPages, updatePostInPages } from '../utils/cacheHelpers';
import { adjustReplyCount } from '../utils/cacheHelpers';
import { deleteByStatusInPages } from '@/features/notifications/utils/notificationCacheHelpers';
import { statusKeys } from '../../../queries/keys';
import { triggerHaptic } from '@/utils/haptics';

// Why this works for kollective:-FE

//1. Atomic Updates: Only the component rendering the parent status will re-render.
//2. State Protection: The Math.max(0, ...) check ensures you never end up with -1 replies 
// if multiple deletions happen fast.
//3. Cross-Timeline Sync: If the parent post exists in both the "Home" feed and a "List" feed, 
// both will show the updated reply count instantly because of setQueriesData.

//Summary of your "Statuses" Feature:
//Action	                        Redux Location	                           TanStack Hook
//Fetch Feed	                  fetchStatuses (thunk)	                     useTimeline
//Reply Count Up	              createStatusRequest	                    useCreateStatus (onMutate)
//Reply Count Down	              deleteStatusRequest	                    useDeleteStatus (onMutate)
//Rollback	                      createStatusFail	                        useCreateStatus (onError)

export const useCreateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => api.post('/api/v1/statuses', params),

    // REPLACES: createStatusRequest
    onMutate: async (params) => {
      if (!params.in_reply_to_id) return;

      await queryClient.cancelQueries({ queryKey: ['statuses'] });

      // Optimistically increment the reply count of the parent post
      queryClient.setQueriesData({ queryKey: ['statuses'] }, (oldData) => 
        updatePostInPages(oldData, params.in_reply_to_id, { 
          replies_count: (count) => (count || 0) + 1 
        })
      );
    },

    // REPLACES: createStatusFail (Automatic Rollback)
    onError: (err, params) => {
      if (!params.in_reply_to_id) return;
      
      // Revert the reply count
      queryClient.setQueriesData({ queryKey: ['statuses'] }, (oldData) => 
        updatePostInPages(oldData, params.in_reply_to_id, { 
          replies_count: (count) => Math.max(0, (count || 1) - 1) 
        })
      );
    }
  });
};

export const useCreateStatus2 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => api.post('/api/v1/statuses', params),
    
    onMutate: async (params) => {
      const parentId = params.in_reply_to_id;
      if (!parentId) return;

      // Cancel outgoing fetches to prevent overwriting our update
      await queryClient.cancelQueries({ queryKey: ['statuses'] });

      // REPLACES: createStatusRequest logic
      queryClient.setQueriesData({ queryKey: ['statuses'] }, (old) => 
        adjustReplyCount(old, parentId, 1)
      );
    },

    onError: (err, params) => {
      const parentId = params.in_reply_to_id;
      if (!parentId) return;

      // REPLACES: createStatusFail logic
      queryClient.setQueriesData({ queryKey: ['statuses'] }, (old) => 
        adjustReplyCount(old, parentId, -1)
      );
    },
    
    onSuccess: () => {
      // Final sync with server to ensure count is 100% accurate
      queryClient.invalidateQueries({ queryKey: ['statuses'] });
    }
  });
};

export const useDeleteStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (statusId) => api.delete(`/api/v1/statuses/${statusId}`),
    
    // Step 1: Update the UI immediately
    onMutate: async (statusId) => {
      // Cancel any outgoing refetches so they don't overwrite our cache update
      await queryClient.cancelQueries({ queryKey: ['statuses'] });

      // Apply the helper to EVERY query key that starts with ['statuses']
      queryClient.setQueriesData({ queryKey: ['statuses'] }, (oldData) => 
        deletePostInPages(oldData, statusId)
      );
    },

    // Step 2: If the server fails, refetch to bring the post back
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['statuses'] });
    }
  });
};

export const useDeleteStatus2 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status) => api.delete(`/api/v1/statuses/${status.id}`),

    // REPLACES: deleteStatusRequest
    onMutate: async (status) => {
      if (status.in_reply_to_id) {
        queryClient.setQueriesData({ queryKey: ['statuses'] }, (old) => 
          updatePostInPages(old, status.in_reply_to_id, { 
            replies_count: (c) => Math.max(0, c - 1) 
          })
        );
      }
    },

    // REPLACES: deleteStatusFail
    onError: (err, status) => {
      if (status.in_reply_to_id) {
        queryClient.setQueriesData({ queryKey: ['statuses'] }, (old) => 
          updatePostInPages(old, status.in_reply_to_id, { 
            replies_count: (c) => c + 1 
          })
        );
      }
    }
  });
};

/*
Why this is a win for kollective:-FE:

    1. Encapsulation: The logic for "if I delete X, update parent Y" lives entirely within the 
      useDeleteStatus hook. In Redux, this was scattered across different action types and reducers.
    2. No Manual "Expand" State: By storing expanded: expandSpoilers in the cache, any component rendering 
      that status will automatically respect that preference.
    3. Referential Integrity: Using setQueriesData ensures that only the parent post's component 
      re-renders when the reply count changes, rather than the entire timeline.
*/

export const useStatusActions = () => {
    const queryClient = useQueryClient();

    // UNIVERSAL HELPER: Updates a status regardless of where it lives (Detail or Timeline)
    const updateEverywhere = (statusId, updater) => {
      // 1. Update all Timelines (Home, Profile, etc.)
      queryClient.setQueriesData({ queryKey: statusKeys.timelines() }, (oldData) => {
        if (!oldData?.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map(page => 
            page.map(s => s.id === statusId ? updater(s) : s)
          )
        };
      });

      // 2. Update Individual Detail Queries
      // This finds ['status', 'detail', statusId]
      queryClient.setQueriesData({ queryKey: statusKeys.details() }, (oldData) => {
        // For details, oldData is the status object itself
        if (oldData?.id === statusId) return updater(oldData);
        return oldData;
      });
    };

    // 1. Create (Post) (postStatus)
    const createMutation = useMutation({
      mutationFn: (data) => api.post('/api/v1/statuses', data).then(res => res.data),
      onSuccess: () => {
        // Invalidate home timeline so the new post appears at the top
        queryClient.invalidateQueries({ queryKey: statusKeys.timeline('home') });
      },
    });

    // 2. Edit (Update) Edit / Update (editStatus / updateStatus)
    const editMutation = useMutation({
      mutationFn: ({ id, data }) => api.put(`/api/v1/statuses/${id}`, data).then(res => res.data),
      onSuccess: (updatedStatus) => {
        // Use the helper to swap the old status with the new one everywhere
        updateEverywhere(updatedStatus.id, () => updatedStatus);
      }
    });

    // --- MUTATIONS ---
    const favoriteMutation = useMutation({
      mutationFn: (id) => api.post(`/api/v1/statuses/${id}/favourite`).then(res => res.data),
      onMutate: async (id) => {
        // Optimistic Update
        updateEverywhere(id, (s) => ({ 
          ...s, 
          favourited: true, 
          favourites_count: (s.favourites_count || 0) + 1 
        }));
      },
      onError: (err, id) => queryClient.invalidateQueries({ queryKey: statusKeys.all }),
    });

    const deleteMutation = useMutation({
      mutationFn: (id) => api.delete(`/api/v1/statuses/${id}`),
      onSuccess: (_, id) => {
        // Remove from all timelines
        queryClient.setQueriesData({ queryKey: statusKeys.timelines() }, (old) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map(page => page.filter(s => s.id !== id))
          };
        });
        // Remove specific detail cache
        queryClient.removeQueries({ queryKey: statusKeys.detail(id) });
      }
    });

    // Reblog (Boost) Mutation
    const reblogMutation = useMutation({
      mutationFn: (id) => api.post(`/api/v1/statuses/${id}/reblog`).then(res => res.data),
      onMutate: (id) => {
        updateEverywhere(id, (s) => ({ 
          ...s, 
          reblogged: true, 
          reblogs_count: (s.reblogs_count || 0) + 1 
        }));
      },
      onSuccess: () => {
        // Invalidate home so the new boost appears at the top
        queryClient.invalidateQueries({ queryKey: statusKeys.timeline('home') });
      }
    });

    // Mute User Mutation
    const muteMutation = useMutation({
      mutationFn: (accountId) => api.post(`/api/v1/accounts/${accountId}/mute`),
      onSuccess: (_, accountId) => {
        // Remove all posts by this user from all timelines
        queryClient.setQueriesData({ queryKey: statusKeys.timelines() }, (old) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map(page => page.filter(s => s.account.id !== accountId))
          };
        });
      }
    });

    // 3. Unmute User
    const unmuteMutation = useMutation({
      mutationFn: (accountId) => api.post(`/api/v1/accounts/${accountId}/unmute`),
      onSuccess: () => {
        // Since we filtered muted posts out of the cache, we must refetch to see them again
        queryClient.invalidateQueries({ queryKey: statusKeys.timelines() });
      }
    });

    // 4. Translate Status
    const translateMutation = useMutation({
      mutationFn: (id) => api.post(`/api/v1/statuses/${id}/translate`).then(res => res.data),
      onSuccess: (translatedData, id) => {
        updateEverywhere(id, (s) => ({ ...s, translation: translatedData }));
      }
    });

    // 5. Handle Like (Universal wrapper for favoriteMutation)
    const handleLike = (statusId, isLiked) => {
      // This allows your UI to just call handleLike(id, true/false)
      if (isLiked) {
        favoriteMutation.mutate(statusId);
      } else {
        // You would need an unfavoriteMutation defined similarly
        unfavoriteMutation.mutate(statusId); 
      }
    };

    return { 
      createMutation, editMutation,
      favoriteMutation, deleteMutation, 
      reblogMutation, muteMutation, 
      unmuteMutation, translateMutation, handleLike 
    };
};

export const useTranslateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // 1. The API Call
    mutationFn: async ({ id, lang }) => {
      const res = await fetch(`/api/v1/statuses/${id}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_language: lang }),
      });
      if (!res.ok) throw new Error(`Translation failed (${res.status})`);
      return res.json();
    },

    // 2. The Cache Update
    onSuccess: (translationData, { id }) => {
      // Helper logic similar to your 'updateEverywhere' to sync all views
      const updater = (oldStatus) => ({
        ...oldStatus,
        translation: translationData,
        isTranslated: true
      });

      // Update Timelines (Home, Profile, etc.)
      queryClient.setQueriesData({ queryKey: statusKeys.timelines() }, (old) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map(page => page.map(s => s.id === id ? updater(s) : s))
        };
      });

      // Update Individual Status Details & Contexts
      // This targets ['status', 'detail', id] and ['status', 'context', conversationId]
      queryClient.setQueriesData({ queryKey: statusKeys.all }, (old) => {
        if (old?.id === id) return updater(old);
        // If the context is an object with allStatuses Map (from our fetchContext)
        if (old?.allStatuses?.has(id)) {
           const status = old.allStatuses.get(id);
           old.allStatuses.set(id, updater(status));
           return { ...old };
        }
        return old;
      });
    },

    onError: (error) => {
      console.error("Translation failed:", error.message);
    }
  });
};

/*
const StatusTranslation = ({ status }) => {
  const { mutate, isPending } = useTranslateStatus();

  if (status.translation) {
    return <div className="translation-box">{status.translation.content}</div>;
  }

  return (
    <button 
      onClick={() => mutate({ id: status.id, lang: 'en' })}
      disabled={isPending}
    >
      {isPending ? 'Translating...' : 'Translate'}
    </button>
  );
};

const { mutate: translate, isPending } = useTranslateStatus();

const handleTranslate = () => {
  translate({ id: status.id, lang: 'en' });
};

return (
  <div>
    {status.isTranslated ? (
      <p className="italic text-blue-600">{status.translation.content}</p>
    ) : (
      <p>{status.content}</p>
    )}
    <button onClick={handleTranslate} disabled={isPending}>
      {isPending ? 'Translating...' : 'Translate'}
    </button>
  </div>
);
Why this is a "Cleaner" Migration:

    Ephemeral State: Loading states like isPending are local to the button. 
    You don't have to manage a global state.isTranslatingID in your Redux slice.
    No Manual Search: setQueriesData with the updatePostInPages helper automatically 
    finds the status whether it's on the 1st page or the 10th page of your infinite scroll.
    Automatic Synchronization: If the user has the same status open in two different 
    columns (e.g., Home Feed and a Thread view), clicking "Translate" in one will instantly update both because they share the same cache key.
*/

/*
Why this is the "Golden Standard":

Ref referential Integrity: By using .map(), TanStack Query knows exactly which objects changed. 
Only the StatusCard for that specific post will re-render.

Sync Across Views: Because we use queryClient.setQueriesData (plural), 
if you like a post in the "Notifications" tab, it will already be "liked" when you switch back to the "Home" tab.

No Reducers: You’ve effectively moved 50 lines of statusesSlice.js logic into a single reusable helper.
*/

export const useFavoriteStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.post(`/api/v1/statuses/${id}/favourite`).then(res => res.data),
    
    onMutate: async (id) => {
      // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: statusKeys.all });

      // 2. Snapshot the current state of ALL status-related queries for a full rollback
      const previousQueries = queryClient.getQueriesData({ queryKey: statusKeys.all });

      // 3. Optimistically update EVERYWHERE (Timelines + Details)
      // Note: We pass a function to the updater to ensure we use the current count
      const updater = (s) => ({ 
        ...s, 
        favourited: true, 
        favourites_count: (s.favourites_count || 0) + 1 
      });

      // Update Timelines
      queryClient.setQueriesData({ queryKey: statusKeys.timelines() }, (old) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map(page => page.map(s => s.id === id ? updater(s) : s))
        };
      });

      // Update Individual Details
      queryClient.setQueriesData({ queryKey: statusKeys.details() }, (old) => {
        return old?.id === id ? updater(old) : old;
      });

      // 4. Return the snapshot context
      return { previousQueries };
    },

    // 5. Success: Replace optimistic data with actual server data
    onSuccess: (updatedStatus) => {
      queryClient.setQueriesData({ queryKey: statusKeys.details() }, (old) => 
        old?.id === updatedStatus.id ? updatedStatus : old
      );
    },

    // 6. Error: Rollback every query we snapshotted
    onError: (err, id, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
    },
    
    // 7. Always refetch after error or success to stay in sync with server
    onSettled: (updatedStatus) => {
      if (updatedStatus) {
        queryClient.invalidateQueries({ queryKey: statusKeys.detail(updatedStatus.id) });
      }
    }
  });
};


export const useStatusInteractions = () => {
  const queryClient = useQueryClient();

  // Reusable helper to handle the "Optimistic" part of your Redux logic
  const optimisticallyUpdateStatus = async (id, updater) => {
    // 1. Cancel outgoing fetches
    await queryClient.cancelQueries({ queryKey: statusKeys.all });

    // 2. Snapshot ALL queries starting with 'status'
    const previousQueries = queryClient.getQueriesData({ queryKey: statusKeys.all });

    // 3. Update Timelines
    queryClient.setQueriesData({ queryKey: statusKeys.timelines() }, (old) => {
      if (!old?.pages) return old;
      return {
        ...old,
        pages: old.pages.map(page => 
          page.map(s => s.id === id ? { ...s, ...updater(s) } : s)
        )
      };
    });

    // 4. Update Details/Contexts
    queryClient.setQueriesData({ queryKey: statusKeys.all }, (old) => {
      if (old?.id === id) return { ...old, ...updater(old) };
      // Handle the allStatuses Map if in a Context query
      if (old?.allStatuses?.has(id)) {
        const s = old.allStatuses.get(id);
        old.allStatuses.set(id, { ...s, ...updater(s) });
        return { ...old };
      }
      return old;
    });

    return { previousQueries };
  };

  // 1. Favourite / Unfavourite (Replaces favouriteRequest & unFavouriteRequest)
  // 1. Favourite / Unfavourite
  const favoriteMutation = useMutation({
    mutationFn: ({ id, active }) => 
      api.post(`/api/v1/statuses/${id}/${active ? 'favourite' : 'unfavourite'}`).then(res => res.data),
    onMutate: ({ id, active }) => 
      optimisticallyUpdateStatus(id, (s) => ({
        favourited: active,
        favourites_count: Math.max(0, (s.favourites_count || 0) + (active ? 1 : -1))
      })),
    onError: (err, variables, context) => {
      // Rollback every snapped query
      context?.previousQueries?.forEach(([key, value]) => queryClient.setQueryData(key, value));
    }
  });


  // 2. Dislike / Undislike (Replaces dislikeRequest & undislikeRequest)
  // 2. Dislike
  const dislikeMutation = useMutation({
    mutationFn: ({ id, active }) => 
      api.post(`/api/v1/statuses/${id}/${active ? 'dislike' : 'undislike'}`),
    onMutate: ({ id, active }) => 
      optimisticallyUpdateStatus(id, (s) => ({
        disliked: active,
        dislikes_count: Math.max(0, (s.dislikes_count || 0) + (active ? 1 : -1))
      })),
    onError: (err, variables, context) => {
      context?.previousQueries?.forEach(([key, value]) => queryClient.setQueryData(key, value));
    }
  });

  // 3. Emoji Reactions (Replaces emojiReactRequest & unEmojiReactRequest)
  const emojiMutation = useMutation({
    mutationFn: ({ id, emoji, active }) => 
      api.post(`/api/v1/statuses/${id}/emoji_react`, { emoji, active }),
    onMutate: ({ id, emoji, active }) => 
      optimisticallyUpdateStatus(id, (s) => ({
        emojiReacts: active 
          ? simulateEmojiReact(s.emojiReacts, emoji) 
          : simulateUnEmojiReact(s.emojiReacts, emoji)
      })),
    onError: (err, variables, context) => {
      context?.previousQueries?.forEach(([key, value]) => queryClient.setQueryData(key, value));
    }
  });

  return { favoriteMutation, dislikeMutation, emojiMutation };
};
//==========================================================================

/*
 Why this is superior to the notificationsSlice approach:

    1. Cross-Key Synchronization: In Redux, you had to manually coordinate between the statuses slice 
    and the notifications slice. Here, setQueriesData with a partial key (['notifications']) 
    automatically finds every active notification filter (All, Mentions, etc.) and cleans them up.
    2. No Magic Strings: You aren't relying on action types. You are directly manipulating the data s
    hape defined by your API and Zod schema.
    3. Stability: The UI only re-renders the specific list that contained the deleted item, preventing a full-app flash.

Proactive Follow-up: Since you've successfully moved the Status and Notification deletion logic to TanStack, should we create a similar deleteByAccountInPages helper to handle Blocking or Muting users?
*/

export const useDeleteStatus3 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (statusId) => api.delete(`/api/v1/statuses/${statusId}`),
    
    // Optimistic Update
    onMutate: async (statusId) => {
      // 1. Cancel outgoing fetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      await queryClient.cancelQueries({ queryKey: ['statuses'] });

      // 2. Remove the status from all Timelines
      queryClient.setQueriesData({ queryKey: ['statuses'] }, (old) => 
        deletePostInPages(old, statusId) // The helper we built earlier
      );

      // 3. Remove notifications related to this status
      // This replaces the Redux action: dispatch(deleteByStatus(statusId))
      queryClient.setQueriesData({ queryKey: ['notifications'] }, (old) => 
        deleteByStatusInPages(old, statusId)
      );
    },
    
    onError: () => {
      // Rollback: Refetch if delete fails
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['statuses'] });
    }
  });
};

//==================================================================================
//"Optimistic Likes"
//To implement Optimistic Likes (Favoriting) in a Mastodon/Kollective app, you use the same pattern as following, but you must also increment the Like Count so the number changes instantly alongside the heart icon.
//This replaces the manual logic in your statusesSlice.js where you previously searched through arrays to toggle favourited.

export const useLikeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // 1. The API Call
    mutationFn: ({ id, isLiked }) => 
      api.post(`/api/v1/statuses/${id}/${isLiked ? 'unfavourite' : 'favourite'}`),

    // 2. The Optimistic Update
    onMutate: async ({ id, isLiked }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic state
      await queryClient.cancelQueries({ queryKey: ['statuses'] });

      // Snapshot previous state for rollback
      const previousData = queryClient.getQueryData(['statuses']);

      // Update EVERY timeline that contains this status
      queryClient.setQueriesData({ queryKey: ['statuses'] }, (old) => 
        updatePostInPages(old, id, {
          favourited: !isLiked,
          favourites_count: (count) => Math.max(0, (count || 0) + (isLiked ? -1 : 1))
        })
      );

      return { previousData };
    },

    // 3. Rollback on Error
    onError: (err, variables, context) => {
      queryClient.setQueriesData({ queryKey: ['statuses'] }, context.previousData);
    },

    // 4. Final Sync
    onSettled: (data, err, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['statuses', id] });
    }
  });
};
/*
//"Optimistic Likes"
const LikeButton = ({ status }) => {
  const { mutate: toggleLike, isPending } = useLikeStatus();

  return (
    <button 
      className={`like-btn ${status.favourited ? 'active' : ''}`}
      onClick={() => toggleLike({ id: status.id, isLiked: status.favourited })}
      disabled={isPending}
    >
      <HeartIcon filled={status.favourited} />
      <span>{status.favourites_count}</span>
    </button>
  );
};

*/
//===============================================================================

// /"Optimistic Reblogs"
// /Implementing Optimistic Reblogs (Boosts) is the most complex interaction because you have to toggle the reblogged boolean while also incrementing the reblogs_count.
//Additionally, in Mastodon/Kollective, when you reblog a post, it often triggers a "New Status" event for your own profile. TanStack Query simplifies this by allowing you to update the existing cache and invalidate your profile timeline simultaneously.

export const useReblogStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // 1. The API Call
    mutationFn: ({ id, isReblogged }) => 
      api.post(`/api/v1/statuses/${id}/${isReblogged ? 'unreblog' : 'reblog'}`),

    // 2. The Optimistic Update
    onMutate: async ({ id, isReblogged }) => {
      await queryClient.cancelQueries({ queryKey: ['statuses'] });
      const previousData = queryClient.getQueryData(['statuses']);

      // Update the reblog state and count instantly
      queryClient.setQueriesData({ queryKey: ['statuses'] }, (old) => 
        updatePostInPages(old, id, {
          reblogged: !isReblogged,
          reblogs_count: (count) => Math.max(0, (count || 0) + (isReblogged ? -1 : 1))
        })
      );

      return { previousData };
    },

    // 3. Rollback on Error
    onError: (err, variables, context) => {
      queryClient.setQueriesData({ queryKey: ['statuses'] }, context.previousData);
    },

    // 4. Final Sync & Profile Update
    onSettled: (data, err, { isReblogged }) => {
      // If we just reblogged, our own profile feed needs to be refreshed 
      // to show the new boost at the top.
      if (!isReblogged) {
        queryClient.invalidateQueries({ queryKey: ['statuses', 'profile'] });
      }
      queryClient.invalidateQueries({ queryKey: ['statuses'] });
    }
  });
};

/*
"Optimistic Reblogs"
const ReblogButton = ({ status }) => {
  const { mutate: toggleReblog, isPending } = useReblogStatus();

  return (
    <button 
      className={`reblog-btn ${status.reblogged ? 'active' : ''}`}
      onClick={() => toggleReblog({ id: status.id, isReblogged: status.reblogged })}
      disabled={isPending}
    >
      <ReblogIcon active={status.reblogged} />
      <span>{status.reblogs_count}</span>
    </button>
  );
};

*/
//==================================================================================
 //"Retry" Logic for Search Actions
 // src/features/statuses/api/useStatusActions.js

//Implementing the "Like" Mutation with Retry logic
//When you "Like" a post, the Optimistic Update makes the UI update immediately. 
// If the network is down, the mutation will stay in a "paused" state and 
// fire automatically once the connection is restored.

export const useLikeStatus2 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isLiked }) => 
      api.post(`/api/v1/statuses/${id}/${isLiked ? 'unfavourite' : 'favourite'}`),
    
    onMutate: async ({ id, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: ['statuses'] });
      const previous = queryClient.getQueryData(['statuses']);

      // Optimistically flip the heart icon
      queryClient.setQueriesData({ queryKey: ['statuses'] }, (old) => 
        updatePostInPages(old, id, { favourited: !isLiked })
      );

      return { previous };
    },

    // If it fails after 3 retries, rollback the heart icon
    onError: (err, variables, context) => {
      queryClient.setQueryData(['statuses'], context.previous);
    },
  });
};

/*
//"Retry" Logic for Search Actions
const LikeButton = ({ status }) => {
  const { mutate, isPending, isPaused } = useLikeStatus();

  return (
    <button onClick={() => mutate({ id: status.id, isLiked: status.favourited })}>
      <HeartIcon active={status.favourited} />
      {/* 3. Tell the user it's queued but waiting for signal *//*}
      {isPaused && <span className="status-badge">Waiting for network...</span>}
    </button>
  );
};

*/
//===============================================================================
//For the queue to be readable, you need to add meta information to your mutations 
// so the hook knows what they are.
//
const createStatus = useMutation({
  mutationFn: (data) => api.post('/api/v1/statuses', data),
  // Add metadata for the Outgoing Queue UI
  meta: { 
    type: 'POST_STATUS',
    description: 'Posting a new update'
  },
  networkMode: 'offlineFirst',
});

/*
const OutgoingQueue = () => {
  const queue = useOutgoingQueue();
  
  if (queue.length === 0) return null;

  return (
    <div className="sync-queue">
      <h4>{queue.length} actions syncing...</h4>
      <ul>
        {queue.map((item) => (
          <li key={item.id}>
            {item.type === 'POST_STATUS' ? '📝 Posting update' : '❤️ Liking post'}
            {item.isPaused && <span className="wait-tag"> (Waiting for network)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

1. Transparency: Users get nervous when they click "Post" and nothing happens. 
This UI confirms the app "remembers" their action.
2. Zero Extra State: You don't need a state.queue = [] in Redux. You are reading directly 
from the TanStack Mutation Cache, which is the single source of truth.
3. Automatic Cleanup: As soon as the network returns and the mutation succeeds, 
it automatically vanishes from this list.

*/

//==================================================================================
// /useEmojiReaction
export const useEmojiReaction = (statusId) => {
  const queryClient = useQueryClient();

  return useMutation({
    // 1. API Call (Kollective-specific endpoint)
    mutationFn: ({ emoji, active }) => {
      const endpoint = active ? 'unreact' : 'react';
      return api.put(`/api/v1/kollective/statuses/${statusId}/${endpoint}/${emoji}`);
    },

    // 2. Optimistic Update
    onMutate: async ({ emoji, active }) => {
      await queryClient.cancelQueries({ queryKey: ['statuses'] });
      const previous = queryClient.getQueriesData({ queryKey: ['statuses'] });

      // Update the 'kollective.emoji_reactions' array in the cache instantly
      queryClient.setQueriesData({ queryKey: ['statuses'] }, (old) => 
        updatePostInPages(old, statusId, (status) => {
          const reactions = status.kollective?.emoji_reactions || [];
          let nextReactions;

          if (active) {
            // Remove reaction or decrement count
            nextReactions = reactions.map(r => 
              r.name === emoji ? { ...r, count: r.count - 1, me: false } : r
            ).filter(r => r.count > 0);
          } else {
            // Add new reaction or increment count
            const exists = reactions.find(r => r.name === emoji);
            nextReactions = exists 
              ? reactions.map(r => r.name === emoji ? { ...r, count: r.count + 1, me: true } : r)
              : [...reactions, { name: emoji, count: 1, me: true }];
          }

          return { 
            ...status, 
            kollective: { ...status.kollective, emoji_reactions: nextReactions } 
          };
        })
      );

      return { previous };
    },

    onError: (err, variables, context) => {
      queryClient.setQueriesData({ queryKey: ['statuses'] }, context.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['statuses', statusId] });
    }
  });
};
/*
const ReactionButton = ({ status, emojiName, url, count, me }) => {
  const { mutate: react, isPending } = useEmojiReaction(status.id);

  return (
    <button 
      className={`reaction-pill ${me ? 'active' : ''}`}
      onClick={() => react({ emoji: emojiName, active: me })}
      disabled={isPending}
    >
      <img src={url} alt={emojiName} />
      <span>{count}</span>
    </button>
  );
};*/


//==================================================================================
//same as above - check later
export const useEmojiReaction2 = (statusId) => {
  const queryClient = useQueryClient();

  return useMutation({
    // 1. API Call (Kollective-specific PUT endpoint)
    mutationFn: ({ emoji, active }) => {
      const endpoint = active ? 'unreact' : 'react';
      return api.put(`/api/v1/kollective/statuses/${statusId}/${endpoint}/${emoji}`);
    },

    // 2. Optimistic Update
    onMutate: async ({ emoji, active }) => {
      await queryClient.cancelQueries({ queryKey: ['statuses'] });
      const previous = queryClient.getQueriesData({ queryKey: ['statuses'] });

      // Update the specific status in all timeline caches
      queryClient.setQueriesData({ queryKey: ['statuses'] }, (old) => 
        updatePostInPages(old, statusId, (status) => {
          const reactions = status.kollective?.emoji_reactions || [];
          let nextReactions;

          if (active) {
            // Unreact: Decrement count or remove if 0
            nextReactions = reactions.map(r => 
              r.name === emoji ? { ...r, count: r.count - 1, me: false } : r
            ).filter(r => r.count > 0);
          } else {
            // React: Increment count or add new entry
            const exists = reactions.find(r => r.name === emoji);
            nextReactions = exists 
              ? reactions.map(r => r.name === emoji ? { ...r, count: r.count + 1, me: true } : r)
              : [...reactions, { name: emoji, count: 1, me: true }];
          }

          return { 
            ...status, 
            kollective: { ...status.kollective, emoji_reactions: nextReactions } 
          };
        })
      );

      return { previous };
    },

    onError: (err, variables, context) => {
      queryClient.setQueriesData({ queryKey: ['statuses'] }, context.previous);
    },

    onSettled: () => {
      // Refresh the specific thread to ensure counts are 100% accurate
      queryClient.invalidateQueries({ queryKey: ['statuses', statusId] });
    }
  });
};

/*
const ReactionPill = ({ statusId, reaction, emojiUrl }) => {
  const { mutate: toggleReaction, isPending } = useEmojiReaction(statusId);

  return (
    <button 
      className={`reaction-pill ${reaction.me ? 'active' : ''}`}
      onClick={() => toggleReaction({ emoji: reaction.name, active: reaction.me })}
      disabled={isPending}
    >
      <img src={emojiUrl} alt={reaction.name} />
      <span className="count">{reaction.count}</span>
    </button>
  );
};

*/

export const useUnEmojiReaction = (statusId) => {
  const queryClient = useQueryClient();

  return useMutation({
    // 1. Direct call to the unreact endpoint
    mutationFn: ({ emoji }) => {
      return api.put(`/api/v1/kollective/statuses/${statusId}/unreact/${emoji}`);
    },

    // 2. Optimistic update to decrease or remove the reaction count
    onMutate: async ({ emoji }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['statuses'] });

      // Snapshot the previous data for rollback
      const previous = queryClient.getQueriesData({ queryKey: ['statuses'] });

      queryClient.setQueriesData({ queryKey: ['statuses'] }, (old) =>
        updatePostInPages(old, statusId, (status) => {
          const reactions = status.kollective?.emoji_reactions || [];
          
          // Logic: Filter out if count becomes 0, or decrement if count > 1
          const nextReactions = reactions
            .map((r) =>
              r.name === emoji ? { ...r, count: r.count - 1, me: false } : r
            )
            .filter((r) => r.count > 0);

          return {
            ...status,
            kollective: {
              ...status.kollective,
              emoji_reactions: nextReactions,
            },
          };
        })
      );

      return { previous };
    },

    // 3. Rollback on failure
    onError: (err, variables, context) => {
      queryClient.setQueriesData({ queryKey: ['statuses'] }, context.previous);
    },

    // 4. Invalidate to sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['statuses', statusId] });
    },
  });
};

//==================================================================================
export const useToggleFavourite = (accountId = null) => {
  const queryClient = useQueryClient();
  const cacheKey = ['statuses', 'timeline', 'favourites', accountId || 'mine'];

  return useMutation({
    mutationFn: ({ id, isLiked }) => 
      api.post(`/api/v1/statuses/${id}/${isLiked ? 'unfavourite' : 'favourite'}`),

    // OPTIMISTIC UPDATE
    onMutate: async ({ id, isLiked }) => {
      // 1. Cancel outgoing refetches for the Favourites list
      await queryClient.cancelQueries({ queryKey: cacheKey });

      // 2. Snapshot current state for rollback
      const previousData = queryClient.getQueryData(cacheKey);

      // 3. If we are UNFAVOURITING, remove the item from the list instantly
      if (isLiked) {
        queryClient.setQueryData(cacheKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              items: page.items.filter(status => status.id !== id)
            }))
          };
        });
      }

      return { previousData };
    },

    // 4. Rollback if the server fails
    onError: (err, variables, context) => {
      queryClient.setQueryData(cacheKey, context.previousData);
    },

    // 5. Final sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cacheKey });
    }
  });
};
/*
const FavouritesTimeline = ({ accountId }) => {
  const { data } = useFavourites(accountId);
  const { mutate: toggleFav } = useToggleFavourite(accountId);

  return (
    <div className="timeline">
      {data?.pages.map(page => 
        page.items.map(status => (
          <StatusCard 
            key={status.id} 
            status={status} 
            // When clicked, the post will vanish from this list instantly
            onToggleFav={() => toggleFav({ id: status.id, isLiked: status.favourited })}
          />
        ))
      )}
    </div>
  );
};
Targeted Cache Updates: In Redux, you would typically wait for a SUCCESS action to filter your array. With TanStack Query Optimistic Updates, the UI remains ahead of the network.
Automatic Synchronization: Since you use the same cacheKey as the fetching hook, the data and the UI are always in sync.
Error Handling: If the Kollective server fails to process the "unfavourite" (e.g., timeout), the post will "pop back" into the list automatically, keeping the UI honest TanStack Query Mutation Docs.
*/

//===========================================================================
export const useToggleBookmark = () => {
  const queryClient = useQueryClient();
  const timelineKey = ['statuses', 'timeline', 'bookmarks'];

  return useMutation({
    mutationFn: ({ id, isBookmarked }) => 
      api.post(`/api/v1/statuses/${id}/${isBookmarked ? 'unbookmark' : 'bookmark'}`),

    onMutate: async ({ id, isBookmarked }) => {
      await queryClient.cancelQueries({ queryKey: timelineKey });
      const previous = queryClient.getQueryData(timelineKey);

      // 1. Update the 'bookmarked' flag globally
      queryClient.setQueriesData({ queryKey: ['statuses'] }, (old) => 
        updatePostInPages(old, id, { bookmarked: !isBookmarked })
      );

      // 2. If UN-BOOKMARKING from the list, remove it instantly
      if (isBookmarked) {
        queryClient.setQueryData(timelineKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              items: page.items.filter(status => status.id !== id)
            }))
          };
        });
      }

      return { previous };
    },

    onError: (err, variables, context) => {
      queryClient.setQueryData(timelineKey, context.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: timelineKey });
    }
  });
};

//==================================================================================
//"Haptic Feedback"
// src/features/statuses/api/useStatusActions.js
export const useLikeStatus3 = () => {
  return useMutation({
    mutationFn: (params) => api.post('/api/v1/statuses/like', params),
    onMutate: () => {
      // Feel the "Click" of the heart button instantly
      triggerHaptic(HAPTIC_PATTERNS.LIGHT);
    },
    onSuccess: () => {
      // Subtle double-tap when the server confirms
      triggerHaptic(HAPTIC_PATTERNS.SUCCESS);
    }
  });
};

//==================================================================================
// src/features/statuses/api/useStatusActions.ts
// /This replaces the complex simpleEmojiReact thunk. It ensures that if a user reacts with "❤️", any existing "👍" or "😮" is removed first.
export const useExclusiveReaction = (status) => {
  const queryClient = useQueryClient();
  const { mutateAsync: react } = useEmojiReaction(status.id); // From our previous step
  const { mutateAsync: unreact } = useUnEmojiReaction(status.id);
  const { mutateAsync: fav } = useToggleFavourite(); 

  return useMutation({
    mutationFn: async ({ emoji }) => {
      // 1. Identify current "me" reactions
      const currentMeReactions = status.kollective?.emoji_reactions?.filter(r => r.me) || [];
      
      // 2. Clear all existing reactions (Kollective usually allows only one 'me' reaction)
      const cleanup = currentMeReactions.map(r => unreact({ emoji: r.name, active: true }));
      
      // 3. Special case: If '👍', Kollective often maps this to a standard 'Favourite'
      if (emoji === '👍') {
        await Promise.all([...cleanup]);
        return fav({ id: status.id, isLiked: status.favourited });
      }

      // 4. Apply the new exclusive reaction
      await Promise.all([...cleanup, status.favourited && fav({ id: status.id, isLiked: true })]);
      return react({ emoji, active: false });
    },
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['statuses', status.id] });
    }
  });
};

//==================================================================================
// / Handling "Delete from Timelines"
// src/features/statuses/api/useStatusActions.js
export const useDeleteStatus4 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/api/v1/statuses/${id}`),
    onSuccess: (_, id) => {
      // REPLACES: deleteFromTimelines logic
      // Surgically remove the status from EVERY cached timeline
      queryClient.setQueriesData({ queryKey: ['statuses', 'timeline'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            items: page.items.filter(status => status.id !== id && status.reblog?.id !== id)
          }))
        };
      });
    }
  });
};

//==================================================================================
//Cross-Timeline Sync
// src/features/statuses/api/useStatusActions.js
import { syncStatusInCache } from '../utils/cacheSync';

export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }) => 
      api.post(`/api/v1/statuses/${id}/${active ? 'unfavourite' : 'favourite'}`),
    
    onMutate: async ({ id, active }) => {
      // OPTIMISTIC SYNC: Update UI across all tabs/timelines instantly
      syncStatusInCache(queryClient, id, { favourited: !active });
    },
    
    onError: (err, { id, active }) => {
      // Rollback on error
      syncStatusInCache(queryClient, id, { favourited: active });
    }
  });
};
/*
Referential Integrity: In your old Redux setup, you had to manually track where a status was used to update it. 
With setQueriesData, you target all instances of that data by key, ensuring no "stale" hearts or boost counts 
remain on screen.
Efficiency: You aren't forcing a full refetch of the timeline. You are surgically patching a single object 
in the TanStack Cache.
Tab-to-Tab Sync: If you have Tab Synchronization enabled, this patch will even broadcast to other 
open browser tabs.

Every piece of logic from your timelinesSlice, statusesSlice, and reselect selectors has been replaced.
*/

