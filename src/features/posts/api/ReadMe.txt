Do you want to see how to integrate WebSockets (Pusher/Socket.io) so that when someone else likes a post, it updates your UI 
automatically using this same helper?

To handle real-time updates like
Mastodon's Streaming API or WebSockets, you can reuse the same helper logic. 
Instead of a mutation triggering the update, the Socket listener triggers it.
1. The Global WebSocket Listener
In a social app, you typically want a single listener that stays active. 
When an event (like STATUS_UPDATE or POST_LIKED) arrives, you push that change 
directly into the TanStack Query cache.

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socket } from './socket-config'; // Your Socket.io/Pusher instance

export const useSocialWebsockets = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Listen for real-time "Like" updates from other users
    socket.on('post_updated', (updatedPost) => {
      // Logic: Update EVERY list that contains this post
      queryClient.setQueriesData({ queryKey: ['posts'] }, (oldData) => 
        updatePostInPages(oldData, updatedPost.id, updatedPost)
      );
    });

    // Listen for new posts (for the "New Tweets Available" toast)
    socket.on('new_post', (newPost) => {
      // You can either prepend to the cache or just show a notification
      console.log("New content available!");
    });

    return () => socket.off('post_updated');
  }, [queryClient]);
};

======================================================================
2. Prepending New Posts (The "New Tweet" behavior)
When a user (or the server) sends a brand-new post, you want it to appear at the very top of the feed without a full page reload.

const prependNewPost = (oldData, newPost) => {
  if (!oldData) return oldData;
  return {
    ...oldData,
    pages: [
      {
        ...oldData.pages[0],
        // Add new post to the beginning of the first page
        tweets: [newPost, ...oldData.pages[0].tweets],
      },
      ...oldData.pages.slice(1),
    ],
  };
};

// Usage in Socket listener
queryClient.setQueryData(['posts', 'home'], (old) => prependNewPost(old, newPost));

=============================================================================
3. Efficiency Tip: invalidateQueries vs setQueryData

    Use setQueryData (Direct Update): For "Likes", "Deletes", or "Edits". It’s instant and doesn't hit the API again.
    Use invalidateQueries (Refetch): For complex events like "Account Suspended" 
    or "Privacy Setting Changed" where multiple related data points might have 
    changed in ways that are hard to predict manually.
=================================================================================

1. User Created: Optimistic Prepending
When the current user clicks "Post," you don't wait for the server. You manually 
update the ['posts', 'home'] cache immediately using queryClient.setQueryData.

const mutation = useMutation({
  mutationFn: (newPostText) => axios.post('/api/posts', { text: newPostText }),
  
  onMutate: async (newPostText) => {
    // 1. Cancel outgoing fetches
    await queryClient.cancelQueries({ queryKey: ['posts', 'home'] });

    // 2. Snapshot current state
    const previousPosts = queryClient.getQueryData(['posts', 'home']);

    // 3. Create a "fake" optimistic post
    const optimisticPost = { id: Date.now(), text: newPostText, user: currentUser, isOptimistic: true };

    // 4. Prepend to the top of the cache
    queryClient.setQueryData(['posts', 'home'], (old) => ({
      ...old,
      pages: [
        { ...old.pages[0], tweets: [optimisticPost, ...old.pages[0].tweets] },
        ...old.pages.slice(1),
      ],
    }));

    return { previousPosts };
  },
  // If server fails, roll back to previousPosts in onError...
});

2. WebSocket Created: The "Toast" Pattern
For posts created by others, you usually don't want to prepend them automatically because it
 "jumps" the user's scroll position. Instead, you capture the data and show a "Show New Posts" button.
 // Inside your WebSocket listener
socket.on('new_post', (newPost) => {
  // Option A: Just invalidate (User sees a "Refresh" state)
  queryClient.invalidateQueries({ queryKey: ['posts', 'home'] });

  // Option B: Add to a separate "unread" state in Zustand
  useUnreadStore.getState().addPost(newPost);
});

==============================================================================
When a post is streamed via
WebSockets, you treat the incoming data as a "manual cache update." In a Redux-based app like Soapbox,
 you would dispatch an action to a reducer; in TanStack Query, you push that data directly into the pages array of your Infinite Query Cache.
1. The Streaming Logic
You use the queryClient.setQueryData method inside your WebSocket listener. 
This allows you to "inject" the new post into the top of the feed without making a network request.

import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Listen for new posts from the Mastodon/Soapbox stream
socket.on('update', (newPost) => {
  queryClient.setQueryData(['posts', 'home'], (oldData) => {
    if (!oldData) return oldData;

    return {
      ...oldData,
      pages: oldData.pages.map((page, index) => {
        // Only prepend to the VERY FIRST page (the top of the feed)
        if (index === 0) {
          return {
            ...page,
            tweets: [newPost, ...page.tweets],
          };
        }
        return page;
      }),
    };
  });
});
2. Handling the "Scroll Jump" Issue
In large apps, automatically prepending posts can be annoying because it moves the content 
the user is currently reading. You have two common strategies to solve this:

    Strategy A: The "New Posts" Toast: Instead of updating the main feed immediately, 
    store the new posts in a temporary Zustand store or a separate TanStack cache. 
    Show a "New Posts Available" button. When clicked, then prepend them to the main feed.
    Strategy B: Conditional Prepending: Check if the user is at the top of the page 
    (window.scrollY === 0). If they are, prepend immediately. If not, hold them in a buffer.

3. Managing Memory with maxPages
Unlike Redux, which keeps every post in memory until the app is closed, TanStack Query can "trim"
 the stream. If your user scrolls through 2,000 posts, you don't want the browser to lag.
You can use the maxPages property to automatically discard the oldest pages as new ones are 
streamed in or fetched.
const { data } = useInfiniteQuery({
  queryKey: ['posts', 'home'],
  queryFn: fetchTimeline,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  maxPages: 5, // Only keep the 5 most recent pages in memory
});

Summary: Redux vs. TanStack for Streaming
Task	                 Redux/Soapbox	                          TanStack Query
New Post Arrival	Reducer appends to a flat array.	     setQueryData updates pages.
Old Data	        Stays in state forever (RAM leak).       	Garbage collected automatically.
List Logic	           Manual deduplication logic.	         Key-based caching prevents duplicates.

=====================================================================