import { memo } from 'react';

/** Simplified skeleton for a link preview card. */
const PlaceholderCard = memo(() => (
  <div className="flex overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 animate-pulse h-24">
    {/* Left side: Image placeholder */}
    <div className="w-1/3 bg-gray-100 dark:bg-gray-800" />

    {/* Right side: Text lines */}
    <div className="flex-1 p-3 space-y-2 flex flex-col justify-center">
      <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
      <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded" />
      <div className="h-2 w-1/2 bg-gray-100 dark:bg-gray-800 rounded" />
    </div>
  </div>
));

export default PlaceholderCard;
