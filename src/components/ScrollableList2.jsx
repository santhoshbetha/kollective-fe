import React, { forwardRef, useMemo, useRef, useEffect, useImperativeHandle } from 'react';
import { useWindowVirtualizer, useVirtualizer } from '@tanstack/react-virtual';
import { useHistory } from 'react-router-dom';
import LoadMore from './LoadMore';
import Spinner from "@/components/ui/spinner";

/*
With Dynamic height measurement to this implementation for items with varying content

To handle items with varying heights (like social media posts or cards with dynamic text), 
TanStack Virtual provides a measureElement function.

You must attach a ref to the actual DOM element of each item and pass it to virtualizer.measureElement. 
This allows the virtualizer to calculate the true height and update the list's total size

Key Changes for Dynamic Height:
1. virtualizer.measureElement(el): By passing the element to this function in the ref prop, 
   TanStack uses a ResizeObserver internally. If the content of an item changes 
   (e.g., an image loads or a "read more" is clicked), the virtualizer automatically recalculates the height.
2. data-index attribute: This is required when using measureElement. It tells the virtualizer 
   which data index the measured height belongs to.
3. Removal of hardcoded offsets: Because the virtualizer now knows the real heights, virtualizer.getTotalSize() 
   and virtualItem.start will be perfectly accurate, preventing the "jitter" often seen with dynamic content.

*/

const ScrollableList2 = forwardRef(({
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
  placeholderComponent: Placeholder,
  placeholderCount = 0,
  useWindowScroll = true,
  style = {},
}, ref) => {
  const history = useHistory();
  const parentRef = useRef(null);
  
  const scrollDataKey = `soapbox:scrollData:${scrollKey}`;
  const scrollData = useMemo(() => JSON.parse(sessionStorage.getItem(scrollDataKey) || 'null'), [scrollDataKey]);

  const elements = React.Children.toArray(children);

  /*const data = useMemo(() => {
    const base = [...elements];
    if (hasMore) base.push('__loader__');
    return base;
  }, [elements, hasMore]);*/

  const data = useMemo(() => {
    // 1. Initial skeleton state (if we are loading the very first time)
    if (showLoading && placeholderCount > 0) {
        return Array(placeholderCount).fill('__placeholder__');
    }

    const base = React.Children.toArray(children);

    // 2. Infinite loading state (if we already have data but are fetching more)
    if (hasMore) {
        base.push('__loader__');
    }

    return base;
  }, [children, showLoading, placeholderCount, hasMore]);

  const virtualizer = (useWindowScroll ? useWindowVirtualizer : useVirtualizer)({
    count: data.length,
    getScrollElement: () => (useWindowScroll ? window : parentRef.current),
    // 1. Provide an average estimate
    estimateSize: () => 150, 
    overscan: 5,
  });

  useImperativeHandle(ref, () => virtualizer);

  // Restore Scroll
  useEffect(() => {
    if (scrollData && history.action === 'POP') {
      virtualizer.scrollToOffset(scrollData.offset);
    }
  }, [virtualizer, scrollData, history.action]);

  const virtualItems = virtualizer.getVirtualItems();

  // 2. State Derived Logic
  const isEffectivelyEmpty = !showLoading && elements.length === 0;

  // 3. THE EARLY RETURN (Place it here)
  if (isEffectivelyEmpty) {
    return (
      <div className={className}>
        {alwaysPrepend && prepend}
        <div className="empty-state">
           {emptyMessageCard ? <Card>{emptyMessage}</Card> : emptyMessage}
        </div>
      </div>
    );
  }

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
        {virtualItems.map((virtualItem) => {
          const item = data[virtualItem.index];

          return (
            <div
              key={virtualItem.key}
              // 2. Attach the measure ref to the element
              ref={(el) => virtualizer.measureElement(el)}
              // 3. Use data-index so the virtualizer knows which index this belongs to
              data-index={virtualItem.index}
              className={itemClassName}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                // 4. Use virtualItem.start for the Y-axis position
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {item === '__placeholder__' ? (
                <Placeholder /> // Original skeleton
              ) : item === '__loader__' ? (
                <LoadMore visible={!isLoading} onClick={onLoadMore} />
              ) : (
                item
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default ScrollableList2;