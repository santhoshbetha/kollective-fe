// src/features/posts/utils/cacheSync.js
//Cross-Timeline Sync
export const syncPostInCache = (queryClient, postId, patch) => {
  // Update the Detail View cache
  queryClient.setQueryData([posts', 'detail', postId], (old) => 
    old ? { ...old, ...patch } : old
  );

  // Update all Timelines (Home, Public, Lists, etc.)
  queryClient.setQueriesData({ queryKey: [posts', 'timeline'] }, (old) => {
    if (!old || !old.pages) return old;
    return {
      ...old,
      pages: old.pages.map(page => ({
        ...page,
        items: page.items.map(post => 
          post.id === postId ? { ...post, ...patch } : post
        )
      }))
    };
  });
};
