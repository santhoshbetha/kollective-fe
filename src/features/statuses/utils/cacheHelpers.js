

//Here is the
//updatePostInPages helper. Just like the delete version, this is designed to traverse the
//nested pages of an Infinite Query and update a specific post without forcing a full refetch.
/**
 * Updates a specific status within the Infinite Query pages structure.
 * @param {Object} oldData - The current cache (contains pages and pageParams)
 * @param {string} statusId - The ID of the status to update
 * @param {Object} newFields - The fields to merge/update (e.g. { favourited: true })
 */
export const updatePostInPages = (oldData, statusId, newFields) => {
  if (!oldData || !oldData.pages) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      // Map through the statuses in each page
      items: page.items.map((status) =>
        status.id === statusId ? { ...status, ...newFields } : status
      ),
    })),
  };
};

export const deletePostInPages = (oldData, postId) => {
    if (!oldData) return oldData;
    return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
        ...page,
        tweets: page.tweets.filter((tweet) => tweet.id !== postId),
        })),
    };
};


//Here is theadjustReplyCount helper. Since TanStack Query uses a nested pages structure for infinite scrolling, 
//you need this specific logic to find the parent post and increment/decrement its count without losing other data.
/**
 * Helper to adjust the reply count of a parent status in an infinite query cache.
 * @param {Object} oldData - The current infinite query cache object.
 * @param {string} parentId - The ID of the parent post to update.
 * @param {number} adjustment - The amount to add (1) or subtract (-1).
 */
export const adjustReplyCount = (oldData, parentId, adjustment) => {
  if (!oldData || !oldData.pages) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      // Map through items in each page
      items: page.items.map((status) => {
        if (status.id === parentId) {
          return {
            ...status,
            replies_count: Math.max(0, (status.replies_count || 0) + adjustment),
          };
        }
        return status;
      }),
    })),
  };
};




/*
Why use setQueriesData (plural) vs setQueryData (singular)?

    setQueryData: Only updates one specific list (e.g., just the Home feed).
    setQueriesData: Searches the entire cache for any list that contains statuses
    (Home, Profile, Notifications) and runs the deletePostInPages helper on all of them simultaneously.
     This is the TanStack Query approach to global state.

    Summary of the flow:

    User clicks Delete.
    onMutate fires: It uses deletePostInPages to strip the post from the cache.
    UI Updates: React sees the cache change and removes the post from the screen instantly.
    Network Request: The actual API call happens in the background.

*/
