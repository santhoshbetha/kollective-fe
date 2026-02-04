
// src/api/statuses.js
// Code from AI // modify as required
export const fetchStatusContext = async (statusId) => {
  // 1. Fetch the main status and the thread context in parallel
  const [statusRes, contextRes] = await Promise.all([
    fetch(`/api/v1/statuses/${statusId}`),
    fetch(`/api/v1/statuses/${statusId}/context`)
  ]);

  if (!statusRes.ok || !contextRes.ok) {
    throw new Error('Failed to fetch conversation thread');
  }

  const status = await statusRes.json();
  const context = await contextRes.json();

  // 2. Create a Map of EVERY status in the thread for O(1) lookup
  const allStatuses = new Map();

  // Add the main post
  allStatuses.set(status.id, status);

  // Add all previous posts (ancestors)
  context.ancestors.forEach(item => allStatuses.set(item.id, item));

  // Add all replies (descendants)
  context.descendants.forEach(item => allStatuses.set(item.id, item));

  // 3. Return the processed context
  return {
    mainStatusId: statusId,
    ancestors: context.ancestors,
    descendants: context.descendants,
    allStatuses, // This is what your useStatus hook uses in initialData!
  };
};

export const fetchConversation = async (statusId) => {
  const response = await fetch(`/api/v1/statuses/${statusId}/context`);
  if (!response.ok) throw new Error('Failed to fetch conversation');
  const data = await response.json();

  const inReplyTos = new Map();
  const replies = new Map();

  [...data.ancestors, ...data.descendants].forEach((status) => {
    if (status.in_reply_to_id) {
      inReplyTos.set(status.id, status.in_reply_to_id);
      const existing = replies.get(status.in_reply_to_id) || [];
      replies.set(status.in_reply_to_id, [...existing, status.id]);
    }
  });

  return { inReplyTos, replies };
};

/*
<Route path="/conversation/:conversationId" element={<ConversationPage />} />

import { useParams } from 'react-router-dom';

export const ConversationPage = () => {
  // Pulls 'conversationId' directly from the URL bar
  const { conversationId } = useParams<{ conversationId: string }>();

  // Now you can use it to fetch the whole thread
  const { data, isLoading } = useConversation(conversationId);

  if (isLoading) return <p>Loading thread...</p>;

  return (
    <section>
      {data.allStatuses.map((status) => (
        <StatusItem 
          key={status.id} 
          id={status.id} 
          conversationId={conversationId} 
        />
      ))}
    </section>
  );
};

Why this is a "Best Practice"

    Deep Linking: Users can copy the URL and send it to friends; the app will know exactly 
    which conversation to load because the state is in the URL.
    Cleaner Props: You only have to pass the conversationId once from the page level.
    Automatic Sync: If the URL changes (e.g., the user clicks a "Next Conversation" link), 
    React Router triggers a re-render, and your useStatus hooks automatically update because the conversationId dependency changed.

*/


/*Alternate way:
 Way to use React Context to avoid passing conversationId as a prop to StatusItem entirely:

 1) //src/context/ConversationContext.tsx
 import { createContext, useContext } from 'react';

const ConversationContext = createContext<string | undefined>(undefined);

// A custom hook to make using the ID easier and safer
export const useConversationId = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error("useConversationId must be used within a ConversationProvider");
  }
  return context;
};

export const ConversationProvider = ConversationContext.Provider;

// 2) /ConversationPage
export const ConversationPage = () => {
  const { conversationId } = useParams(); // Get it once from the URL

  return (
    <ConversationProvider value={conversationId}>
      <div className="thread-container">
        {/* We no longer pass conversationId to StatusItem! *//*}
        {statusIds.map(id => <StatusItem key={id} id={id} />)}
      </div>
    </ConversationProvider>
  );
};

//3) useStatus hook
export const useStatus = (statusId) => {
  const queryClient = useQueryClient();
  const conversationId = useConversationId(); // Grab the ID from Context automatically

  return useQuery({
    queryKey: ['status', statusId, { conversationId }],
    queryFn: () => fetchStatus(statusId),
    initialData: () => {
      const context = queryClient.getQueryData(['status', 'context', conversationId]);
      return context?.allStatuses.get(statusId);
    },
  });
};

4) StatusItem.jsx
// Clean and simple: no conversationId prop needed!
export const StatusItem = ({ id, isHighlighted }: StatusItemProps) => {
  const { data: status, isLoading } = useStatus(id); 

  if (isLoading) return <div className="skeleton" />;
  // ... rest of your rendering logic
};



*/

/*
statusId: This is the unique ID of one specific message. Every post on the platform has its own statusId.
conversationId: This is the ID of the entire thread. In most social APIs (like Mastodon or X),
every message in a thread shares the same conversationId.
Analogy: If a status is a "Page," the conversation is the "Book." If you have the Book ID, 
you can find all the Pages. 
*/

/*
The Context API: .../statuses/${statusId}/context
When you call this specific endpoint, you aren't just asking for one post; you are asking for 
the surrounding family tree of that post. 
What is returned?
The API returns a Context object containing two arrays: 

    ancestors: An array of statuses posted before this one in the same thread (the parents,
     grandparents, etc.).
    descendants: An array of statuses posted after this one (the replies). 

Crucial Note: The Context API typically does not include the status itself—only the messages 
before and after it. This is why your code likely merges them together into a single "Map" for your cache. 
*/

/*
 render this thread as a chronological list using the ancestors and descendants arrays:

 To render a thread chronologically, you simply join the three parts of your data—
ancestors, the main post, and descendants—into a single flat list

The Thread Rendering Component
Here is how you would use the data from fetchStatusContext to build a vertical timeline.

export const ConversationThread = ({ statusId }) => {
  // 1. Fetch the processed context (the "Book")
  const { data: thread, isLoading } = useConversation(statusId);

  if (isLoading) return <div className="loading">Loading conversation...</div>;

  // 2. Combine all parts into one chronological array
  const fullThread = [
    ...thread.ancestors,
    thread.mainStatus, // This is the post the user clicked
    ...thread.descendants
  ];

  return (
    <div className="conversation-container">
      {fullThread.map((status) => (
        <StatusItem 
          key={status.id}
          id={status.id}
          conversationId={statusId}
          // Highlight only the specific post that was originally searched for
          isHighlighted={status.id === statusId} 
        />
      ))}
    </div>
  );
};

Visual Structure of the List

    Ancestors: These appear at the top. The user sees the context that led up to the current post.
    Main Status: Often styled with a border or background (via isHighlighted) to show it is the "anchor" of the page.
    Descendants: These appear at the bottom as replies.

See StatusItem2.jsx for the component that renders each individual status with a vertical line connecting them.

*/

/* FULL THREAD:
To build the
fullThread list properly, you need to combine the ancestors, the mainStatus, and the descendants into a single array.
Since the Mastodon API returns ancestors in order from the "oldest" to "newest," and descendants typically in a flat 
list of replies, joining them is straightforward.

1. The fullThread Logic
You should place this logic inside your useConversation hook or the component that renders the thread.

// This creates the flat, chronological array for your list
const fullThread = [
  ...thread.ancestors, // [Post 1, Post 2...]
  thread.mainStatus,    // The post the user is actually viewing
  ...thread.descendants // [Reply 1, Reply 2...]
];

2. The Implementation in the Thread Component
Here is the full code for the ConversationThread component. It uses the fullThread array to map out the UI.

import { useConversation } from '../hooks/useConversation';
import { StatusItem } from './StatusItem';

export const ConversationThread = ({ statusId }: { statusId: string }) => {
  // 1. Fetch the data (ancestors, mainStatus, descendants)
  const { data: thread, isLoading, isError } = useConversation(statusId);

  if (isLoading) return <div className="skeleton-list">Loading Thread...</div>;
  if (isError || !thread) return <div>Failed to load conversation.</div>;

  // 2. Build the chronological array
  const fullThread = [
    ...thread.ancestors,
    thread.mainStatus,
    ...thread.descendants
  ];

  return (
    <div className="conversation-thread">
      {fullThread.map((status) => (
        <StatusItem
          key={status.id}
          id={status.id}
          conversationId={statusId} // Pass the anchor ID as the context
          isHighlighted={status.id === statusId} // Highlight the main post
        />
      ))}
    </div>
  );
};



*/

/* THREAD GAP:
Sometimes a thread has a missing link (e.g., a deleted post or a post from a server your instance hasn't seen). In your fullThread.map, you can check if status.in_reply_to_id matches the
id of the post above it. If it doesn't, you can render a "Load missing posts" button or a dashed line.

A Thread Gap occurs when a post in your list doesn't logically follow the one above it—for example, if a post is deleted or resides on a remote server that your instance hasn't fetched yet. 
To detect this, you compare each status's in_reply_to_id with the id of the post directly preceding it in your fullThread array. 

1. The Logic
Inside your .map() function, check if the current post is a direct reply to the previous one. If it isn't, render a "Gap" indicator.

{fullThread.map((status, index) => {
  const previousStatus = fullThread[index - 1];
  
  // Check if this post is a reply to the one above it
  // We ignore index 0 because it's the start of our list
  const isGap = index > 0 && status.in_reply_to_id !== previousStatus.id;

  return (
    <React.Fragment key={status.id}>
      {isGap && (
        <div className="thread-gap">
          <span>Missing posts or remote replies...</span>
          {/* Optional: Add a button to try fetching the specific parent *//*}
          <button onClick={() => handleFetchGap(status.in_reply_to_id)}>
            Load Context
          </button>
        </div>
      )}
      <StatusItem 
        id={status.id} 
        conversationId={statusId} 
        isHighlighted={status.id === statusId} 
      />
    </React.Fragment>
  );
})}

2. Why Gaps Happen in Mastodon

    Federation Delays: Your server might not have received a reply posted on a different instance yet.
    Privacy Settings: Followers-only or private mentions are hidden unless you have permission to see them.
    Deleted Content: If the middle of a thread is deleted, the reply chain breaks. 

3. Styling the Gap Indicator

//.thread-gap {
//  padding: 8px 16px;
//  margin-left: 32px; /* Align with your thread lines *//*}
//  border-left: 2px dashed #ccd6dd;
//  color: #657786;
//  font-size: 0.9rem;
//}

4. Resolving the Gap:
When a user clicks "Load Context," you can trigger a new fetchStatusContext for that 
specific status.in_reply_to_id. This effectively "backfills" the missing branch of the conversation. 
*/

/*

The
handleFetchGap function resolves a "thread gap" by fetching the missing parent's context and merging those newly discovered posts into your existing conversation cache.
In TanStack Query, this is done using queryClient.setQueryData to manually update the statusContext Map so the UI refreshes instantly without reloading the entire page.

import { useQueryClient } from '@tanstack/react-query';
import { fetchStatusContext } from '../api/statuses';

export const useThreadActions = (conversationId) => {
  const queryClient = useQueryClient();

  const handleFetchGap = async (missingStatusId) => {
    try {
      // 1. Fetch the context for the "missing" parent post
      // This returns { ancestors, descendants, allStatuses (Map) }
      const newContext = await fetchStatusContext(missingStatusId);

      // 2. Update the existing conversation cache
      queryClient.setQueryData(['status', 'context', conversationId], (oldData) => {
        if (!oldData) return oldData;

        // Create a new Map to ensure React detects the change
        const updatedMap = new Map(oldData.allStatuses);

        // Merge all newly found statuses into the master Map
        newContext.allStatuses.forEach((status, id) => {
          updatedMap.set(id, status);
        });

        // Return the updated context with the expanded Map
        return {
          ...oldData,
          allStatuses: updatedMap,
          // You could also merge the arrays (ancestors/descendants) if needed for rendering
        };
      });
    } catch (error) {
      console.error("Could not bridge thread gap:", error);
    }
  };

  return { handleFetchGap };
};

Why this works

    Cache Merging: By adding the new posts to the allStatuses Map, any StatusItem that was previously 
    "missing" its data will suddenly find it in the cache and render immediately.
    O(1) Lookup: Since your Map-based cache uses IDs as keys, adding hundreds of replies doesn't 
    slow down the lookup speed for individual items.
    Automatic UI Update: React Query's setQueryData notifies all subscribers that the data has changed, 
    triggering a re-render of your ConversationThread component. 

  const { handleFetchGap } = useThreadActions(conversationId);

// Inside your .map() gap detector
{isGap && (
  <button onClick={() => handleFetchGap(status.in_reply_to_id)}>
    Show missing posts
  </button>
)}

*/

/*loading indicator
o add a loading indicator to the "Thread Gap" button, you should track the loading state for that specific gap using a piece of
React state. This prevents all gap buttons from showing a spinner at the same time if you have multiple gaps.

1. Update the Hook
Add a simple state to track which missingStatusId is currently being fetched.

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchStatusContext } from '../api/statuses';

export const useThreadActions = (conversationId: string) => {
  const queryClient = useQueryClient();
  // Track which ID is currently loading
  const [loadingGapId, setLoadingGapId] = useState<string | null>(null);

  const handleFetchGap = async (missingStatusId: string) => {
    setLoadingGapId(missingStatusId); // Start loading
    try {
      const newContext = await fetchStatusContext(missingStatusId);
      
      queryClient.setQueryData(['status', 'context', conversationId], (oldData: any) => {
        if (!oldData) return oldData;
        const updatedMap = new Map(oldData.allStatuses);
        newContext.allStatuses.forEach((status: any, id: string) => {
          updatedMap.set(id, status);
        });
        return { ...oldData, allStatuses: updatedMap };
      });
    } catch (error) {
      console.error("Could not bridge thread gap:", error);
    } finally {
      setLoadingGapId(null); // Stop loading
    }
  };

  return { handleFetchGap, loadingGapId };
};

2. Update the UI
In your render loop, check if the loadingGapId matches the current gap's ID. You can use a 
library like Lucide React for a professional spinner. 

import { Loader2 } from "lucide-react"; // Common icon choice

// Inside your .map() gap detector
{isGap && (
  <div className="thread-gap">
    <button 
      onClick={() => handleFetchGap(status.in_reply_to_id)}
      disabled={loadingGapId === status.in_reply_to_id} // Disable while fetching
      className="gap-button"
    >
      {loadingGapId === status.in_reply_to_id ? (
        <>
          <Loader2 className="animate-spin" size={16} /> 
          Loading...
        </>
      ) : (
        "Show missing posts"
      )}
    </button>
  </div>
)}

3. Add the Animation CSS 
If you aren't using Tailwind CSS, add this simple animation to your stylesheet to make the icon spin

.animate-spin {
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.gap-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

Key Improvements

    Disabled State: The button becomes unclickable while loading to prevent duplicate API requests.
    Visual Feedback: The user sees exactly which part of the thread is updating.
    Isolated State: Using loadingGapId ensures that clicking "Load" on one gap doesn't show a spinner on a different gap elsewhere in the thread. 

*/

/*
To implement
automatic gap fetching, you can use the Intersection Observer API. Instead of waiting for a user to 
click a button, the app will automatically trigger handleFetchGap as soon as the "Gap" component 
scrolls into view. 

1. Create a "Gap Detector" Component
Wrap your gap logic into a small component that uses a useEffect and a ref to watch for its own visibility.

import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

const AutomaticThreadGap = ({ parentId, onFetch, isLoading }: any) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Trigger fetch only if the gap is visible and not already loading
        if (entries[0].isIntersecting && !isLoading) {
          onFetch(parentId);
        }
      },
      { threshold: 0.1 } // Fires when 10% of the gap is visible
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect(); // Cleanup
  }, [parentId, onFetch, isLoading]);

  return (
    <div ref={sentinelRef} className="thread-gap automatic">
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={16} />
          <span>Bridging thread...</span>
        </div>
      ) : (
        <span>Loading older replies...</span>
      )}
    </div>
  );
};

2. Update your fullThread Mapping
Replace the manual button with this new automatic component.

{fullThread.map((status, index) => {
  const previousStatus = fullThread[index - 1];
  const isGap = index > 0 && status.in_reply_to_id !== previousStatus.id;

  return (
    <React.Fragment key={status.id}>
      {isGap && (
        <AutomaticThreadGap 
          parentId={status.in_reply_to_id}
          onFetch={handleFetchGap}
          isLoading={loadingGapId === status.in_reply_to_id}
        />
      )}
      <StatusItem id={status.id} conversationId={conversationId} />
    </React.Fragment>
  );
})}

Why this is effective:

    Performance: The Intersection Observer is highly performant because it doesn't run on every scroll event; the browser notifies your code only when the intersection occurs.
    Buttery Smooth UX: Users don't have to stop and click; the conversation "fills itself in" as they read down the page.
    Rate Limiting: By checking the isLoading flag, you ensure the app doesn't send 20 requests if the user scrolls past multiple gaps quickly. 

Note: To prevent your API from being overwhelmed, you can add a small delay or a "limit" to how many gaps can be fetched automatically per session.


*/

/* number of automatic fetches:
To limit automatic fetching and protect your API quotas, you can implement a
counter that tracks how many times the thread has been auto-bridged in a single session

1. Update the Hook with a Limit 
Add a state variable to track the number of automatic fetches. Once the autoFetchCount
 reaches your defined LIMIT, the logic will stop triggering automatically. 

import { useState, useCallback } from 'react';

const AUTO_FETCH_LIMIT = 3; // Stop after 3 automatic bridges

export const useThreadActions = (conversationId: string) => {
  const queryClient = useQueryClient();
  const [loadingGapId, setLoadingGapId] = useState<string | null>(null);
  const [autoFetchCount, setAutoFetchCount] = useState(0);

  const handleFetchGap = useCallback(async (missingStatusId: string, isAutomatic = false) => {
    // If it's an auto-fetch and we are over the limit, do nothing
    if (isAutomatic && autoFetchCount >= AUTO_FETCH_LIMIT) return;

    setLoadingGapId(missingStatusId);
    try {
      const newContext = await fetchStatusContext(missingStatusId);
      
      queryClient.setQueryData(['status', 'context', conversationId], (oldData: any) => {
        if (!oldData) return oldData;
        const updatedMap = new Map(oldData.allStatuses);
        newContext.allStatuses.forEach((status: any, id: string) => {
          updatedMap.set(id, status);
        });
        return { ...oldData, allStatuses: updatedMap };
      });

      // Increment count if it was an automatic fetch
      if (isAutomatic) {
        setAutoFetchCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Gap fetch failed:", error);
    } finally {
      setLoadingGapId(null);
    }
  }, [conversationId, autoFetchCount, queryClient]);

  return { 
    handleFetchGap, 
    loadingGapId, 
    isOverLimit: autoFetchCount >= AUTO_FETCH_LIMIT 
  };
};

2. Update the Gap Component
Pass the isOverLimit flag to the gap detector. If the limit is reached, 
it will display a manual "Click to load" button instead of triggering the Intersection Observer.

const AutomaticThreadGap = ({ parentId, onFetch, isLoading, isOverLimit }: any) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only set up observer if we are still under the auto-limit
    if (isOverLimit || isLoading) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        onFetch(parentId, true); // Pass 'true' to signal automatic fetch
      }
    }, { threshold: 0.1 });

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [parentId, onFetch, isLoading, isOverLimit]);

  return (
    <div ref={sentinelRef} className="thread-gap">
      {isLoading ? (
        <span><Loader2 className="animate-spin" /> Bridging...</span>
      ) : isOverLimit ? (
        // Show manual button once the limit is reached
        <button onClick={() => onFetch(parentId, false)} className="manual-load">
          Many missing posts. Click to continue loading.
        </button>
      ) : (
        <span>Loading context...</span>
      )}
    </div>
  );
};

Why this is a "Best Practice":

    API Protection: Prevents a "infinite loop" of fetches if a thread is thousands of posts long. 
    Rate limiting client-side calls ensures consistent performance and avoids 429 (Too Many Requests) errors.
    User Control: It respects the user's data and battery life by not downloading massive amounts 
    of data without explicit permission after the initial "easy reading" phase. 

*/

/*
To efficiently group multiple gap-filling requests into a single batch, you can use a
Buffer and Delay pattern. Instead of firing an API call immediately when a gap is seen, the app waits for a few milliseconds to collect all visible gap IDs and then fetches them all at once using Promise.all

1. The Batched Hook
This hook collects multiple missingStatusId calls into a single queue and processes them together.

import { useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchStatusContext } from '../api/statuses';

export const useBatchedThreadActions = (conversationId: string) => {
  const queryClient = useQueryClient();
  const [loadingGapId, setLoadingGapId] = useState<string | null>(null);
  
  // Use a Ref to hold the IDs we want to fetch in the next tick
  const queueRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const processBatch = useCallback(async () => {
    const idsToFetch = Array.from(queueRef.current);
    queueRef.current.clear(); // Clear the queue immediately
    
    try {
      // Fetch all gap contexts in parallel
      const results = await Promise.all(
        idsToFetch.map(id => fetchStatusContext(id))
      );

      // Single cache update for all results to minimize re-renders
      queryClient.setQueryData(['status', 'context', conversationId], (oldData: any) => {
        if (!oldData) return oldData;
        const updatedMap = new Map(oldData.allStatuses);
        
        results.forEach(context => {
          context.allStatuses.forEach((status: any, id: string) => {
            updatedMap.set(id, status);
          });
        });

        return { ...oldData, allStatuses: updatedMap };
      });
    } finally {
      setLoadingGapId(null);
    }
  }, [conversationId, queryClient]);

  const handleFetchGap = useCallback((id: string) => {
    queueRef.current.add(id);
    setLoadingGapId(id);

    // Debounce the fetch by 50ms to collect visible gaps
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(processBatch, 50);
  }, [processBatch]);

  return { handleFetchGap, loadingGapId };
};

2. Benefits of Batching

    Reduced Network Overhead: By using Promise.all, you execute multiple requests concurrently. If your backend supports Bulk API calls, you could even combine these into a single HTTP request.
    Minimized UI Re-renders: Instead of updating the React Query cache five times (triggering five re-renders), the code updates the cache once with all newly found statuses.
    Smart De-duplication: The Set in queueRef ensures that if multiple components try to fetch the same gap, it's only requested once. 
3. Implementation with Dataloader (Pro-Level)
For even more robust batching, many developers use the DataLoader library. It is specifically designed to "collapse" multiple individual requests that occur within a single tick of the event loop into a single batch call. 
Key Takeaway: Batching prevents the "waterfall" effect where each gap loads one after another. Instead, the whole thread "pops" into place simultaneously.




*/

/*automatic retry logic:
o implement automatic retry logic, you can use a
Recursive Backoff pattern. This ensures that if the fetch fails due to a "hiccup" (like a brief Wi-Fi drop), the app waits a few seconds and tries again without bothering the user.

1. The Retry Logic (API Level)
First, update your fetchStatusContext or create a wrapper that includes a retry counter. We use Exponential Backoff, which doubles the wait time after each failure (e.g., 1s, then 2s, then 4s) to avoid overwhelming the server.


// A reusable fetch wrapper with exponential backoff
export const fetchWithRetry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    // Only retry if we haven't hit the limit
    if (retries <= 0) throw error;

    // Wait for the delay (e.g., 1000ms, 2000ms, 4000ms)
    await new Promise(resolve => setTimeout(resolve, delay));

    // Try again with one fewer retry and double the delay
    return fetchWithRetry(fn, retries - 1, delay * 2);
  }
};

2. Integration with Batching
In your useBatchedThreadActions hook, wrap the batch fetch call in this retry function. This makes your entire "Gap Filling" logic resilient to network blips.

const processBatch = useCallback(async () => {
  const idsToFetch = Array.from(queueRef.current);
  queueRef.current.clear();
  
  try {
    // 1. Wrap the batch in fetchWithRetry
    const results = await fetchWithRetry(() => 
      Promise.all(idsToFetch.map(id => fetchStatusContext(id))),
      3, // Max 3 retries
      1000 // Initial 1s delay
    );

    // 2. Update the cache as usual
    queryClient.setQueryData(['status', 'context', conversationId], (oldData: any) => {
      if (!oldData) return oldData;
      const updatedMap = new Map(oldData.allStatuses);
      results.forEach(context => {
        context.allStatuses.forEach((status: any, id: string) => {
          updatedMap.set(id, status);
        });
      });
      return { ...oldData, allStatuses: updatedMap };
    });
  } catch (finalError) {
    // 3. If all retries fail, show a "final" error toast
    toast.error("Could not load thread history. Please check your connection.");
  } finally {
    setLoadingGapId(null);
  }
}, [conversationId, queryClient]);


Exponential Backoff: Doubling the delay between attempts (delay * 2) gives the network time to stabilize.
Retry Limit: Capping at 3 attempts prevents the app from looping forever if the server is actually down.
Fail Fast on Success: The try/catch ensures that as soon as a request succeeds, it returns the data immediately—no unnecessary waiting. 

To be even more "polite" to your server, you can add Jitter—a small random amount of time added to the delay (e.g., delay * 2 + Math.random() * 100). This prevents thousands of clients 
from retrying at the exact same second, which can cause a "retry storm" that crashes the server again.


*/

/*
"Jump to Top" logic so users can quickly return to the anchor post after scrolling deep into the history
To implement a "Jump to Anchor" button, you can use a
React Ref to track the main post and the scrollIntoView API to navigate smoothly back to it.

1. Set up the Ref in ConversationThread
Create a reference that you will attach specifically to the post you want as your "anchor."

import { useRef } from 'react';

export const ConversationThread = ({ statusId }: { statusId: string }) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const { data: thread, isLoading } = useConversation(statusId);

  // Function to jump back to the anchor
  const scrollToAnchor = () => {
    anchorRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' // Centers the post in the viewport
    });
  };

  if (isLoading) return <div>Loading...</div>;

  const fullThread = [...thread.ancestors, thread.mainStatus, ...thread.descendants];

  return (
    <div className="relative">
      {/* Floating Jump Button *//*}
      <button 
        onClick={scrollToAnchor}
        className="fixed bottom-4 right-4 z-50 p-2 bg-blue-500 text-white rounded-full shadow-lg"
      >
        Jump to Post
      </button>

      {fullThread.map((status) => (
        <div 
          key={status.id} 
          // Attach the ref ONLY if this is the target statusId
          ref={status.id === statusId ? anchorRef : null}
        >
          <StatusItem 
            id={status.id} 
            conversationId={statusId} 
            isHighlighted={status.id === statusId} 
          />
        </div>
      ))}
    </div>
  );
};

 2.Why use scrollIntoView?

    Precision: Unlike window.scrollTo(0, 0), which only goes to the very top of the page, element.scrollIntoView() finds a specific DOM element wherever it is (even if it's in the middle of a massive thread) and brings it into focus.
    Native Smoothness: The behavior: 'smooth' option uses the browser's native animation engine for a polished feel without extra libraries. 


3. Visibility Logic (Optional)
To keep the UI clean, you can use a scroll listener to only show the "Jump" button when the anchor is not visible.


const [showButton, setShowButton] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    // Show button if the anchor post is off-screen
    setShowButton(rect.top < 0 || rect.bottom > window.innerHeight);
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

Summary of Benefits:

    Navigation: Instantly helps users find the "anchor" post after they've scrolled deep into historical ancestors or long reply chains.
    Accessibility: Provides a clear way for users with mobility issues to return to the primary content.

These resources explain the purpose and placement of "Back to Top" buttons for enhanced website navigation
1) These resources explain the purpose and placement of "Back to Top" buttons for enhanced website navigation
2) https://www.nngroup.com/articles/back-to-top/ 
*/

/*Would you like to see how to add keyboard shortcuts
 (like pressing 'T') to trigger this "Jump to Anchor" action

 To make your conversation view feel like a pro power-user tool, you can bind the "Jump" action to a keyboard key (like
"T" for Top or "A" for Anchor).
We use a useEffect to listen for global keydown events.
1. The Implementation
Add this logic inside your ConversationThread component. It checks if the user is currently typing in an input field (to avoid jumping while they are writing a reply!) before triggering the scroll.

useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    // 1. Ignore if the user is typing in a textarea or input
    const isTyping = ['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName);
    if (isTyping) return;

    // 2. Trigger the jump on the 't' or 'a' key
    if (event.key.toLowerCase() === 't' || event.key.toLowerCase() === 'a') {
      event.preventDefault();
      scrollToAnchor(); // The function we created in the previous step
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [scrollToAnchor]);

2. Best Practices for Shortcuts

    Prevent Default: Calling event.preventDefault() is important for some keys to stop the browser's default behavior (like spacebar scrolling the page).
    Accessibility: Always provide a visual hint for power users. You can add a tooltip to your "Jump" button that says (Press 'T' to jump).
    Cleanup: Removing the listener in the return block of useEffect is vital to prevent memory leaks or "ghost" jumps when the user navigates to a different page.

3. Expanding the System
You can easily add more shortcuts to this listener:

    'R': Open the reply box for the highlighted post.
    'L': Toggle the "Like" status.
    'J' / 'K': Move the highlight to the next/previous post in the thread (Vim-style navigation).


*/

/*'J' and 'K' navigation to move the highlight up and down the thread?
To implement
Vim-style J/K navigation, we track a selectedIndex in our list and update it whenever the user presses those keys. We then use a useEffect to ensure the newly selected post scrolls into view.

1. Track the Selection State
In your ConversationThread component, manage an index that points to the currently "active" post in the fullThread array.

const [selectedIndex, setSelectedIndex] = useState<number>(0);

// Initialize selectedIndex to the anchor post when data loads
useEffect(() => {
  if (thread) {
    const anchorIndex = fullThread.findIndex(s => s.id === statusId);
    setSelectedIndex(anchorIndex !== -1 ? anchorIndex : 0);
  }
}, [thread, statusId]);


2. The Keyboard Listener
Add the logic to increment or decrement the index, staying within the bounds of the array.

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const isTyping = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName);
    if (isTyping) return;

    if (e.key.toLowerCase() === 'j') {
      // Move Down
      setSelectedIndex(prev => Math.min(prev + 1, fullThread.length - 1));
    } else if (e.key.toLowerCase() === 'k') {
      // Move Up
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [fullThread.length]);

3. Update the Rendering Logic
Pass the "active" state to each StatusItem and use a Dynamic Ref to handle the scrolling.


return (
  <div className="thread-list">
    {fullThread.map((status, index) => (
      <StatusItem
        key={status.id}
        id={status.id}
        isActive={index === selectedIndex} // New prop for visual focus
        conversationId={statusId}
      />
    ))}
  </div>
);

4. Component-Level Scroll
Inside your StatusItem, use a useEffect to scroll the post into view whenever it becomes active.

const itemRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (isActive) {
    itemRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest', // 'nearest' prevents jarring jumps
    });
  }
}, [isActive]);

Why this is a "Power User" Feature

    Speed: Users can blaze through a long conversation without touching their mouse.
    Accessibility: Provides an excellent Keyboard Navigation experience, which is a core requirement of the Web Content Accessibility Guidelines (WCAG).
    Focus: By using block: 'nearest', the browser only scrolls if the item is actually out of view, keeping the experience smooth.


*/
/*
Would you like to see how to trigger the Reply Modal automatically when a user presses 'R' on a selected post
To trigger a reply modal with the
'R' key, you need to link your keyboard listener to the state that controls your modal. This makes the app feel like a desktop application where you can navigate and respond without leaving the keyboard.
1. Define the Reply State
In your ConversationThread component, track which status is currently being replied to.

const [replyingToStatus, setReplyingToStatus] = useState<Status | null>(null);

// Function to open the modal for the currently selected item
const handleOpenReply = () => {
  const currentStatus = fullThread[selectedIndex];
  if (currentStatus) {
    setReplyingToStatus(currentStatus);
  }
};

2. Add 'R' to your Keyboard Listener
Update your existing useEffect to listen for the 'R' key.

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // IMPORTANT: Don't trigger shortcuts if the user is already typing!
    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) || 
                     (e.target as HTMLElement).isContentEditable;
    if (isTyping) return;

    if (e.key.toLowerCase() === 'j') {
      setSelectedIndex(prev => Math.min(prev + 1, fullThread.length - 1));
    } else if (e.key.toLowerCase() === 'k') {
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key.toLowerCase() === 'r') {
      e.preventDefault(); // Prevent 'r' from being typed into the field if it auto-focuses
      handleOpenReply();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [fullThread, selectedIndex]);

3. Render the Reply Modal
When replyingToStatus is not null, show your modal. Ensure the textarea inside the modal has an autoFocus attribute so the user can start typing immediately.

return (
  <div className="thread-container">
    {fullThread.map((status, index) => (
      <StatusItem 
        key={status.id} 
        status={status} 
        isActive={index === selectedIndex} 
      />
    ))}

    {/* The Reply Modal *//*}
    {replyingToStatus && (
      <ReplyModal 
        status={replyingToStatus} 
        onClose={() => setReplyingToStatus(null)} 
      />
    )}
  </div>
);

4. Pro Tip: The "Focus Trap"
When the modal opens, you should use a library like Radix UI Dialog or React Focus Lock to ensure that the keyboard focus stays inside the modal. This prevents the 'J' and 'K' keys from moving the list in the background while the user is trying to type their reply.
Why this flow works:

    Select: Use J/K to find the post you want to answer.
    Trigger: Press R. The modal pops up instantly.
    Type: Because of autoFocus, the cursor is already in the box.
    Submit: You can even bind Cmd+Enter (or Ctrl+Enter) inside the modal to send the reply and close it.




*/

/* implementation of Cmd+Enter shortcut to send the reply and return to the thread?

To implement the Cmd+Enter (or Ctrl+Enter) shortcut, you add a listener inside your ReplyModal. This is the "gold standard" for power-user communication apps because it allows a user to Select (J/K) \(\rightarrow \) Reply (R) \(\rightarrow \) Type \(\rightarrow \) Send (Cmd+Enter) without ever touching their mouse. 

1. The Keydown Handler inside the Modal
In your modal component, you catch the event on the textarea. We check for metaKey (Mac/Cmd) or ctrlKey (Windows/Linux).

const ReplyModal = ({ status, onClose }) => {
  const [text, setText] = useState("");
  const { mutate: sendReply, isPending } = useSendReply(); // Your mutation hook

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Check if Cmd (Mac) or Ctrl (Windows) is held down + Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (text.trim() && !isPending) {
        submitReply();
      }
    }
  };

  const submitReply = () => {
    sendReply({ statusId: status.id, content: text }, {
      onSuccess: () => {
        onClose(); // Close modal on success
        toast.success("Reply sent!");
      }
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Replying to {status.account.display_name}</h3>
        <textarea
          autoFocus  // 👈 Crucial: Put cursor in the box immediately
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown} // 👈 Listen for the shortcut
          placeholder="What's on your mind?"
        />
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={submitReply} disabled={isPending}>
            {isPending ? "Sending..." : "Post (Cmd+Enter)"}
          </button>
        </div>
      </div>
    </div>
  );
};

2. User Experience Details

    Visual Hint: Adding "(Cmd+Enter)" to the button text teaches the user the shortcut UX best practices.
    Prevention: e.preventDefault() prevents the Enter key from adding a new line to the text right before the modal closes.
    Feedback: Using a Loading State on the button ensures the user doesn't accidentally send the same reply twice if the network is slow.

2. User Experience Details

    Visual Hint: Adding "(Cmd+Enter)" to the button text teaches the user the shortcut UX best practices.
    Prevention: e.preventDefault() prevents the Enter key from adding a new line to the text right before the modal closes.
    Feedback: Using a Loading State on the button ensures the user doesn't accidentally send the same reply twice if the network is slow.

3. Final Step: Returning Focus
When the modal closes, focus should return to the original StatusItem so the user can 
continue navigating with J/K. If you use a library like Radix UI or Headless UI, this
 "return focus" behavior is handled automatically.

To implement the Cmd+Enter (or Ctrl+Enter) shortcut for sending a message in a modal, you'll need to add a keyboard event listener to the textarea element within your ReplyModal component. This allows users to quickly send their reply without using the mouse.
Here's how you can set this up:
1. Adding the Keydown Handler
In your ReplyModal component, you'll add an onKeyDown prop to the textarea. This handler will check for the combination of the metaKey (for Cmd on macOS) or ctrlKey (for Ctrl on Windows/Linux) along with the Enter key.

Inside the handleKeyDown function, you prevent the default behavior of the Enter key (which would typically insert a new line). Then, you can call your submitReply function if there is text to send and the reply is not already being sent.

const ReplyModal = ({ status, onClose }) => {
  const [text, setText] = useState("");
  const { mutate: sendReply, isPending } = useSendReply(); // Replace with your actual mutation logic

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Check if Cmd (Mac) or Ctrl (Windows) is held down + Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (text.trim() && !isPending) {
        submitReply();
      }
    }
  };

  const submitReply = () => {
    // Replace with your actual logic to send the reply
    sendReply({ statusId: status.id, content: text }, {
      onSuccess: () => {
        onClose(); // Close modal on success
        alert("Reply sent!"); // Replace with a more sophisticated notification
      }
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Replying to {status.account.display_name}</h3>
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind?"
        />
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={submitReply} disabled={isPending}>
            {isPending ? "Sending..." : "Post (Cmd+Enter)"}
          </button>
        </div>
      </div>
    </div>
  );
};

2. User Experience Considerations

    Visual Hint: Including "(Cmd+Enter)" in the button text is a good way to inform users about the shortcut.
    Preventing Default: e.preventDefault() is essential to stop a new line from being added to the textarea when the shortcut is used.
    Loading State: Disabling the send button while the reply is being sent prevents accidental duplicate submissions.

3. Managing Focus
When the modal closes, it's generally good practice to return focus to the element that triggered the modal. If you are using a UI library like Radix UI or Headless UI for your modal, this focus management is often handled automatically. 
Otherwise, you might need to implement this manually using references or state.


*/

/*updatING  UI with the new reply immediately after sending, 
even before getting a confirmation from the server

To show your new reply immediately, we use an
Optimistic Update inside the useSendReply mutation. Since the API hasn't assigned an ID yet,
 we generate a temporary "UUID" and push the post into our conversation's Map cache.
1. The Optimistic Mutation
This logic lives in your useSendReply hook. It "lies" to the cache by adding your message before the server even receives it.

import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useSendReply = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newReply) => postReply(newReply), // Your API call

    onMutate: async (newReply) => {
      // 1. Cancel outgoing fetches for this thread
      await queryClient.cancelQueries({ queryKey: ['status', 'context', conversationId] });

      // 2. Snapshot current state for rollback
      const previousContext = queryClient.getQueryData(['status', 'context', conversationId]);

      // 3. Create an "Optimistic" status object
      const tempId = `temp-${Date.now()}`;
      const optimisticStatus = {
        id: tempId,
        content: newReply.content,
        account: currentUser, // Your global user state
        created_at: new Date().toISOString(),
        isOptimistic: true, // Tag it for special styling
      };

      // 4. Inject into the Map cache
      queryClient.setQueryData(['status', 'context', conversationId], (old: any) => {
        const updatedMap = new Map(old.allStatuses);
        updatedMap.set(tempId, optimisticStatus);
        
        return {
          ...old,
          allStatuses: updatedMap,
          // Add to descendants list so it shows up at the bottom
          descendants: [...old.descendants, optimisticStatus]
        };
      });

      return { previousContext };
    },

    onError: (err, newReply, context) => {
      // 5. Rollback if the network fails
      queryClient.setQueryData(['status', 'context', conversationId], context?.previousContext);
      toast.error("Failed to send reply.");
    },

    onSettled: () => {
      // 6. Refetch to get the real ID and timestamp from the server
      queryClient.invalidateQueries({ queryKey: ['status', 'context', conversationId] });
    },
  });
};

2. Styling the "Sending" State
Inside your StatusItem, you can use the isOptimistic flag we added to show the post is still "syncing."


/* src/styles/status.css
//.status-item.optimistic {
//  opacity: 0.6;
//  filter: grayscale(50%);
//  border-left: 2px dashed #3b82f6; /* Blue dashed line for "sending" 

3. Benefits of this approach:

    Instant Gratification: The modal closes, and the user sees their post in the thread within milliseconds.
    Context Continuity: The user doesn't lose their place in the conversation waiting for a loading spinner.
    Automatic Cleanup: When the server responds, onSettled triggers a refetch. React Query is smart enough to replace your "Temporary ID" post with the "Real ID" post seamlessly.

Note: To prevent duplication, you must ensure your allStatuses Map logic is stable during the TanStack Query cache update.


*/

/* implementATION of "Delete" or "Undo" functionality for a reply that is
currently in this optimistic state:

To implement
Delete or Undo for an optimistic reply, you provide a "Safety Net" that allows users to cancel a message before it's permanently committed to the server.
1. The "Delete" Mutation
Deleting an item follows the same pattern as creating one: you remove it from the cache instantly and restore it only if the server request fails. 

export const useDeleteStatus = (statusId, conversationId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.deleteStatus(statusId),
    onMutate: async () => {
      // 1. Cancel background fetches
      await queryClient.cancelQueries({ queryKey: ['status', 'context', conversationId] });
      // 2. Snapshot current state
      const previousContext = queryClient.getQueryData(['status', 'context', conversationId]);

      // 3. Optimistically remove from the Map
      queryClient.setQueryData(['status', 'context', conversationId], (old) => {
        const newMap = new Map(old.allStatuses);
        newMap.delete(statusId);
        return { ...old, allStatuses: newMap };
      });

      return { previousContext };
    },
    onError: (err, variables, context) => {
      // 4. Rollback: If delete fails, put the post back
      queryClient.setQueryData(['status', 'context', conversationId], context.previousContext);
      toast.error("Failed to delete post.");
    }
  });
};

2. The "Undo" Pattern
The most user-friendly way to handle mistakes is a Delayed Mutation with a Toast Notification. Instead of sending the reply immediately, you wait for a few seconds. 

    Step 1: Show the reply in the UI instantly using the isOptimistic logic.
    Step 2: Trigger a Toast with an Undo button.
    Step 3: If the user clicks "Undo" within 5 seconds, clear the timer and remove the item from the cache.
    Step 4: If they don't, the timer fires and the mutate() call is sent to the server. 

// In your component
const { mutate: sendReply } = useSendReply(conversationId);
const timerRef = useRef();

const handleReply = (content) => {
  // Show optimism first (custom local state or temporary cache entry)
  showOptimisticPost(content);

  const toastId = toast.success((t) => (
    <span>
      Replied! 
      <button onClick={() => {
        clearTimeout(timerRef.current);
        removeOptimisticPost(); // Revert local state
        toast.dismiss(t.id);
      }}>
        Undo
      </button>
    </span>
  ), { duration: 5000 });

  // Delay the real network call
  timerRef.current = setTimeout(() => {
    sendReply({ content });
  }, 5000);
};

Why this is safer:

    Revert Functions: Every action has a corresponding "restore" state in the onMutate context.
    User Confidence: Seeing an "Undo" button reduces anxiety around accidental posts.
    Consistency: Manual cache updates ensure the UI doesn't "flicker" between the old and new state while waiting for the server. 

*/

/* implemention of "Soft Deletion" where the post just fades out instead of disappearing entirely

"Soft deletion" is a professional touch where the post doesn't just vanish; it visually fades or shrinks to signal that the action is in progress. This prevents the "jumping" effect in long threads when a post disappears suddenly.
1. Update the Mutation State
When you trigger the delete, instead of removing the post from the cache immediately, you update it with a isDeleting flag.

// Inside your useDeleteStatus hook
onMutate: async (statusId) => {
  await queryClient.cancelQueries({ queryKey: ['status', 'context', conversationId] });
  const previousContext = queryClient.getQueryData(['status', 'context', conversationId]);

  // 1. Mark as deleting instead of removing
  queryClient.setQueryData(['status', 'context', conversationId], (old: any) => {
    const updatedMap = new Map(old.allStatuses);
    const item = updatedMap.get(statusId);
    if (item) {
      updatedMap.set(statusId, { ...item, isDeleting: true });
    }
    return { ...old, allStatuses: updatedMap };
  });

  return { previousContext };
}

2. Add the "Fade Out" CSS
Use CSS transitions to handle the visual removal. We use max-height and opacity to make the post collapse smoothly.

/* src/styles/status.css
.status-item {
  transition: all 0.4s ease-in-out;
  max-height: 1000px; /* Large enough to fit content 
  overflow: hidden;
}

.status-item.deleting {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
  pointer-events: none; /* Prevent clicks during the fade 
}

3. Apply to the Component
Link the isDeleting flag to your CSS class.

export const StatusItem = ({ status, ...props }) => {
  // Apply the 'deleting' class if the flag is true
  const statusClasses = `status-item ${status.isDeleting ? 'deleting' : ''}`;

  return (
    <article className={statusClasses}>
       <div className="status-content">
         {/* If deleting, you could show a "Deleting..." overlay or just fade *//*}
         <strong>{status.account.display_name}</strong>
         <div dangerouslySetInnerHTML={{ __html: status.content }} />
       </div>
    </article>
  );
};

4. Why this works better

    Perceived Performance: The UI reacts at 0ms, giving the user instant feedback that their click worked.
    Reduced Layout Shift: By animating the max-height, the posts below the deleted one slide up gracefully rather than teleporting.
    Error Recovery: If the server returns an error, you simply flip isDeleting back to false, and the post "pops" back into view.

Pro-Tip: You can use the Framer Motion library's AnimatePresence for even smoother list reordering and deletions.

*/

/*
implement "Edit Mode" where the status content turns into an input field for quick corrections

To implement
Inline Editing, we swap the rendered HTML content for a <textarea> whenever a user toggles "Edit Mode." This allows for quick corrections without opening a new page or modal.
1. Local State for the Editor
In your StatusItem component, track whether the user is currently editing and store the "draft" text.

export const StatusItem = ({ status, conversationId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(status.content);
  const { mutate: updateStatus, isPending } = useUpdateStatus(status.id, conversationId);

  const handleSave = () => {
    updateStatus({ content: draftContent }, {
      onSuccess: () => setIsEditing(false)
    });
  };

  return (
    <article className={`status-item ${isEditing ? 'editing' : ''}`}>
      {isEditing ? (
        <div className="edit-container">
          <textarea 
            autoFocus
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSave();
              if (e.key === 'Escape') setIsEditing(false);
            }}
          />
          <div className="edit-actions">
            <button onClick={handleSave} disabled={isPending}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div onDoubleClick={() => setIsEditing(true)}>
          <div dangerouslySetInnerHTML={{ __html: status.content }} />
          <button onClick={() => setIsEditing(true)}>Edit</button>
        </div>
      )}
    </article>
  );
};

2. Best Practices for Editing

    Double-Click to Edit: A common power-user shortcut that makes the interface feel highly interactive.
    Escape to Cancel: Always provide a keyboard way to exit without saving Accessibility Standards.
    Draft Preservation: Since we use local state (draftContent), the original content is preserved in the React Query cache if the user cancels.

3. Styling the Editor
Make the textarea feel like it's part of the post by matching font sizes and removing borders until focused.

.edit-container textarea {
  width: 100%;
  min-height: 100px;
  font-family: inherit;
  font-size: inherit;
  padding: 8px;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  resize: vertical;
}

.edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  justify-content: flex-end;
}

4. Integration with Shortcuts
You can link this to your 'E' keyboard shortcut logic we built earlier. When the user selects a post with J/K and presses 'E', simply call setIsEditing(true).

*/

/*how to add a "Last Edited" timestamp badge that only appears if the post has been modified

To show that a post has been modified, you can display a "Last Edited" badge by checking the
edited_at field returned by the Mastodon Status Entity. This field is only populated if the status has been edited at least once. 
1. Updated Component with "Edited" Badge
You can use a library like date-fns or react-timeago to display a human-readable relative time (e.g., "Edited 5 minutes ago"). 

import TimeAgo from 'react-timeago';

export const StatusItem = ({ status }) => {
  return (
    <article className="status-item">
      <header>
        <strong>{status.account.display_name}</strong>
        <div className="meta-info">
          <span>{new Date(status.created_at).toLocaleDateString()}</span>
          
          {/* 1. Only show the badge if edited_at exists *//*}
          {status.edited_at && (
            <span className="edited-badge" title={`Original: ${status.created_at}`}>
              • Edited <TimeAgo date={status.edited_at} />
            </span>
          )}
        </div>
      </header>
      
      <div dangerouslySetInnerHTML={{ __html: status.content }} />
    </article>
  );
};
2. Styling the Badge
A subtle style helps users distinguish between the original post time and the edit time without cluttering the UI.

.edited-badge {
  font-size: 0.85rem;
  color: #657786;
  font-style: italic;
  cursor: help; /* Indicates a tooltip is available 
}

.meta-info {
  display: flex;
  gap: 8px;
  align-items: center;
}

3. Fetching Edit History (Advanced)
If you want users to see what changed, you can use the Mastodon API's /api/v1/statuses/{id}/history endpoint. This returns an array of StatusEdit objects showing previous versions of the content. 

    Logic: Only show an "Edit History" button if status.edited_at is present.
    Data: The history includes the content and created_at for every revision. 


These technical references cover the Mastodon "StatusEdit" entity and the API endpoint for fetching status edit history

1)https://docs.joinmastodon.org/entities/StatusEdit/
2)https://mastodonpy.readthedocs.io/en/stable/05_statuses.html



*/

/*"History Modal" that fetches and displays these previous versions when the badge is clicked
To implement a
History Modal, you use the Mastodon API's GET /api/v1/statuses/:id/history endpoint. This returns an array of StatusEdit objects, allowing users to see every version of a post from its initial state to the current one. 
1. The API Fetcher
Create a function in your api/statuses.js to retrieve the version history. 

export const fetchStatusHistory = async (statusId) => {
  const response = await fetch(`/api/v1/statuses/${statusId}/history`);
  if (!response.ok) throw new Error("Failed to fetch edit history");
  return response.json(); // Returns an array of StatusEdit objects
};

2. The custom hook: useStatusHistory
Use React Query to manage the loading state and cache the history data.
export const useStatusHistory = (statusId) => {
  return useQuery({
    queryKey: ['statusHistory', statusId],
    queryFn: () => fetchStatusHistory(statusId),
    enabled: !!statusId, // Only fetch if we have an ID
    staleTime: 1000 * 60 * 60, // History rarely changes, cache for 1 hour
  });
};

3. The History Modal UI
This modal maps through the history array. Since each entry contains the content and created_at for that specific revision, you can show the evolution of the post.

export const StatusHistoryModal = ({ statusId, onClose }) => {
  const { data: history, isLoading } = useStatusHistory(statusId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content history-modal" onClick={e => e.stopPropagation()}>
        <header>
          <h3>Edit History</h3>
          <button onClick={onClose}>&times;</button>
        </header>

        {isLoading ? (
          <div className="spinner">Loading history...</div>
        ) : (
          <ul className="history-list">
            {history.map((revision, index) => (
              <li key={index} className="history-item">
                <div className="revision-meta">
                  <span className="version-label">
                    {index === 0 ? "Current Version" : `Version ${history.length - index}`}
                  </span>
                  <span className="timestamp">
                    {new Date(revision.created_at).toLocaleString()}
                  </span>
                </div>
                <div 
                  className="revision-content"
                  dangerouslySetInnerHTML={{ __html: revision.content }} 
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

4. Integration with StatusItem
Trigger this modal when the user clicks the "Edited" badge we built earlier

const [isHistoryOpen, setIsHistoryOpen] = useState(false);

// Inside your StatusItem render:
{status.edited_at && (
  <span className="edited-badge" onClick={() => setIsHistoryOpen(true)}>
    • Edited
  </span>
)}

{isHistoryOpen && (
  <StatusHistoryModal 
    statusId={status.id} 
    onClose={() => setIsHistoryOpen(false)} 
  />
)}

Key UI details:

    Reverse Chronology: The API typically returns the latest version first.
    Diffing: For a more advanced view, you could use a library like jsdiff to highlight exactly which words were added or removed between versions.
    Accessibility: Ensure the modal can be closed with the Escape key and that the backdrop is clickable.

*/

/*
 add "Restore Version" logic so an admin or owner can roll back the post to a previous state with one click
To implement a
"Restore Version" feature, you effectively take the content from a previous version in the history list and trigger your useUpdateStatus mutation to overwrite the current post.
1. Update the Modal with a Restore Button
Add a button to each historical item. We only show this if the user has permission to edit the post.

export const StatusHistoryModal = ({ status, onClose }) => {
  const { data: history } = useStatusHistory(status.id);
  // Re-use our existing update mutation
  const { mutate: updateStatus, isPending } = useUpdateStatus(status.id, status.conversationId);

  const handleRestore = (historicalContent: string) => {
    if (window.confirm("Are you sure you want to restore this version?")) {
      updateStatus({ content: historicalContent }, {
        onSuccess: () => {
          onClose(); // Close the history view
          toast.success("Post restored to previous version!");
        }
      });
    }
  };

  return (
    <div className="history-list">
      {history?.map((revision, index) => (
        <div key={index} className="history-item">
          <div className="flex justify-between">
            <span className="timestamp">{new Date(revision.created_at).toLocaleString()}</span>
            
            {/* Don't show restore button on the current (index 0) version *//*}
            {index !== 0 && (
              <button 
                onClick={() => handleRestore(revision.content)}
                disabled={isPending}
                className="restore-btn"
              >
                {isPending ? "Restoring..." : "Restore This Version"}
              </button>
            )}
          </div>
          <div dangerouslySetInnerHTML={{ __html: revision.content }} />
        </div>
      ))}
    </div>
  );
};

2. How it works

    Selection: The user browses the Edit History and finds the version they prefer.
    Action: Clicking "Restore" passes the revision.content string into your updateStatus function.
    Cache Sync: Because useUpdateStatus (which we built earlier) already handles updating the TanStack Query cache, the main thread UI will update instantly to show the restored content.

3. Safety Check
Since the Mastodon API returns HTML for status content, the revision.content is already formatted correctly. However, your backend must support Status Editing (available since Mastodon v3.5.0) for the PATCH request to work.

When you restore a post, you might want to add a note like "Restored from backup" to the content so other users understand why the text changed back.


*/

/*
Would you like to see how to implement a "Compare" mode that highlights the differences (diff) between two versions so it's easier to see what changed before restoring?Proactive Follow-up: Would you like to see how to implement a "Compare" mode that 
highlights the differences (diff) between two versions so it's easier to see what changed before restoring?

To implement a
Compare Mode, you can use a diffing library to highlight exactly what changed between two versions. Since Mastodon statuses are stored as HTML, you have two choices: a Side-by-Side Text Diff (standard for code) or an Inline HTML Diff (visual, like "Track Changes").

Option 1: Side-by-Side Text Diff
This is best for clarity. It treats the HTML as plain text and shows additions in green and removals in red using the react-diff-viewer library.

import ReactDiffViewer from 'react-diff-viewer';

const CompareVersions = ({ oldVersion, newVersion }) => (
  <div className="diff-container">
    <ReactDiffViewer 
      oldValue={oldVersion.content} 
      newValue={newVersion.content} 
      splitView={true} // Side-by-side view
      useDarkTheme={true}
      leftTitle={`Version ${oldVersion.id}`}
      rightTitle="Current Version"
    />
  </div>
);

Option 2: Visual Inline HTML Diff
For a more "social media" feel, use htmldiff-js to generate a single block of HTML with <ins> and <del> tags. 

    Generate the Diff: htmldiff(oldHtml, newHtml) returns a string of HTML with injected tags.
    Apply Styles: Add CSS to make deletions and additions stand out. 

/* src/styles/diff.css 
ins {
  background-color: #d4fcbc; /* Light green 
  text-decoration: none;
  border-bottom: 2px solid #34d399;
}

del {
  background-color: #fecaca; /* Light red
  color: #991b1b;
  text-decoration: line-through;
}

3. Implementation in your Modal
You can toggle between a "History List" and this "Compare Mode" when a user selects two versions.

const [compareIds, setCompareIds] = useState<string[]>([]);

const handleSelectForCompare = (id: string) => {
  setCompareIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
};

// In your modal render:
{compareIds.length === 2 ? (
  <CompareVersions 
    oldVersion={history.find(v => v.id === compareIds[0])} 
    newVersion={history.find(v => v.id === compareIds[1])} 
  />
) : (
  <HistoryList onSelect={handleSelectForCompare} />
)}

Why this is helpful:

    Safety: Users can verify exactly what they are restoring before they hit the "Restore" button.
    Auditing: Makes it easy to spot malicious edits or accidental deletions in long posts.
    Professional UX: Mimics the sophisticated version control features of platforms like GitHub or Wikipedia. 


*/

/*
 implement "Image Diffing" if the user edited the alt-text or media attachments instead of just the text

 Implementing
Image Diffing allows users to see exactly how media attachments have changed, such as a modified focal point, a new thumbnail, or updated alt-text (descriptions). 
1. The Media History Object
In the Mastodon API, status history includes a media_attachments array for each version. To compare them, you check the differences between the current version's media and the historical version's media.

// Example of a diffing logic for media attachments
const compareMedia = (oldMedia, newMedia) => {
  return oldMedia.map(oldItem => {
    const newItem = newMedia.find(n => n.id === oldItem.id);
    
    return {
      id: oldItem.id,
      url: oldItem.url,
      // Check if the alt-text (description) has changed
      altChanged: oldItem.description !== newItem?.description,
      oldAlt: oldItem.description,
      newAlt: newItem?.description,
      // Check if the focal point changed
      focalChanged: JSON.stringify(oldItem.meta?.focus) !== JSON.stringify(newItem?.meta?.focus)
    };
  });
};

2. Visualizing Alt-Text Changes
Since alt-text is critical for accessibility, use a text-diff approach for the descriptions. Use <ins> (green) and <del> (red) tags to highlight edits within the text. 

    Highlight Addition: "A sunset over the [ocean]."
    Highlight Removal: "A sunset over the [mountains]."

3. Visual Comparison Tools
For changes in the image itself (like a new version of a photo or a different focal point), use a Before/After Slider. 

    React Compare Slider: Allows users to drag a divider between the old and new image to spot differences instantly.
    Focal Point Indicator: If only the focal point (the "center" of the preview) changed, overlay a crosshair on both images to show how the "intelligent cropping" moved. 

4. Implementation in the History Modal
When comparing two versions, add a "Media" tab that shows these differences side-by-side.

const MediaDiff = ({ oldVersion, newVersion }) => {
  const diffs = compareMedia(oldVersion.media_attachments, newVersion.media_attachments);

  return (
    <div className="media-diff-list">
      {diffs.map(diff => (
        <div key={diff.id} className="media-diff-item">
          <ReactCompareSlider 
            itemOne={<img src={diff.url} alt={diff.oldAlt} />} 
            itemTwo={<img src={diff.url} alt={diff.newAlt} />} 
          />
          {diff.altChanged && (
            <div className="alt-diff">
              <strong>Alt-Text Change:</strong>
              <div dangerouslySetInnerHTML={{ __html: htmldiff(diff.oldAlt, diff.newAlt) }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

Why this is essential:

    Accessibility Accountability: Users can see if an edit removed important descriptive text for screen readers.
    Contextual Clarity: If a user updates an image with a higher-resolution version or better focal point, the history clarifies why the post might look different to others.


*/

/*
 implement "Poll History" to track how poll options or expiration dates were modified during an edit

 To implement
Poll History, you track how a poll’s options, type, or duration have changed across different versions of a status. In the Mastodon API, a StatusEdit entity includes a poll field representing the state of the poll at that specific revision. 
1. Identifying Poll Changes
When comparing two versions in your history modal, you should look for three specific types of changes:

    Option Resets: If the text of poll options changes, Mastodon automatically resets all vote counts to zero. Your UI should highlight this with a warning badge (e.g., "Poll Reset") so users know why votes disappeared.
    Type Changes: A poll might be changed from single-choice (radio buttons) to multiple-choice (checkboxes).
    Expiration Adjustments: Comparing the expires_at field across versions reveals if the poll was extended or ended early. 

2. Implementation Logic
You can create a comparison function that identifies these shifts by mapping over the options array in each revision.

const getPollDiff = (oldPoll, newPoll) => {
  if (!oldPoll || !newPoll) return null;

  return {
    optionsChanged: JSON.stringify(oldPoll.options.map(o => o.title)) !== 
                    JSON.stringify(newPoll.options.map(o => o.title)),
    typeChanged: oldPoll.multiple !== newPoll.multiple,
    expiryChanged: oldPoll.expires_at !== newPoll.expires_at,
    oldOptions: oldPoll.options,
    newOptions: newPoll.options
  };
};

3. Visualizing the Diff
In your history modal, display a "Poll Comparison" section.

    Option Diff: Use your text-diffing logic to show what specific words in the poll answers were edited.
    Status Indicators: If optionsChanged is true, add a notice: "⚠️ This edit reset the poll results".
    Time Shift: If the expiration changed, show a before/after comparison: "Expired: 2:00 PM → 6:00 PM." 

Why this is a "Power User" Feature:

    Integrity: It prevents "bait-and-switch" polls where a user changes the answers after people have already voted.
    Clarity: It explains the technical behavior of the Mastodon platform (the automatic vote reset) directly to the user. 

These resources detail the Mastodon API's StatusEdit entity and the "poll" field, explaining how to identify and visualize changes in poll options, type, and expiration
1) https://fedi.tips/how-to-post-a-poll-on-mastodon/#:~:text=%E2%9A%A0%EF%B8%8F%20Warning%20about%20editing%20polls%20You%20can,an%20open%20issue%20about%20this%20here%20%E2%A7%89.
2) https://docs.joinmastodon.org/entities/Poll/


*/

/*Since we've covered text, media, and polls, would you like to see how to finalize the "History Sidebar" layout to unify all these different diffs into one clean timeline

The
History Sidebar unifies your text, media, and poll diffs into a chronological vertical timeline. It follows a "snapshot" pattern where each entry represents exactly what the user saw at that moment in time. 
1. The Unified Sidebar Layout
Organize the sidebar using a Master-Detail pattern. The left (or right) column lists the versions, and selecting one opens the full comparison view. 

    Optimal Width: Keep the sidebar between 240–300px so it doesn't crowd the main content.
    Visual Hierarchy: Use bold text for the current version and a subtle gray for historical "snapshots".
    Sticky Anchor: Keep the "Current Version" pinned at the top of the sidebar for easy reference. 

2. The Multi-Diff Component
Instead of separate tabs, use a single vertical scroll where all changes are visible at once.

    Text Section: Display the Inline HTML Diff with <ins> and <del> tags so the user can see word-level changes immediately.
    Media Gallery: If media changed, show a Side-by-Side comparison of the old and new thumbnails. Place the "Alt-Text Diff" directly underneath the image to highlight accessibility changes.
    Poll Summary: Add a colored alert badge if the edit caused a poll reset (common in Mastodon when options change).

3. Unified Timeline Implementation
Render each historical entry as a "block" that summarizes all changes in that revision. 

export const HistoryTimelineItem = ({ revision, isCurrent }) => (
  <div className={`history-snapshot ${isCurrent ? 'active' : ''}`}>
    <div className="snapshot-meta">
      <time>{new Date(revision.created_at).toLocaleString()}</time>
      {isCurrent && <span className="current-label">Current</span>}
    </div>
    
    {/* Summary of what changed in this version *//*}
    <ul className="change-summary">
      {revision.textChanged && <li>📝 Content edited</li>}
      {revision.mediaChanged && <li>🖼️ Media updated</li>}
      {revision.pollChanged && <li className="warning">🗳️ Poll reset</li>}
    </ul>
    
    <button onClick={() => onSelect(revision)}>View Full Diff</button>
  </div>
);

4. Navigation & Shortcuts

    J / K Navigation: Allow users to cycle through history entries with the keyboard, updating the main diff view as they move.
    Collapse/Expand: Make the sidebar collapsible (down to ~64px) to maximize the "Full Diff" viewing area when needed.
    Restore Action: Place a clear "Restore Version" button at the bottom of the sidebar when a historical version is selected to enable quick reversal of actions.


*/

/*
 implement "Real-time Collaboration" indicators, so you can see if another person is editing 
 the same status at the same time

 Real-time collaboration indicators prevent "edit collisions" by signaling when another user is modifying a post. While the Mastodon API provides a
Streaming API for updates, collaborative "presence" typically requires a dedicated WebSocket or messaging layer like Pusher or Socket.io. 

1. The Collaborative Locking Pattern
Since full multi-user typing (like Google Docs) is complex, most apps use a Locking Pattern. When one user starts editing, the status is "locked" for others. 

    Acquire Lock: When a user clicks "Edit," send a JOIN_EDIT event via WebSocket to notify the server.
    Broadcast Presence: The server tells all other connected clients: "User X is currently editing Status #123".
    Release Lock: When the user saves or cancels, send a LEAVE_EDIT event to unlock it for others. 

2. Presence Indicators in the UI
Visual cues help users stay informed without intrusive popups.

    Avatar Initials: Display the editing user's initials or avatar at the top of the post.
    Typing Indicator: Show a subtle "User is typing..." message or a pulsating icon if they are actively modifying text.
    Disabled State: If another user holds the lock, disable the "Edit" button for everyone else and show a tooltip: "Currently being edited by [Name]". 

3. Resilience and "Keepalive"
Networks are unreliable, so you must handle "ghost locks" if a user closes their tab without saving. 

    Heartbeat/Polling: The editing client sends a "keepalive" signal every few seconds. If the server stops receiving these, it automatically releases the lock after a timeout.
    Unload Listeners: Use the beforeunload browser event to attempt a final "Unlock" request before the tab closes. 

4. Implementation with Pusher (Example)
Pusher Presence Channels are ideal for this because they automatically track who is "online" in a specific room (status ID).

// Join the 'presence-status-123' channel when entering Edit Mode
const channel = pusher.subscribe(`presence-status-${statusId}`);

channel.bind('pusher:subscription_succeeded', (members) => {
  // Check if anyone else is already here
  if (members.count > 1) setIsLocked(true);
});

channel.bind('editing-started', (data) => {
  setEditorName(data.name);
  setIsLocked(true);
});


*/

/*
 implement "Conflict Resolution" logic for the rare case where two users somehow save changes
  at the exact same millisecond
Conflict resolution logic protects your data when two users attempt to save different versions of the same post at the exact same time
. 
1. The Strategy: Optimistic Concurrency Control (OCC)
The most common approach is to use ETags or Version Numbers. 

    The Check: When you fetch a status, the server sends a unique identifier (like v1 or an ETag).
    The Save: When you send your update, you include that same identifier in a header like If-Match.
    The Conflict: If another user saved a change while you were still typing, the server's version will now be v2. Since your v1 doesn't match, the server rejects your save with a 412 Precondition Failed error instead of overwriting the other user's work.

2. Handling the Rejection in React Query
In your mutation's onError block, you must handle this specific conflict by presenting a choice to the user.

onError: (err, variables, context) => {
  if (err.status === 412 || err.status === 409) {
    // 1. Fetch the absolute latest version from the server
    const latestServerData = err.response.data; 

    // 2. Open a "Conflict Resolution" UI
    showConflictModal({
      yourVersion: variables.content,
      theirVersion: latestServerData.content,
      onResolve: (finalChoice) => {
        // Retry the mutation with the merged content
        mutate({ content: finalChoice });
      }
    });
  }
}

3. Common Resolution Patterns
Once a conflict is detected, you can offer these standard choices to the user:

    Keep Mine (Overwrite): Forces your version onto the server, effectively ignoring the other person's update.
    Keep Theirs (Discard): Discards your local changes and refreshes the post with the other person's new content.
    Manual Merge: Displays a side-by-side view (similar to the History Compare Mode we built) where the user can pick specific sentences from both versions to combine them.
    Last Write Wins (LWW): The simplest but riskiest method, where the server simply accepts whichever request arrived last, automatically overwriting the previous one without notification. 


*/

/*
implement "Semantic Merging" where the app automatically combines changes if the two users 
edited different paragraphs of the same post

Semantic merging
allows your application to automatically combine changes from two users when those changes don't overlap, such as when one person edits the first paragraph and another edits the second. 
To implement this safely, you use a Three-Way Merge algorithm. This requires three pieces of data: 

    BASE: The original version both users started from.
    MINE: Your local, updated version.
    THEIRS: The version currently on the server that someone else just saved. 

    1. The Strategy: Block-Level Merging

The most reliable way to handle "paragraph merging" is to treat the post as an array of blocks rather than a single string of text. 

    Deconstruction: Split the HTML/Text into an array of paragraphs (e.g., using .split('\n\n')).
    Comparison: Compare each paragraph in MINE and THEIRS against the BASE.
    Auto-Merge Rules:
        If Paragraph 1 was changed only in MINE, keep your change.
        If Paragraph 2 was changed only in THEIRS, keep their change.
        If both changed the same paragraph, trigger a Conflict Modal.

2. Implementation with three-way-merge
You can use the three-way-merge library to automate the logic. 

import merge from 'three-way-merge';

const resolveSemanticMerge = (base, mine, theirs) => {
  // Use a line-based or paragraph-based merge
  const result = merge(mine, base, theirs);

  if (result.conflict) {
    // If there's an overlap in the same paragraph, we can't auto-merge
    return { success: false, conflicts: result.joinedResults() };
  }

  // Success! The paragraphs were merged automatically
  return { success: true, mergedText: result.joinedResults() };
};

3. Alternative: Google Diff-Match-Patch 
For word-level merging, google/diff-match-patch is the industry standard (originally used for Google Docs). It creates patches from your changes and attempts to apply them to the server's latest version. 

    Cleanup: Use diff_cleanupSemantic to ensure the merge results are "human-readable" and don't create broken sentences.
    Fuzzy Matching: It can apply your edits even if the other person shifted the text slightly (e.g., added a word at the beginning of the post). 

4. Advanced: CRDTs (Yjs / Automerge)
If you want to move away from "conflict modals" entirely and have a perfectly seamless experience like Notion or Google Docs, you should use Conflict-free Replicated Data Types (CRDTs). 

    Yjs: Optimized for shared text editing.
    Automerge: Better for sharing complex application state.

*/

/*
how to handle "Media Conflicts"—for example, if you add a caption while someone else replaces the image itself

To handle
Media Conflicts, you need logic that prevents one person's caption from being attached to a completely different image that someone else just uploaded. Because media attachments often involve two separate steps (uploading the file and then updating its metadata), conflicts are common.
1. The Conflict: "Captioning the Wrong Image"
This happens when:

    User A opens the editor to update the alt-text (description) of an existing photo.
    User B simultaneously replaces that photo with a new one.
    If User A saves, their description for the old photo might now be applied to User B’s new photo, causing a mismatch.

2. Resolution Strategy: ID Matching
The safest way to handle this is to compare the Media Attachment IDs before saving any changes to descriptions or focal points.

const handleSaveMedia = (currentMediaId, updatedData) => {
  // 1. Fetch the latest status from the server
  const latestStatus = await fetchStatus(statusId);
  
  // 2. Verify the ID still exists in the latest version
  const mediaExists = latestStatus.media_attachments.some(m => m.id === currentMediaId);

  if (!mediaExists) {
    // The image was deleted or replaced while you were editing
    showMediaConflictModal({
      message: "The image you were captioning has been removed or replaced.",
      onReload: () => refreshEditor()
    });
    return;
  }

  // 3. If ID matches, proceed with the update
  updateMedia(currentMediaId, updatedData);
};

3. Visual "Conflict" Indicators
If your app uses the WebSocket presence indicators we discussed, you can prevent this entirely by showing a "Media Locked" state.

    The Indicator: A small "lock" icon appears over the image thumbnail if another user is currently editing its metadata.
    The Action: Disable the "Edit Description" button for everyone else until the first user finishes.

4. Implementation with TanStack Query
You can use the onMutate logic to check for these mismatches optimistically.

    Logic: If the statusId being updated has a different media_attachment count or different IDs than what is in your local state, trigger a "Merge View" for the media.
    The Merge View: Show both the old image (with your new caption) and the new image (which might have no caption yet). Let the user choose to apply their caption to the new image or discard it. Mastodon's Media API supports updating descriptions independently of the file upload. 

Summary of Best Practices:

    Atomic Updates: Treat each media attachment as its own "row" in the database with a unique ID Mastodon API Guidelines.
    Validation: Always verify the media_id exists on the server before sending a PUT or PATCH request to update its description.
    Feedback: Use Toast Notifications to explain why a caption failed to save (e.g., "Image no longer exists").


*/

/*
 implement "Batch Media Uploads" where multiple images are uploaded concurrently with a shared progress bar for the whole post

 To implement
Batch Media Uploads with a shared progress bar, you must manage multiple concurrent uploads while calculating a single aggregate completion percentage. 
1. Tracking Concurrent Progress
Since modern APIs like Mastodon typically require hitting the server multiple times for multiple files, you should track each file's progress in a local state object.


const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

// Calculate the shared (total) progress
const totalProgress = Object.values(uploadProgress).length > 0 
  ? Math.round(Object.values(uploadProgress).reduce((a, b) => a + b, 0) / Object.keys(uploadProgress).length)
  : 0;


2. The Multi-Upload Function
Use Axios's onUploadProgress to capture real-time data for each file. By using Promise.all, you can trigger all uploads concurrently. 

const uploadFiles = async (files: File[]) => {
  const uploadPromises = files.map(async (file) => {
    const formData = new FormData();
    formData.append('file', file); // Use 'file' for Mastodon API

    return axios.post('/api/v2/media', formData, {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(prev => ({ ...prev, [file.name]: percentCompleted }));
      }
    });
  });

  return Promise.all(uploadPromises);
};

3. Shared Progress UI
Render a single Progress Bar for the entire batch to provide a cleaner user experience

<div className="batch-progress-container">
  <div className="progress-bar-wrapper">
    <div className="progress-bar-fill" style={{ width: `${totalProgress}%` }} />
  </div>
  <span className="progress-text">{totalProgress}% of {files.length} files uploaded</span>
</div>

4. Integration Details

    Mastodon Specifics: In Mastodon, you can upload up to four images per post. Larger media like video or GIFV are processed asynchronously and may return a 202 Accepted status while processing continues in the background.
    Dropzone Support: Use react-dropzone to handle multiple file selection via drag-and-drop easily.
    Sequential vs. Parallel: While Promise.all is faster for small batches, consider sequential uploads or chunking for very large files or slow connections to prevent network congestion.


*/

/*
implement "Background Retries" so that if one image in a batch fails, it retries automatically without restarting the entire upload

To implement
Background Retries for image uploads, you should shift from a "fail-all" strategy to an individual retry pattern. This ensures that a single network blip doesn't force a user to re-upload four different files. 
1. Individual File Retry with Axios
Instead of wrapping the entire batch in one retry, wrap each individual upload promise with a retry utility like axios-retry or a custom recursive function. 
import axios from 'axios';
import axiosRetry from 'axios-retry';

// Configure individual retries for each upload
const uploadInstance = axios.create();
axiosRetry(uploadInstance, { 
  retries: 3, 
  retryDelay: axiosRetry.exponentialDelay, // 1s, 2s, 4s...
  retryCondition: (error) => axiosRetry.isNetworkOrIdempotentRequestError(error) 
});

const uploadSingleFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return uploadInstance.post('/api/v2/media', formData, {
    onUploadProgress: (e) => onProgress(Math.round((e.loaded * 100) / e.total))
  });
};

2. Handling Partial Failures
Use Promise.allSettled() instead of Promise.all. While all() fails as soon as one request drops, allSettled() waits for every file to either succeed or exhaust its retries, allowing you to show the user exactly which files failed.

const uploadBatch = async (files) => {
  const results = await Promise.allSettled(
    files.map(file => uploadSingleFile(file, (p) => updateProgress(file.name, p)))
  );

  const failedUploads = results.filter(r => r.status === 'rejected');
  if (failedUploads.length > 0) {
    toast.error(`${failedUploads.length} files failed to upload after retries.`);
  }
};

3. Key Benefits for Background Work

    Resilience: Automated retries handle transient issues like bad Wi-Fi or temporary server timeouts without user intervention.
    Efficiency: If 3 of 4 images succeed, you only need to offer a manual "Retry" for the single failed one rather than restarting the whole batch.
    Exponential Backoff: This avoids "hammering" the server by gradually increasing the time between retry attempts.


4. Background Execution
If the user navigates away, React components may unmount and kill the upload. For true "background" persistence:

    Web Workers: Run the upload logic in a Web Worker thread so it continues even if the UI changes.
    Service Workers: For even more durability, a Background Sync Service Worker can retry uploads even if the browser tab is closed.

*/

/*
implement a "Manual Retry" button on individual image thumbnails so the user can personally re-trigger a failed upload

To implement a
Manual Retry button, we need to track each file's status (e.g., idle, uploading, success, or error) in our state. This allows the UI to show a specific "Retry" icon only on the thumbnail that failed.
1. The File State Management
Instead of just a progress number, use an object to track the full state of each file in the batch.

interface FileUploadState {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  errorMsg?: string;
}

const [files, setFiles] = useState<Record<string, FileUploadState>>({});

2. The Individual Upload Trigger
Create a function that can be called for a single file. This is what the "Retry" button will trigger.

const uploadSingleFile = async (fileName: string) => {
  const fileState = files[fileName];
  if (!fileState) return;

  // Reset state to uploading
  setFiles(prev => ({
    ...prev,
    [fileName]: { ...prev[fileName], status: 'uploading', progress: 0 }
  }));

  try {
    const formData = new FormData();
    formData.append('file', fileState.file);

    const response = await axios.post('/api/v2/media', formData, {
      onUploadProgress: (e) => {
        const p = Math.round((e.loaded * 100) / (e.total || 1));
        setFiles(prev => ({
          ...prev, 
          [fileName]: { ...prev[fileName], progress: p }
        }));
      }
    });

    // Mark as success
    setFiles(prev => ({
      ...prev,
      [fileName]: { ...prev[fileName], status: 'success', progress: 100 }
    }));
    
    return response.data;
  } catch (err) {
    // Mark as error
    setFiles(prev => ({
      ...prev,
      [fileName]: { ...prev[fileName], status: 'error', errorMsg: "Upload failed" }
    }));
  }
};

3. The Thumbnail UI with Retry Button
Use an overlay on the image thumbnail. If the status is error, show a "refresh" icon.

{Object.values(files).map((fileState) => (
  <div key={fileState.file.name} className="thumbnail-wrapper">
    <img src={URL.createObjectURL(fileState.file)} className="thumbnail-preview" />
    
    {fileState.status === 'error' && (
      <div className="error-overlay">
        <button 
          onClick={() => uploadSingleFile(fileState.file.name)}
          className="retry-btn"
          title="Try again"
        >
          <RotateCcw size={20} /> {/* [Lucide-React](https://lucide.dev) icon *//*}
        </button>
        <span className="error-text">Failed</span>
      </div>
    )}

    {fileState.status === 'uploading' && (
      <div className="progress-circle" style={{ '--p': fileState.progress } as any} />
    )}
  </div>
))}

4. Why this UX works

    Targeted Recovery: Users don't have to re-upload everything if a single large video fails File Upload UX Best Practices.
    Visual Context: Placing the retry button directly on the failing image makes it clear which file needs attention.
    Disabled Form: You can disable the main "Post" button if any file in the list has the error or uploading status.




*/

/*
implement "Automatic Cleanup" of these URL.createObjectURL references to prevent memory leaks in your browser

To prevent memory leaks when using
URL.createObjectURL, you must manually revoke the generated strings once they are no longer needed. If you don't, the browser keeps the file in memory as long as the document is open, which can crash the tab if a user uploads many large images.
1. The Cleanup Logic
The best way to handle this in React is within a useEffect inside your thumbnail component. When the component "unmounts" (e.g., the user closes the modal or the upload finishes and the preview is removed), the cleanup function runs.

const ThumbnailPreview = ({ file }: { file: File }) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    // 1. Create the temporary URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // 2. Return the cleanup function
    return () => {
      URL.revokeObjectURL(url); // 👈 Frees the memory
    };
  }, [file]);

  if (!previewUrl) return null;

  return <img src={previewUrl} alt="Preview" />;
};

2. Why this is Critical

    Memory Management: Unlike standard variables, ObjectURLs are not garbage-collected automatically. They only die when the page is refreshed or revokeObjectURL() is called.
    Performance: If a user uploads 10 high-res photos (20MB each) and deletes them, but you don't revoke the URLs, your app is still consuming 200MB of RAM for nothing.

3. Handling "Successful" Uploads
Once an image is successfully uploaded to the server, you usually swap the local blob: URL for the permanent server URL (e.g., https://mastodon.social...).

    Best Practice: Ensure the component that generated the blob: URL unmounts during this swap so the cleanup logic triggers automatically.

4. Alternative: FileReader
If you want to avoid createObjectURL entirely, you can use FileReader.readAsDataURL(). This creates a Base64 string.

    Pros: No manual memory management required.
    Cons: It is significantly slower for large files and uses ~33% more memory while active than createObjectURL.



*/

/*
how to implement "Image Cropping" so users can adjust their photos directly in the browser before uploading

To implement
Image Cropping in the browser, you can use the react-easy-crop library. It provides a highly performant, mobile-friendly interface for zooming and cropping images using the Canvas API.
1. The Cropper Component
This component allows the user to drag and zoom. It returns a set of "pixel coordinates" (croppedAreaPixels) which you then use to generate the actual cropped file.

import Cropper from 'react-easy-crop';

export const ImageEditor = ({ imageSrc, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  return (
    <div className="cropper-container" style={{ position: 'relative', height: 400 }}>
      <Cropper
        image={imageSrc}
        crop={crop}
        zoom={zoom}
        aspect={4 / 3} // Lock to a specific ratio (optional)
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={(_, pixels) => onCropComplete(pixels)}
      />
    </div>
  );
};

2. Generating the Cropped File
Once the user is happy, you use a helper function to draw that specific area onto a hidden <canvas> and convert it back into a Blob or File for uploading.

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc); // Helper to load image
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], "cropped.jpg", { type: "image/jpeg" }));
    }, "image/jpeg");
  });
};

3. Why Crop Before Uploading?

    Reduced Bandwidth: Uploading a 200KB cropped version is much faster than uploading the full 10MB original File Optimization Tips.
    User Control: Users can ensure the most important part of the photo (like a face) is centered, which is vital for Mastodon's "focal point" system.
    Privacy: It allows users to remove sensitive background information from a photo before it ever reaches your server.

4. Integration with Your Batch Upload
When a user selects files, you can intercept them:

    Show the Crop Modal.
    Wait for the user to finish.
    Replace the original File object in your files state with the newly generated cropped File.
    Trigger the Batch Upload logic we built previously.



*/

/*
 implement "Automatic Focal Point Detection" using a smart cropping library so the user doesn't have to crop manually every time

 To implement
Automatic Focal Point Detection, you can use smartcrop.js. This library analyzes your image for "salient" features—like faces, sharp edges, or high-saturation areas—and calculates the most important coordinates. 
1. How SmartCrop Works
Instead of a simple center-crop, the algorithm performs a "content-aware" analysis:

    Edge Detection: Identifies sharp lines and detail-rich areas.
    Face/Skin Detection: Prioritizes human subjects.
    Ranking: It uses a "sliding window" to find the rectangle with the highest "importance" score. 

2. Implementation Logic
When a user selects an image, you can automatically calculate its focal point before they even open the editor.

import smartcrop from 'smartcrop';

const autoDetectFocalPoint = async (imageFile) => {
  const img = new Image();
  img.src = URL.createObjectURL(imageFile);
  
  await img.decode(); // Wait for image data

  // Analyze the image for the best 1:1 square crop
  const result = await smartcrop.crop(img, { width: 100, height: 100 });
  
  // The 'topCrop' is the best-guessed area
  const { x, y, width, height } = result.topCrop;
  
  // Calculate the center of that area for Mastodon's focal point (-1.0 to 1.0)
  return {
    x: ((x + width / 2) / img.width) * 2 - 1,
    y: (1 - (y + height / 2) / img.height) * 2 - 1,
  };
};


3. Mastodon Focal Point Specs
Unlike standard pixel coordinates, Mastodon focal points use a floating-point system from -1.0 to 1.0: 

    (0,0): The center of the image.
    (-1.0, 1.0): The top-left corner.
    (1.0, -1.0): The bottom-right corner. 

4. Integration with Manual Editing
Automatic detection is a great starting point, but it's not perfect. 

    Auto-Run: When a file is uploaded, run smartcrop in the background.
    Preview: Show a small crosshair (the focal point) on the thumbnail.
    Adjust: Allow the user to drag that crosshair manually if the AI guessed wrong.

Why this is a "Game Changer":

    Speed: Users don't have to manually crop every photo for it to look good in a timeline.
    Better Previews: Prevents "beheading" subjects in tall portrait photos when they are displayed as square thumbnails.
    Accessibility: Ensures the most descriptive part of the image is what's visible. 



*/

/*
implement the "Interactive Crosshair" UI so users can drag and drop their focal point on a thumbnail

To implement an
Interactive Crosshair, you need a component that maps a user's click/drag coordinates on an image to the Mastodon-style coordinate system (-1.0 to 1.0).
1. The Focal Point Logic
The math converts pixel coordinates into a percentage-based scale where (0,0) is the exact center.

const calculateFocalPoint = (event, imageRect) => {
  // Get click position relative to the image
  const offsetX = event.clientX - imageRect.left;
  const offsetY = event.clientY - imageRect.top;

  // Convert to -1.0 to 1.0 scale
  const x = (offsetX / imageRect.width) * 2 - 1;
  const y = -((offsetY / imageRect.height) * 2 - 1); // Flip Y because 1.0 is TOP in Mastodon

  return { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
};

2. The Interactive Component
This component renders the image and a draggable "target" icon.
export const FocalPointPicker = ({ src, value, onChange }) => {
  const imgRef = useRef<HTMLImageElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    onChange(calculateFocalPoint(e, rect));
  };

  // Convert -1/1 back to CSS percentages for the crosshair position
  const left = ((value.x + 1) / 2) * 100;
  const top = ((1 - value.y) / 2) * 100;

  return (
    <div className="relative cursor-crosshair overflow-hidden" onClick={handleClick}>
      <img ref={imgRef} src={src} className="block w-full select-none" alt="Set focal point" />
      
      {/* The Crosshair Target *//*}
      <div 
        className="absolute w-8 h-8 -ml-4 -mt-4 border-2 border-white rounded-full shadow-lg pointer-events-none"
        style={{ left: `${left}%`, top: `${top}%` }}
      >
        <div className="absolute inset-0 m-auto w-1 h-1 bg-white rounded-full" />
      </div>
    </div>
  );
};

3. Why this matters for UX

    Intelligent Cropping: When your app displays this image in a square grid (common in timelines), the browser will use object-position or the server will crop the image centered on these coordinates.
    Mobile Previews: It ensures that faces or key subjects aren't cut off on small screens.

4. Integration with the Mastodon Media API
When you send the final request to update the media, you include the coordinates in the focus field:

const updateFocalPoint = (mediaId, focalPoint) => {
  return axios.put(`/api/v1/media/${mediaId}`, {
    focus: `${focalPoint.x.toFixed(2)},${focalPoint.y.toFixed(2)}`
  });
};

*/

/*
 CSS trick using object-position to show the user a live "Square Preview" that updates as they move the crosshair?

 To implement a
Live Square Preview, you use the CSS object-fit: cover and object-position properties. This ensures that as the focal point crosshair moves, the square preview updates in real-time to keep that point centered in the frame. 
1. Converting Mastodon Coordinates to CSS
Mastodon uses a coordinate system from -1.0 to 1.0 (where 0,0 is center), but CSS object-position uses 0% to 100% (where 50% 50% is center). 

    X Conversion: (x + 1) / 2 * 100
    Y Conversion: (1 - y) / 2 * 100 (We subtract from 1 because in Mastodon, 1.0 is the top, while in CSS, 0% is the top).

2. The Live Preview Component
This component shows a fixed-size square that "follows" the focal point. 

export const FocalPointPreview = ({ src, focalPoint }: { src: string, focalPoint: { x: number, y: number } }) => {
  // Convert -1/1 coordinates to 0-100% for CSS
  const posX = ((focalPoint.x + 1) / 2) * 100;
  const posY = ((1 - focalPoint.y) / 2) * 100;

  const previewStyle: React.CSSProperties = {
    width: '150px',
    height: '150px',
    borderRadius: '8px',
    objectFit: 'cover', // 👈 Fills the square without distortion
    objectPosition: `${posX}% ${posY}%`, // 👈 Centers the focal point
    transition: 'object-position 0.1s ease-out' // Smooths the movement
  };

  return (
    <div className="preview-container">
      <p>Square Preview:</p>
      <img src={src} style={previewStyle} alt="Live crop preview" />
    </div>
  );
};

3. Why this works

    object-fit: cover: This command tells the browser to scale the image to completely fill the 150x150 box while maintaining its original aspect ratio.
    object-position: This acts like a window. By setting it to your calculated percentages, the browser shifts the image so that the specific focal point is as close to the center of that window as possible. 

4. Visual Comparison

    Standard Crop: If you don't set a focal point, the browser defaults to 50% 50% (the center), which might cut off a person's head in a tall photo.
    Focal-Point Crop: With this logic, if you select a face at the top-left, the preview will automatically shift to show the top-left corner of the original image in the square frame.



*/

/*
 "Aspect Ratio Presets" so users can see how their focal point looks in 16:9 (widescreen) or 9:16 (phone stories) as wel

 To implement
Aspect Ratio Presets, you can create a gallery of "mini-previews" that all respond to the same focal point coordinates. This ensures that a post looks professional whether it appears in a widescreen desktop browser (16:9) or a vertical mobile feed (9:16). 
1. Define Common Presets
Common social media aspect ratios include:

    1:1 (Square): Standard for grid views and legacy feed posts.
    16:9 (Widescreen): Standard for desktop video and Mastodon's default timeline preview.
    9:16 (Portrait): Ideal for mobile "Stories," TikToks, or Reels.
    4:5 (Portrait Feed): A common Instagram-style tall post. 

2. The Multi-Preview Component
Use a loop to render these different sizes. By applying the aspect-ratio CSS property to each container, the browser handles the math for you. 

const PRESETS = [
  { name: 'Square', ratio: '1 / 1' },
  { name: 'Widescreen', ratio: '16 / 9' },
  { name: 'Stories', ratio: '9 / 16' },
  { name: 'Classic', ratio: '4 / 3' }
];

export const AspectRatioGallery = ({ src, focalPoint }) => {
  // Same math as before to convert -1/1 to 0-100%
  const posX = ((focalPoint.x + 1) / 2) * 100;
  const posY = ((1 - focalPoint.y) / 2) * 100;

  return (
    <div className="flex gap-4 overflow-x-auto p-4 bg-gray-900 rounded-lg">
      {PRESETS.map((p) => (
        <div key={p.name} className="flex flex-col items-center gap-2">
          <span className="text-xs text-gray-400">{p.name}</span>
          <img
            src={src}
            className="w-32 rounded border border-gray-700"
            style={{
              aspectRatio: p.ratio, // 👈 Sets the shape
              objectFit: 'cover',   // 👈 Fills the shape
              objectPosition: `${posX}% ${posY}%` // 👈 Centers the focus
            }}
          />
        </div>
      ))}
    </div>
  );
};

3. Implementation Benefits

    Contextual Art Direction: Users can immediately see if their chosen focal point works for all potential viewing platforms.
    Responsive Testing: It eliminates the need for manual cropping for different devices. If the focus looks bad in 9:16, the user can shift it until both the face (in the story) and the horizon (in the widescreen) are preserved.
    User Feedback: Providing these presets teaches the user how the platform's automatic cropping works, reducing frustration when a head is "cut off" in the timeline. 

4. Advanced: "Safe Zones"
If you are designing for platforms like Instagram Stories, you can overlay "Safe Zone" 
guides on your 9:16 preview to show where UI elements (like the "Reply" box) might obscure the image. 

*/

/*
 implement "Alt-Text Suggestions" using an AI analysis tool to help users describe these different aspect-ratio views

 To implement
AI Alt-Text Suggestions, you can use image-to-text models that analyze visual features to generate descriptive captions. These tools provide a helpful starting point that users can refine for accuracy and nuance.

1. Implementation Approaches

    On-Device (Privacy Focused): Use Transformers.js to run models directly in the browser. This approach protects user privacy because images stay on the user's device.
    Cloud-Based (Higher Accuracy): Use APIs such as Azure AI Vision or Google Gemini 3 Pro Image to achieve high accuracy. 

2. Basic Browser-Based Example
A pipeline from Hugging Face can generate captions without a server.

import { pipeline } from '@huggingface/transformers';

const generateAltText = async (imageFile) => {
  // 1. Initialize the image-to-text pipeline
  const captioner = await pipeline('image-to-text', 'Salesforce/blip-image-captioning-base');
  
  // 2. Convert file to URL and generate caption
  const url = URL.createObjectURL(imageFile);
  const result = await captioner(url);
  
  return result[0].generated_text; // Returns e.g., "a city with tall buildings"
};


3. Best Practices for AI Suggestions

    Context is Key: AI may struggle with the intent of an image. Allow users to edit the generated text to suit their post's specific context.
    Keep it Concise: Alt text should be brief and convey the visual content's information.
    Identify Tone: Encourage users to add visual tone or mood details for more emotional posts (e.g., "heartwarming reunion in soft sunlight") that AI might miss.
    Avoid Redundancy: Ensure the alt text doesn't repeat the post's caption. 

4. Integration with Aspect Ratios
When users choose different views (like 9:16 for mobile), AI can help determine if key subjects remain visible in the specific frame. For instance, "Person's face in the upper center" confirms the correct focal point. 

*/
