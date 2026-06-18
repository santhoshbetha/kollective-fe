//Infinite Scroll for Comments (Golden Path)
/*
To implement
Infinite Scroll for your event chat, you’ll use the Intersection Observer API. Instead of a "Load More" button, you place a hidden "Sentinel" element at the top of the chat. When the user
 scrolls up and hits that element, it automatically triggers the Phoenix Channel to fetch older comments.
*/

import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer"; // Popular lightweight lib

export function EventComments({ eventId, socket }) {
  const [comments, setComments] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // 1. Hook to detect if we scrolled to the top
  const { ref, inView } = useInView({
    threshold: 0,
  });

  // 2. Trigger fetch when 'inView' is true
  useEffect(() => {
    if (inView && hasMore && !isLoading && comments.length > 0) {
      loadOlderMessages();
    }
  }, [inView]);

  const loadOlderMessages = () => {
    setIsLoading(true);
    const oldestId = comments[0]?.id; // Our Cursor

    channel.push("load_more", { last_id: oldestId })
      .receive("ok", ({ comments: olderBatch }) => {
        if (olderBatch.length < 30) setHasMore(false);
        
        // Prepend and stop loading
        setComments((prev) => [...olderBatch, ...prev]);
        setIsLoading(false);
      })
      .receive("error", () => setIsLoading(false));
  };

  return (
    <ScrollArea className="h-[600px] pr-4">
      {/* 3. THE SENTINEL: Hidden element at the top */}
      <div ref={ref} className="h-10 flex items-center justify-center">
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      <div className="space-y-4">
        {comments.map((c) => (
          <CommentItem key={c.id} comment={c} />
        ))}
      </div>
    </ScrollArea>
  );
}

/*
2. Solving the "Jump" Problem
When you prepend 30 messages, the scroll position usually "jumps" to the very top, which is annoying for users. To fix this in a standalone app, you can use React Virtuoso. It is a specialized 
list component that handles "Stick to Bottom" and "Prepend without jumping" automatically.
Example with React Virtuoso:

import { Virtuoso } from 'react-virtuoso';

<Virtuoso
  style={{ height: '500px' }}
  data={comments}
  startReached={loadOlderMessages} // Built-in infinite scroll trigger
  initialTopMostItemIndex={comments.length - 1} // Start at the bottom
  itemContent={(index, comment) => (
    <CommentItem key={comment.id} comment={comment} />
  )}
/>

3. Why this is the "Golden Path" for Standalone Apps:

    UX Smoothness: Infinite scroll is the modern standard for social apps (Instagram, Discord, Slack). It feels much faster than clicking a button.
    Efficiency: The backend logic we already wrote (where c.id < ^last_id) is already perfectly optimized for this.
    Low Latency: Using Phoenix Channels for pagination is significantly faster than standard REST GET requests because the TCP connection is already established and authenticated.

Summary of the Infinite Scroll Loop:

    User scrolls to the top of the event chat.
    Intersection Observer detects the "Sentinel" div.
    React sends a load_more push to the EventChannel.
    Elixir queries the next 30 comments using the oldest ID.
    React prepends the data.
    User continues scrolling seamlessly.

*/
