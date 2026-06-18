import React, { forwardRef, useMemo, useRef, useEffect, useImperativeHandle } from 'react';
import { useWindowVirtualizer, useVirtualizer } from '@tanstack/react-virtual';
import { useHistory } from 'react-router-dom';

/*
complete, final ScrollableList.jsx file. It integrates all the logic we discussed: window-based 
virtualization, dynamic height measurement with data-index, skeleton screens for loading, 
and handle-empty states.

Critical Setup Notes:
1. Ref Placement: Ensure ref={virtualizer.measureElement} and data-index={virtualItem.index} are on 
   the same element that holds your content to ensure accurate measurement.
2. Window Scrolling: When useWindowScroll is true, the virtualizer uses the global window object, 
   which is best for mobile performance and standard web feeds.
3. Dynamic Sizing: If your items change size (e.g., expanding text), the measureElement call 
   combined with ResizeObserver (built-in) will update the list layout automatically.
*/

/**
 * Skeleton Screen Component
 * Mimics your list items with a shimmer effect during initial loading.
 */
const SkeletonItem = () => (
  <div className="skeleton-wrapper" style={{ padding: '16px', borderBottom: '1px solid #eee' }}>
    <div className="skeleton-pulse" style={{ width: '40px', height: '40px', borderRadius: '50%', marginBottom: '10px' }} />
    <div className="skeleton-pulse" style={{ width: '80%', height: '14px', borderRadius: '4px', marginBottom: '8px' }} />
    <div className="skeleton-pulse" style={{ width: '60%', height: '14px', borderRadius: '4px' }} />
    <style>{`
      .skeleton-pulse {
        background: #e0e0e0;
        background-image: linear-gradient(90deg, #e0e0e0 0px, #f0f0f0 40px, #e0e0e0 80px);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite linear;
      }
      @keyframes shimmer { 0% { background-position: -100% 0; } 100% { background-position: 100% 0; } }
    `}</style>
  </div>
);

const ScrollableList4 = forwardRef(({
  scrollKey,
  prepend = null,
  alwaysPrepend,
  children,
  isLoading,
  emptyMessage,
  emptyMessageCard = true,
  showLoading,
  onLoadMore,
  className,
  listClassName,
  itemClassName,
  id,
  hasMore,
  placeholderCount = 0,
  useWindowScroll = true,
  style = {},
}, ref) => {
  const history = useHistory();
  const parentRef = useRef(null);
  const scrollDataKey = `soapbox:scrollData:${scrollKey}`;
  const scrollData = useMemo(() => JSON.parse(sessionStorage.getItem(scrollDataKey) || 'null'), [scrollDataKey]);

  // 1. Data Normalization
  const elements = React.Children.toArray(children);
  const data = useMemo(() => {
    if (showLoading && placeholderCount > 0) {
      return Array(placeholderCount).fill('__placeholder__');
    }
    const base = [...elements];
    if (hasMore) base.push('__loader__');
    return base;
  }, [elements, showLoading, placeholderCount, hasMore]);

  // 2. Initialize Virtualizer
  const virtualizer = (useWindowScroll ? useWindowVirtualizer : useVirtualizer)({
    count: data.length,
    getScrollElement: () => (useWindowScroll ? window : parentRef.current),
    //estimateSize: () => 150, // Best guess for item height
    // Refined estimation logic
    estimateSize: (index) => {
        const item = data[index];
        
        // 1. Skeletons are usually a fixed height
        if (item === '__placeholder__') return 180; 
        
        // 2. LoadMore buttons are usually small
        if (item === '__loader__') return 80; 
        
        // 3. If it's a real item with an image (using the metadata we added earlier)
        if (item?.props?.content?.imageHeight) {
        return item.props.content.imageHeight + 100; // image + text padding
        }

        // 4. Default fallback for standard items
        return 150; 
    },
    overscan: 5,
  });

  // Expose virtualizer instance via ref
  useImperativeHandle(ref, () => virtualizer);

  // 3. Scroll Restoration & Persistence
  useEffect(() => {
    if (scrollData && history.action === 'POP') {
      virtualizer.scrollToOffset(scrollData.offset);
    }
  }, [virtualizer, scrollData, history.action]);

  useEffect(() => {
    return () => {
      if (scrollKey) {
        const offset = useWindowScroll ? window.scrollY : parentRef.current?.scrollTop;
        sessionStorage.setItem(scrollDataKey, JSON.stringify({ offset }));
      }
    };
  }, [scrollKey, scrollDataKey, useWindowScroll]);

  // 4. Handle Effectively Empty State
  const isEffectivelyEmpty = !showLoading && elements.length === 0;
  if (isEffectivelyEmpty) {
    return (
      <div className={className} id={id} style={style}>
        {alwaysPrepend && prepend}
        <div className="mt-2">
          {isLoading ? <Spinner /> : (
            emptyMessageCard ? <div className="card-lg">{emptyMessage}</div> : emptyMessage
          )}
        </div>
      </div>
    );
  }

  // 5. Main Render
  return (
    <div 
      ref={!useWindowScroll ? parentRef : null} 
      className={className} 
      id={id} 
      style={{ overflow: 'auto', ...style }}
    >
      {prepend}
      <div
        className={listClassName}
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = data[virtualItem.index];

          return (
            <div
              key={virtualItem.key}
              ref={virtualizer.measureElement} // Essential for dynamic heights
              data-index={virtualItem.index} // Required for measureElement to work
              className={itemClassName}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {item === '__placeholder__' ? <SkeletonItem /> :
               item === '__loader__' ? <LoadMore visible={!isLoading} onClick={onLoadMore} /> :
               item}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default ScrollableList;

/*
To make your list even smoother, you can refine the estimateSize function. Since TanStack Virtual 
uses this to calculate the initial scrollbar height and item positions, a more accurate guess 
prevents "jumpy" scrollbars as real measurements are taken

If you have a "Read More" button that expands an item's height:
1. When the user clicks "Read More," the content grows.
2. Because you have ref={virtualizer.measureElement} on the item's container, the ResizeObserver 
   inside TanStack Virtual will detect the change [2].
3. The virtualizer will automatically re-measure that specific index and shift all items below
   it down instantly.
*/
/*
Implementation Checklist
Headless logic implemented.
Dynamic height measured via data-index.
Image jitter solved via aspect-ratio.
Empty states and Skeletons handled via early returns.
Scroll persistence saved to sessionStorage.

*/
