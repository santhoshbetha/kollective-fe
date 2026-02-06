// src/features/scheduled-statuses/index.jsx

//soapbox schedulde-statuses reduction

/*
The scheduled-statuses feature can be significantly reduced by 
treating scheduled posts as a "future-dated" variation of the standard status timeline.
*/

/*
1. Reuse the Generic Timeline Hook
Scheduled statuses use a specific Mastodon API endpoint (/api/v1/scheduled_statuses), but the data structure (pagination, loading, and error states) is identical to your main feed.

    Action: Delete any feature-specific fetching logic in this folder.
*/

import React from 'react';
import { useTimeline } from '@/hooks/useTimeline';
import { Status } from '@/features/status';

const ScheduledStatusesPage = () => {
  const { items, isLoading, loadMore } = useTimeline('/api/v1/scheduled_statuses');

  return (
    <div className="scheduled-statuses-container">
      <h1 className="p-4 font-bold">Scheduled Posts</h1>
      {items.map(s => (
        <Status key={s.id} status={s} scheduled={true} />
      ))}
      <button onClick={loadMore} disabled={isLoading}>Load More</button>
    </div>
  );
};

export default ScheduledStatusesPage;

//================================================================
import React from 'react';
import { useTimeline } from '@/hooks/useTimeline';
import { Status } from '@/features/status';

/*
To ensure the
useTimeline hook can handle the /api/v1/scheduled_statuses endpoint (and others like it),
 we need to make it generic enough to handle different JSON structures.

While standard timelines return a list of Statuses, the scheduled endpoint returns Scheduled Statuses, 
which have a slightly different data shape (the actual status content is nested inside a params object).


*/

const ScheduledStatusesPage = () => {
  const { items, isLoading, loadMore } = useTimeline('/api/v1/scheduled_statuses');

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">Scheduled Posts</h1>

      {items.length === 0 && !isLoading && (
        <p className="text-gray-500">No scheduled posts found.</p>
      )}

      {items.map((item) => (
        /* 
           Scheduled items wrap the status in 'params'. 
           We pass that to our reduced Status component. 
        */
        <Status 
          key={item.id} 
          initialStatus={item.params || item} 
          scheduledId={item.id}
          scheduledAt={item.scheduled_at}
        />
      ))}

      {items.length > 0 && (
        <button 
          onClick={loadMore} 
          className="mt-4 p-2 text-blue-500 hover:underline"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Load older scheduled posts'}
        </button>
      )}
    </div>
  );
};

export default ScheduledStatusesPage;

/*
Why this is the "Reduced" Winner:

    Endpoint Agnostic: This hook works for Home, Local, Federated, Bookmarks, Favorites, and Scheduled statuses.
    Logic Deletion: You can delete all the specialized "fetcher" logic inside src/features/scheduled-statuses.
    Vite Optimized: Since this is a pure JS hook, Vite handles it as a standard module, and the .jsx file consumes it efficiently.
*/

//=============================================================================================
/*
 "Delete/Cancel" button to the Status component specifically for these scheduled items
*/
/*
To add the
"Cancel" functionality, you extend the useStatusActions hook with a dedicated deletion method 
for scheduled IDs. This allows you to remove the CancelButton.js file from the scheduled-statuses feature folder.

3. Connecting it in scheduled-statuses/index.jsx
When you map through your items, pass a simple removal function to update the local list without a full page refresh.
*/
// src/features/scheduled-statuses/index.jsx
const { items, setItems, isLoading } = useTimeline('/api/v1/scheduled_statuses');

const handleRemove = (id) => {
  setItems(prev => prev.filter(item => item.id !== id));
};

return (
  <Stack>
    {items.map(item => (
      <Status 
        key={item.id}
        initialStatus={item.params} 
        scheduledId={item.id}
        scheduledAt={item.scheduled_at}
        onRemove={handleRemove}
      />
    ))}
  </Stack>
);
/*
What you've successfully reduced:

    Removed: CancelButton.js, EditButton.js, and ScheduledStatus.js.
    Consolidated: All scheduled logic now lives inside the shared Status component and Status action hook.
    Vite Impact: Smaller dependency graph results in faster cold starts on the Vite dev server.

    Would you like to tackle the mutes or blocks features next? They can be reduced using
    the exact same useTimeline + EntityCard pattern.
*/
