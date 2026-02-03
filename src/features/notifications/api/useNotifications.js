import { useInfiniteQuery, useQueryClient, useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { useIdleTimer } from '@/hooks/useIdleTimer';
import { useStatusImporter } from '@/features/statuses/hooks/useStatusImporter';

//2. For the actual feed, you don't want the list to "jump" while the user is reading. 
// Use polling to detect new items and show a "Show New Notifications" toast. 
export const useNotifications = () => {
  const queryClient = useQueryClient();

  return useInfiniteQuery({
    queryKey: ['notifications', 'list'],
    queryFn: fetchNotifications,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    
    // Poll for the "first page" only every 60 seconds
    refetchInterval: 60000, 
    
    // When new data arrives, we can trigger a UI "toast"
    onSuccess: (data) => {
       // logic to compare with previous data and show 'New Items' toast
    }
  });
};
//=======================================================================


export const useNotifications2 = (isUserIdle) => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/notifications');
      return data;
    },
    // The polling logic stays here
    refetchInterval: () => (window.onLine && !isUserIdle ? 30000 : false),
    
    // Optional: Keep old data on screen while polling in background
    placeholderData: (previousData) => previousData,
  });
};

///3. Smart Polling Control
// You can dynamically start or stop polling based on app state 
// (e.g., stop polling if the user is in "Do Not Disturb" mode or the compose modal is open). 


/*
Key Benefits over Redux

    Intelligent Pausing: TanStack Query automatically pauses polling when the window is out of focus to save server resources.
    Automatic Retries: If a poll fails due to a network blip, it retries automatically without you writing any "retry-reducer" logic.
    Simple Cleanup: The polling stops the moment the component using the hook unmounts. 

*/

//=======================================================================================================

// 2. Combine Smart Polling with Idle Detection
// Pause polling when the user is idle for more than 1 minute

export const useNotifications3 = () => {
  const isIdle = useIdleTimer(60000); // 1 minute threshold

  return useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    // SMART POLLING: 
    // 1. Must be online
    // 2. Must NOT be idle
    refetchInterval: () => (window.onLine && !isIdle ? 30000 : false),
    
    // Refetch when they come back to the tab
    refetchOnWindowFocus: true, 
  });
};

/*
3. Why this is superior for a Social App:

    1. Server Efficiency: If 1,000 users leave your site open in a background tab, 
    your server won't get hit 1,000 times every 30 seconds.
    2. Battery Life: For mobile users, stopping the network requests when they aren't l
    ooking at the screen saves significant battery.
    3. Declarative Logic: In Redux, you would need setInterval, clearInterval, and complex middleware.
     Here, the refetchInterval is just a piece of configuration that reacts to state.
*/
//=======================================================================================================

// Since notifications often include "New Followers" or "New Mentions," do you want to see how to 
// use the importFetchedStatuses logic we built earlier inside the notification query to seed 
// the cache with those new users?
export const useNotifications4 = () => {
  const { importStatusEntities } = useStatusImporter(); // Reuse the logic we built
  const queryClient = useQueryClient();

  return useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get('/api/v1/notifications', {
        params: { max_id: pageParam }
      });

      // Side-load everything inside the notification objects
      data.forEach((notification) => {
        // 1. Seed the Account (Follower/Mentioner)
        if (notification.account) {
          queryClient.setQueryData(['accounts', notification.account.id], notification.account);
        }

        // 2. Seed the Status (if it's a Mention or Favorite)
        if (notification.status) {
          importStatusEntities(notification.status);
        }
      });

      return data;
    },
    // ... polling and pagination config
  });
};

/*
2. Why this is critical for Social UX:

    1. Zero-Loading Navigation: When a user sees a notification "John Doe followed you" and clicks John's name, the useAccount(JohnId) 
       hook will find the data in the cache. The Account Profile Header will render without a loading spinner.
    2. Relationship Sync: Since you are seeding the account, your useRelationship(JohnId) hook can also be
        pre-filled with the "Following" status, making the "Follow Back" button appear correctly right away.
*/
/*
useage:
const NotificationToast = () => {
  const { data, isRefetching } = useNotifications();
  
  // Logic: If we are refetching and the first item ID has changed, 
  // we have new content!
  if (isRefetching && hasNewItems(data)) {
    return <div className="toast">New notifications available!</div>;
  }
  return null;
};
*/
//=======================================================================================================

/*
1. The Core Hook with Filtering
Your current slice handles filters like "mentions" or "follows." 
In TanStack Query, we pass the exclude_types or types as part of the Query Key.
*/

export const useNotifications5 = (filterType = 'all') => {
  const { importStatusEntities } = useStatusImporter();
    const queryClient = useQueryClient();

  return useInfiniteQuery({
    // Query Key changes based on filter, so switching tabs is instant
    queryKey: ['notifications', filterType], 
    queryFn: async ({ pageParam }) => {
      const params = { max_id: pageParam, limit: 20 };
      
      // If filtering, add types to params (Mastodon API style)
      if (filterType !== 'all') params.types = [filterType];

      const { data } = await api.get('/api/v1/notifications', { params });
      
      // Side-load entities
      data.forEach(n => {
        if (n.status) importStatusEntities(n.status);
        if (n.account) queryClient.setQueryData(['accounts', n.account.id], n.account);
      });

      return data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage[lastPage.length - 1]?.id,
  });
};
//=======================================================================================================

/*
In TanStack Query, you replace this massive "expand" orchestration with useInfiniteQuery. 
You don't need manual isLoadingMore flags or SUCCESS/FAIL actions—the library tracks the pagination 
state and "next" links for you.
*/
//const expandNotifications 
export const useNotifications6 = () => {
  const { importStatuses, importAccounts } = useStatusImporter();
  // Get active filter from Zustand instead of getState
  const activeFilter = useSettingsStore(s => s.notifications.quickFilter.active);

  return useInfiniteQuery({
    queryKey: ['notifications', activeFilter], // Cache is unique per filter
    queryFn: async ({ pageParam }) => {
      // 1. Build Params (Ported logic from your thunk)
      const params = { max_id: pageParam, limit: 20 };
      
      if (activeFilter === 'all') {
        params.exclude_types = ['reblog', 'favourite']; // Example EXCLUDE_TYPES
      } else {
        params.types = [activeFilter];
      }

      // 2. Fetch Data
      const response = await api.get('/api/v1/notifications', { params });
      const data = response.data;

      // 3. Entity Side-loading (Replaces your reduce/import logic)
      const accounts = [];
      const statuses = [];

      data.forEach(item => {
        if (item.account) accounts.push(item.account);
        if (item.target) accounts.push(item.target);
        if (item.status) statuses.push(item.status);
      });

      importAccounts(accounts);
      importStatuses(statuses);

      // 4. Group Relationships (fetchRelatedRelationships logic)
      // Instead of manual dispatch, we just invalidate the relationship queries
      queryClient.invalidateQueries({ 
        queryKey: ['relationships', accounts.map(a => a.id)] 
      });

      return {
        data,
        nextMaxId: extractMaxIdFromLink(response.headers.link) // Utility to parse Link header
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextMaxId ?? undefined,
  });
};

/*
const NotificationList = () => {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useNotifications();

  return (
    <div onScroll={handleScroll}>
      {data?.pages.map(page => 
        page.data.map(n => <NotificationItem key={n.id} notification={n} />)
      )}
      
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </button>
      )}
    </div>
  );
};
*/
/*
1. Implicit State: In your notificationsSlice.js, you had to store next in the Redux state.
 Here, it stays attached to the data chunk it belongs to.
2. Referential Integrity: If you have multiple notification tabs (All, Mentions), 
each one tracks its own nextMaxId automatically without them overwriting each other 
in a single Redux next variable.
3. Automatic "Empty" Handling: If the header is missing or there's no "next" rel, 
returning undefined from getNextPageParam automatically sets hasNextPage to false, 
allowing your UI to show "End of notifications."
*/
//=======================================================================================================
//"Muted Notifications"
//1. The Notification Filter Logic
//In your useNotifications.js, you can filter out actors who are muted. This replaces the manual 
// filtering logic in your notificationsSlice.js.
// src/features/notifications/api/useNotifications.js

export const useNotifications = (filterType = 'all') => {
  return useInfiniteQuery({
    queryKey: ['notifications', filterType],
    queryFn: fetchNotifications,
    // THE FILTERING ENGINE
    select: (data) => {
      return {
        ...data,
        pages: data.pages.map(page => ({
          ...page,
          // Remove notifications from accounts that are marked as muted
          items: page.items.filter(notification => {
            const isMuted = notification.account?.muted || false;
            // Also filter out notifications about statuses from muted accounts
            const isStatusMuted = notification.status?.account?.muted || false;
            
            return !isMuted && !isStatusMuted;
          })
        }))
      };
    },
    // ... pagination config
  });
};
//=======================================================================
// "Window Focus Refetching"
// src/features/notifications/api/useNotifications.js
export const useNotifications = () => {
  return useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    // Ensure notifications are ALWAYS fresh when the user returns
    refetchOnWindowFocus: 'always', 
  });
};

/*
3. Customizing the Focus Manager
If you are building a desktop wrapper (like Electron or a PWA), you can customize what "focus" means to the app.

import { focusManager } from '@tanstack/react-query';

// Example: Only trigger refetch if the app is visible and NOT in "Do Not Disturb" mode
focusManager.setEventListener((onFocus) => {
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('focus', () => onFocus(), false);
  }
});

*/

//=============================================================================================
// Action Grouping
// Action Grouping, you use TanStack Query’s select option to transform the raw notification feed 
// into a "grouped" view. Instead of 10 separate notifications for likes or group requests, 
// you merge them into a single, clean item.

// /The Grouping Logic
// In your useNotifications.js, you can group consecutive "Like" or "Group Request" notifications 
// by their target (the status or the group

// src/features/notifications/api/useNotifications.js
export const useNotifications = (filterType = 'all') => {
  return useInfiniteQuery({
    queryKey: ['notifications', filterType],
    queryFn: fetchNotifications,
    select: (data) => ({
      ...data,
      pages: data.pages.map(page => ({
        ...page,
        // TRANSFORM: Group consecutive similar notifications
        items: groupNotifications(page.items)
      }))
    })
  });
};

const groupNotifications = (items) => {
  return items.reduce((acc, current) => {
    const last = acc[acc.length - 1];

    // Logic: Group if same type (e.g., 'favourite') and same target (status id)
    if (last && last.type === current.type && last.status?.id === current.status?.id) {
      // Add the account to the existing group instead of creating a new row
      last.groupAccounts = [...(last.groupAccounts || [last.account]), current.account];
      return acc;
    }

    acc.push(current);
    return acc;
  }, []);
};
/*
const NotificationItem = ({ notification }) => {
  const accounts = notification.groupAccounts || [notification.account];
  const count = accounts.length;

  return (
    <div className="notification-row">
      <div className="avatar-stack">
        {accounts.slice(0, 3).map(acc => <img src={acc.avatar} key={acc.id} />)}
      </div>
      <p>
        <strong>{accounts[0].username}</strong> 
        {count > 1 && ` and ${count - 1} others`} 
        {notification.type === 'favourite' ? ' liked your post' : ' requested to join'}
      </p>
    </div>
  );
};

Direct Action: Call queryClient.invalidateQueries({ queryKey: ['notifications'] }) inside 
your useAuthorizeEventRequest success block to ensure grouped requests update instantly.

*/
//==================================================================================
// src/features/notifications/api/useNotifications.js
export const useNotifications = (filter = 'all') => {
  const { importStatusEntities } = useStatusImporter();

  return useInfiniteQuery({
    queryKey: ['notifications', filter],
    queryFn: async ({ pageParam }) => {
      const { data, headers } = await api.get('/api/v1/notifications', {
        params: { max_id: pageParam, types: filter === 'all' ? undefined : [filter] }
      });

      // SIDE-LOADING: Seed the cache so relationships are ready
      // Replaces the manual .reduce and fetchRelatedRelationships logic
      const accounts = data.flatMap(n => [n.account, n.target].filter(Boolean));
      const statuses = data.map(n => n.status).filter(Boolean);
      importStatusEntities([...statuses, ...accounts]);

      return {
        items: data,
        next: extractMaxIdFromLink(headers.get('Link')),
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.next,
  });
};

//==================================================================================
//"Notification Grouping"
//To implement Notification Grouping (e.g., "5 people liked your post" instead of 5 separate rows),
//  you use the TanStack Query select option. This allows you to transform the flat array from
//  the Kollective/Mastodon API into a grouped structure before it reaches your UI.
// src/features/notifications/api/useNotifications.js

export const useNotifications = (filter = 'all') => {
  return useInfiniteQuery({
    queryKey: ['notifications', filter],
    queryFn: fetchNotificationsApi,
    // THE TRANSFORMATION ENGINE
    select: (data) => ({
      ...data,
      pages: data.pages.map(page => ({
        ...page,
        items: groupNotifications(page.items)
      }))
    }),
    // ... pagination config
  });
};

const groupNotifications = (notifications) => {
  return notifications.reduce((acc, current) => {
    const last = acc[acc.length - 1];
    
    // Group if: same type (favourite/reblog) AND same target status
    const canGroup = last && 
      last.type === current.type && 
      ['favourite', 'reblog'].includes(current.type) &&
      last.status?.id === current.status?.id;

    if (canGroup) {
      // Append the new account to the existing group
      last.groupAccounts = [...(last.groupAccounts || [last.account]), current.account];
      return acc;
    }

    acc.push(current);
    return acc;
  }, []);
};
/*
const NotificationItem = ({ notification }) => {
  const accounts = notification.groupAccounts || [notification.account];
  const isGrouped = accounts.length > 1;

  return (
    <div className="notification-row">
      <div className="avatar-stack">
        {accounts.slice(0, 3).map(acc => (
          <img key={acc.id} src={acc.avatar} className="stacked-avatar" />
        ))}
      </div>
      <p>
        <strong>{accounts[0].username}</strong>
        {isGrouped && ` and ${accounts.length - 1} others`}
        {notification.type === 'favourite' ? ' liked your post' : ' boosted your post'}
      </p>
    </div>
  );
};

*/
//==================================================================================
// /Notification Filtering
//(e.g., "Only Mentions" or "Only Boosts"), you leverage TanStack Query's Query Keys. This allows you to cache each filter type (Mentions, Likes, Follows) independently.

// src/features/notifications/api/useNotifications.js
export const useNotifications = (activeFilter = 'all') => {
  return useInfiniteQuery({
    // Partitions cache by filter: ['notifications', 'mention'], ['notifications', 'favourite']
    queryKey: ['notifications', activeFilter],
    queryFn: async ({ pageParam }) => {
      const params = {
        max_id: pageParam,
        limit: 30,
        // If filter isn't 'all', pass the specific type to the API
        types: activeFilter === 'all' ? undefined : [activeFilter],
      };

      const { data, headers } = await api.get('/api/v1/notifications', { params });

      return {
        items: data,
        next: extractMaxIdFromLink(headers.get('Link')),
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.next,
    // Keep filter results in memory for 10 minutes
    staleTime: 1000 * 60 * 10, 
  });
};
/*
 Implementation: The Quick-Filter Bar
Since the filtering happens at the API level but is cached locally, clicking "Mentions"
 will show a spinner the first time, but will be instant every time after that.

const NotificationFilters = ({ currentFilter, onFilterChange }) => {
  const filters = ['all', 'mention', 'favourite', 'reblog', 'follow'];

  return (
    <div className="filter-tabs">
      {filters.map(f => (
        <button 
          key={f}
          className={currentFilter === f ? 'active' : ''}
          onClick={() => onFilterChange(f)}
        >
          {f.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

*/
//==================================================================================
// /makeGetNotification

// src/features/notifications/api/useNotifications.js
// Inside the 'select' of useInfiniteQuery
select: (data) => ({
  ...data,
  pages: data.pages.map(page => ({
    ...page,
    items: page.items.map(notification => ({
      ...notification,
      // Ensure nested entities are mapped correctly from the sideloaded cache
      account: notification.account,
      target: notification.target || null,
      status: notification.status || null,
    }))
  }))
})




