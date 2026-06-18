//Infinite Scroll for Comments (using @tanstack/react-virtual)

/*
Implementing
Infinite Scroll with prepend (loading older messages at the top) using TanStack Virtual is
 slightly more manual than Virtuoso because you have to manage the "Scroll Adjustment" yourself.
When you add 30 older messages to the top of the array, the scroll position will naturally
jump to the top unless you tell the virtualizer to maintain the offset.
*/


import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef, useState } from 'react';

export function EventComments({ eventId, channel }) {
  const [comments, setComments] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  // 1. Initialize the Virtualizer
  const rowVirtualizer = useVirtualizer({
    count: comments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated height of a comment
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // 2. Detect "Scroll to Top" for Infinite Loading
  useEffect(() => {
    const firstItem = virtualItems[0];
    if (firstItem && firstItem.index === 0 && !isFetching) {
      loadOlderMessages();
    }
  }, [virtualItems, isFetching]);

  const loadOlderMessages = () => {
    const oldestId = comments[0]?.id;
    if (!oldestId) return;

    setIsFetching(true);
    
    // Push to Phoenix Channel
    channel.push("load_more", { last_id: oldestId })
      .receive("ok", ({ comments: olderBatch }) => {
        if (olderBatch.length > 0) {
          // --- THE KEY STEP FOR TANSTACK VIRTUAL ---
          // Capture the current scroll height before updating state
          const previousHeight = parentRef.current?.scrollHeight || 0;

          setComments((prev) => [...olderBatch, ...prev]);

          // After state update, adjust scroll so the user doesn't lose their place
          requestAnimationFrame(() => {
            if (parentRef.current) {
              const newHeight = parentRef.current.scrollHeight;
              parentRef.current.scrollTop = newHeight - previousHeight;
            }
          });
        }
        setIsFetching(false);
      });
  };

  return (
    <div 
      ref={parentRef} 
      className="h-[500px] overflow-auto border rounded-md bg-slate-50"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={rowVirtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <CommentItem data={comments[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}

/*
2. Why this is the "Golden Path" for TanStack:

    Scroll Anchoring: By using requestAnimationFrame to compare scrollHeight before and after prepending, you manually "anchor" the user's view. Without this, the user is suddenly teleported to the top of the chat history.
    Performance: Only the comments visible in the h-[500px] window are rendered in the DOM. This allows your event chat to handle thousands of messages without slowing down the browser.
    Dynamic Measuring: Using ref={rowVirtualizer.measureElement} allows TanStack to handle comments of different lengths (e.g., a 1-line "Hi" vs. a 10-line paragraph).

3. Backend Reminder Ensure your Elixir list_comments function is returning the comments 
in Chronological Order (Oldest \(\rightarrow \) Newest) so that [...olderBatch, ...prev] 
correctly places the older ones at the start of the array.
Summary of the Flow:
 User scrolls up in the TanStack list.
Virtualizer reports that virtualItems[0].index is 0.
Effect triggers the load_more push to the Phoenix Channel.
Elixir returns 30 older comments.
React calculates the height difference and adjusts scrollTop so the transition is seamless. 

Pro-Tip: If you want the chat to "Stick to Bottom" when the user first joins or when a new message 
arrives, you can use rowVirtualizer.scrollToIndex(comments.length - 1).
*/