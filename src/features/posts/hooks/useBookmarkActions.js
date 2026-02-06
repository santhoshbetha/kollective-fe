import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useBookmarkActions() {
  const queryClient = useQueryClient();
  const api = useApi();

  // Helper to update the 'bookmarked' state across the cache
  const updateCache = (statusId, isBookmarked) => {
    // 1. Update the individual status cache
    queryClient.setQueryData(['statuses', statusId], (old) => 
      old ? { ...old, bookmarked: isBookmarked } : old
    );

    // 2. Update all timelines (Home, Public, etc.) that might contain this status
    queryClient.setQueriesData({ queryKey: ['timeline'] }, (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map(page => ({
          ...page,
          items: page.items.map(item => 
            item.id === statusId ? { ...item, bookmarked: isBookmarked } : item
          )
        }))
      };
    });
  };

  const bookmark = useMutation({
    mutationFn: (id) => api.post(`/api/v1/statuses/${id}/bookmark`).then(res => res.json()),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['statuses', id] });
      const previousStatus = queryClient.getQueryData(['statuses', id]);
      
      updateCache(id, true); // Optimistic true
      return { previousStatus };
    },
    onError: (err, id, context) => {
      updateCache(id, context.previousStatus?.bookmarked); // Rollback
    },
    onSuccess: (newStatus) => {
      // Add to the top of the bookmarks list cache
      queryClient.setQueryData(['statuses', 'bookmarks'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page, i) => i === 0 ? [newStatus, ...page] : page)
        };
      });
    }
  });

  const unbookmark = useMutation({
    mutationFn: (id) => api.post(`/api/v1/statuses/${id}/unbookmark`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['statuses', id] });
      const previousStatus = queryClient.getQueryData(['statuses', id]);

      updateCache(id, false); // Optimistic false

      // Optimistically remove from bookmarks list
      queryClient.setQueryData(['statuses', 'bookmarks'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(page => page.filter(item => item.id !== id))
        };
      });

      return { previousStatus };
    },
    onError: (err, id, context) => {
      updateCache(id, context.previousStatus?.bookmarked);
      queryClient.invalidateQueries({ queryKey: ['statuses', 'bookmarks'] });
    }
  });

  return {
    bookmark: bookmark.mutate,
    unbookmark: unbookmark.mutate,
    isSubmitting: bookmark.isPending || unbookmark.isPending
  };
}

/*
Why this is a major upgrade:

    Replaces "Transactions": Instead of the complex transaction logic in Soapbox, we use setQueriesData with a Partial Query Key (like ['timeline']). This finds every active feed (Home, Group, Public) and updates the post's bookmark status in one go.
    Instant UI: The onMutate block handles the bookmarkEffect and unbookmarkEffect logic, ensuring the user sees the filled-in star icon the millisecond they click.
    Automatic Rollback: If the API call fails, the onError block uses the snapshot to revert the icon and the list to their original state.
    No useDismissEntity: We manually filter the bookmarks query cache during unbookmark, which is cleaner than the Redux dismiss logic.

Comparison

    Soapbox: Manual Redux "transaction" → API → importEntities or dismissEntity.
    TanStack: onMutate (UI update) → API → onSuccess (Cache sync).

Ready to see how we handle Notifications now? It uses this same "Optimistic" pattern to clear unread counts across the app. TanStack Query's Mutation Guide is a great resource for mastering these patterns.
*?
