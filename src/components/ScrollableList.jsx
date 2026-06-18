import React, { forwardRef, useRef, useMemo, useEffect } from 'react';
import { useHistory } from 'react-router-dom'; // Adjust based on your router version
import { useVirtualizer, useWindowVirtualizer } from '@tanstack/react-virtual'; // Example import path
import LoadMore from './LoadMore';
import Spinner from "@/components/ui/spinner";
import PlaceholderStatus from './placeholder/PlaceholderPost';

const ScrollableList = forwardRef(({
  scrollKey,
  prepend = null,
  alwaysPrepend,
  children,
  isLoading,
  emptyMessage,
  emptyMessageCard = true,
  showLoading = true,
  onScrollToTop,
  onLoadMore,
  className,
  listClassName,
  itemClassName,
  id,
  hasMore,
  placeholderComponent: Placeholder = PlaceholderStatus,  // Default to our new skeleton
  placeholderCount =  3, // Show 3 skeletons while loading next page
  useWindowScroll = true,
  style = {},
}, ref) => {
  const history = useHistory();
  const parentRef = useRef(null);
  
  const scrollDataKey = `soapbox:scrollData:${scrollKey}`;
  const scrollData = useMemo(() => JSON.parse(
                                  sessionStorage.getItem(scrollDataKey) || 'null'), 
                                  [scrollDataKey]
                                );

  const elements = React.Children.toArray(children);
  const showPlaceholder = showLoading && Placeholder && placeholderCount > 0;
  
  // Data array normalization
  // Prepare the data array (includes items and a potential loader slot)
  const data = useMemo(() => {
    //if (showPlaceholder) return Array(placeholderCount).fill(null);

    const base = [...elements];
    // Push loading indicator into data array for virtualization
    /*
    Below  ensures the LoadMore button or Spinner only appears when 
    there is actually more data to fetch from the Elixir API.
    */
    //if (hasMore/* && (isLoading || true)*/) { 
    //  base.push('__loader__');
    //}

    //We modify how the data array is constructed. Instead of just a single __loader__ string, 
    // we fill the "loading slot" with a specified number 
    // of skeleton placeholders (usually 3–5) to match the height of real posts.
    if (hasMore && (isLoading || showLoading)) { 
      // Push 'placeholder' strings into the array so the virtualizer 
      // reserves space for the skeletons
      const skeletons = Array(placeholderCount).fill('__placeholder__');
      base.push(...skeletons);
    }
    return base;
  }, [elements, hasMore, isLoading,  showLoading, placeholderCount]);

  const virtualizer = (useWindowScroll ? useWindowVirtualizer : useVirtualizer)({
    count: data.length,
    getScrollElement: () => (useWindowScroll ? window : parentRef.current),
    estimateSize: () => 100, 
    overscan: 5,
  });

  // Expose virtualizer via ref
  React.useImperativeHandle(ref, () => virtualizer);

  // Scroll Restoration
  useEffect(() => {
    if (scrollData && history.action === 'POP') {
      virtualizer.scrollToOffset(scrollData.offset);
    }
  }, []);

  // Save Scroll Position on Unmount
  useEffect(() => {
    return () => {
      if (scrollKey) {
        const offset = virtualizer.scrollElement?.scrollY || virtualizer.scrollElement?.scrollTop || 0;
        sessionStorage.setItem(scrollDataKey, JSON.stringify({ offset }));
      }
    };
  }, [virtualizer, scrollKey]);

  // Infinite Scroll Trigger
  const virtualItems = virtualizer.getVirtualItems();
  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (lastItem && lastItem.index >= data.length - 1 && hasMore && !isLoading && onLoadMore) {
      onLoadMore();
    }
  }, [virtualItems, data.length, hasMore, isLoading, onLoadMore]);

  if (data.length === 0 && !isLoading) {
    return (
      <div className="mt-2">
        {alwaysPrepend && prepend}
        {emptyMessageCard ? <Card size="lg">{emptyMessage}</Card> : emptyMessage}
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
         //const isLoader = item === '__loader__';
         const isPlaceholder = item === '__placeholder__';

          return (
            <div
              key={virtualItem.key}
              className={itemClassName}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {isPlaceholder ? <Placeholder slim/> : 
               //isLoader ? (isLoading ? <Spinner /> : <LoadMore onClick={onLoadMore} />) : 
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
Key Changes Made:
1. Headless Implementation: Used useWindowVirtualizer (or useVirtualizer if useWindowScroll is false)
   to calculate item positions.
2. Scroll Preservation: Replaced Virtuoso's initialTopMostItemIndex with an useEffect calling 
   virtualizer.scrollToOffset using your sessionStorage logic.
3. Infinite Loading: Replaced endReached with an useEffect that monitors the last item in 
   virtualizer.getVirtualItems().
4. Ref Forwarding: Since VirtuosoHandle is proprietary, the ref now exposes the TanStack virtualizer 
   instance.
*/

/*
@tanstack/react-virtual requires an estimateSize. If your list items have highly variable heights,
ensure you use the measureElement function provided by the virtualizer for the best performance
and to avoid "jumpy" scrolling.

*/

//==========================================================================================

/* use this in the above for  below: 

 integrated an Intersection Observer hook
 into the LoadMore component to trigger loading automatically when it enters the viewport

1. Sentinel Pattern: The LoadMore component acts as a "sentinel." When it scrolls into view, 
the browser notifies your code via the IntersectionObserver.
2. rootMargin: Adding a margin (e.g., 200px) allows the next page to start loading before 
the user actually hits the bottom, creating a smoother "infinite" feel.
3. Performance: This is much more efficient than listening to scroll events, as the browser
   only runs the callback when the intersection state changes. 

*/
// ... inside ScrollableList.jsx renderItem or map ...
/*
{virtualItems.map((virtualItem) => {
  const item = data[virtualItem.index];
  const isLoader = item === '__loader__';

  return (
    <div
      key={virtualItem.key}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        transform: `translateY(${virtualItem.start}px)`,
      }}
    >
      {isLoader ? (
        <LoadMore 
          visible={hasMore && !isLoading} 
          onClick={onLoadMore} 
        />
      ) : (
        item
      )}
    </div>
  );
})}
*/

///////////////////////////////////
//after adding PlaceHoldeStatus:

/*
In your Phoenix Controller, when sending the next URL, include a limit=20 parameter. This ensures the PostgreSQL query only fetches 
enough data to fill the screen, keeping the "Skeleton-to-Real" transition extremely fast.
*/
