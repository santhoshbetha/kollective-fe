import { memo } from 'react';
import clsx from 'clsx';
import HStack from 'soapbox/components/ui/hstack';
import PlaceholderPostContent from './PlaceholderPostContent';

const PlaceholderPost = memo(({ slim, isVideo = false }) => (
  <div className={clsx(
    'bg-white dark:bg-gray-900 border-b dark:border-gray-800', 
    { 'p-4': !slim, 'p-2': slim }
  )}>
    <div className='w-full animate-pulse overflow-hidden'>
      {/* 1. Header: Avatar + DisplayName */}
      <div>
        <HStack space={3} alignItems='center'>
          <PlaceholderAvatar size={42} />
          <div className='min-w-0 flex-1'>
            <PlaceholderDisplayName />
          </div>
        </HStack>
      </div>

      {/* 2. Body: Content lines */}
      <div className='mt-4'>
        {isVideo ? 
        (
          <div className="space-y-4">
            {/* The "Video Player" Pulse */}
            <div className="aspect-video w-full bg-gray-200 dark:bg-gray-800 rounded-xl" />
            {/* Minimal Caption Line */}
            <div className="h-3 w-3/4 bg-gray-100 dark:bg-gray-800 rounded" />
          </div>
        )
        : 
        <PlaceholderPostContent />}
      </div>

      {/* 3. Footer: Interaction Bar Skeletons */}
      <div className="mt-6 flex gap-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-4 w-10 bg-gray-50 dark:bg-gray-800 rounded-md" />
        ))}
      </div>
    </div>
  </div>
));

export default PlaceholderStatus;

/*

Why this is the "Pro" way:

    Zero Layout Shift: By using fixed widths (like w-32 or w-11/12) instead of randomIntFromInterval, the skeleton matches the PostgreSQL data footprint perfectly, preventing the page from jumping when the Elixir Phoenix data arrives.
    Bundle Size: You can now delete the ../utils.ts (or at least the generateText part), saving precious KBs in your Vite build.
    Dark Mode: Replaced primary-50 with gray-200 and gray-800. This looks much more native to modern Tailwind-based social apps.
*/

/*
isVideo support: (do for Video Page)

2. Integration with ScrollableList
When you are on your Video Feed page (like the Trending Videos we built), 
simply pass isVideo to the placeholderComponent.

// In TrendingVideos.jsx or VideoFeed.jsx
<ScrollableList
  id="video-feed"
  hasMore={hasMore}
  isLoading={loading}
  onLoadMore={handleLoadMore}
  placeholderComponent={() => <PlaceholderStatus isVideo={true} />}
  placeholderCount={2} // Fewer slots needed for large video cards
>
  {videoItems}
</ScrollableList>
*/