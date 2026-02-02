const Timeline = ({ type, endpoint }) => {
  const { data, fetchNextPage, isRefetching } = useTimeline(type, endpoint);

  // Replaces dequeueTimeline:
  // We show a button that simply triggers a refetch of the first page
  return (
    <div>
      {isRefetching && <button onClick={() => window.scrollTo(0,0)}>New Posts Available</button>}
      {data.pages.map(page => page.items.map(s => <Status status={s} />))}
    </div>
  );
};

//============================================================
//Virtual Scrolling
//To implement Virtual Scrolling in your Kollective-FE timeline, you use @tanstack/react-virtual. 
// This ensures that even if you have 5,000 posts in the cache, the browser only renders 
// the 5-10 currently visible on the screen, drastically improving performance on mobile devices.
import React, { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTimeline } from '../api/useTimeline';
import { StatusCard } from './StatusCard';

export const Timeline2 = ({ type, endpoint, params }) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useTimeline(type, endpoint, params);
  
  // 1. Flatten the paginated data into a single array
  const allRows = data ? data.pages.flatMap((page) => page.items) : [];
  const parentRef = useRef();

  // 2. Initialize the Virtualizer
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150, // Average height of a status card
    overscan: 5, // Render 5 items outside visible area for smooth scrolling
  });

  // 3. Infinite Scroll Trigger: Fetch more when reaching the end
  const virtualItems = rowVirtualizer.getVirtualItems();
  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (lastItem && lastItem.index >= allRows.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage, allRows.length, isFetchingNextPage, virtualItems]);

  return (
    <div ref={parentRef} className="timeline-scroll-container" style={{ height: '100vh', overflowY: 'auto' }}>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const isLoaderRow = virtualRow.index > allRows.length - 1;
          const status = allRows[virtualRow.index];

          return (
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
              {isLoaderRow 
                ? (hasNextPage ? 'Loading more...' : 'No more posts') 
                : <StatusCard status={status} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
/*
Dom Memory Efficiency: Instead of having thousands of DOM nodes (images, videos, text) slowing down the browser, you only have ~10.
Dynamic Measurement: Using rowVirtualizer.measureElement ensures that posts with different lengths (short text vs. long threads) are measured correctly once they appear TanStack Virtual Documentation.
Zero Jitter: Because the virtualizer calculates the exact translateY for each item, the scrollbar remains stable even as new pages are loaded in the background via TanStack Query.
*/

//============================================================
// /Scroll Restoration
// src/features/statuses/components/Timeline.jsx
import { useScrollStore } from '../store/useScrollStore';

export const Timeline = ({ type, endpoint, params }) => {
  const { data } = useTimeline(type, endpoint, params);
  const { setOffset, getOffset } = useScrollStore();
  const parentRef = useRef();

  // 1. Initialize Virtualizer with the saved offset
  const rowVirtualizer = useVirtualizer({
    count: data?.pages.flatMap(p => p.items).length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150,
    initialOffset: getOffset(type), // RESTORE: Start where we left off
  });

  // 2. Track Scroll: Save position as the user moves
  const handleScroll = (e) => {
    const scrollTop = e.currentTarget.scrollTop;
    // We use a simple check to avoid over-updating the store
    if (Math.abs(scrollTop - getOffset(type)) > 100) {
      setOffset(type, scrollTop);
    }
  };

  return (
    <div 
      ref={parentRef} 
      onScroll={handleScroll}
      style={{ height: '100vh', overflowY: 'auto' }}
    >
      {/* ... virtual items mapping ... */}
    </div>
  );
};



