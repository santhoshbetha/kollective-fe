// src/features/statuses/utils/cacheSync.js
//Cross-Timeline Sync
export const syncStatusInCache = (queryClient, statusId, patch) => {
  // Update the Detail View cache
  queryClient.setQueryData(['statuses', 'detail', statusId], (old) => 
    old ? { ...old, ...patch } : old
  );

  // Update all Timelines (Home, Public, Lists, etc.)
  queryClient.setQueriesData({ queryKey: ['statuses', 'timeline'] }, (old) => {
    if (!old || !old.pages) return old;
    return {
      ...old,
      pages: old.pages.map(page => ({
        ...page,
        items: page.items.map(status => 
          status.id === statusId ? { ...status, ...patch } : status
        )
      }))
    };
  });
};
