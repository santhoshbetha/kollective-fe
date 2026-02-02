// src/features/statuses/api/useTimeline.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { useStatusImporter } from '../hooks/useStatusImporter';
import { api } from '@/api/client'; 
import { statusSchema } from '../schemas/statusSchema';// Your axios/fetch instance
import { useAuthStore } from '../../auth/store/useAuthStore';
import { authStateSchema } from '../../auth/schemas/authSchema';
import { useFilters } from '@/features/filters/api/useFilters';


export const useHomeTimeline = () => {
  const { importFetchedStatuses } = useStatusImporter();

  return useInfiniteQuery({
    queryKey: ['statuses', 'home'],

    /*queryFn: async ({ pageParam }) => {
      const data = await fetchHomeTimeline(pageParam);
      // Process and seed cache immediately
      importFetchedStatuses(data.items); 
      return data;
    }*/

    // 1. The actual API call
    queryFn: async ({ pageParam }) => {
      // Mastodon/Soapbox uses 'max_id' for pagination
      const response = await api.get('/api/v1/timelines/home', {
        params: {
          max_id: pageParam,
          limit: 20,
        },
      });

      const statuses = response.data;

      // 2. SIDE-EFFECT: Seed the cache for all accounts/polls/quotes found
      // This is the "Redux-replacement" step
      importFetchedStatuses(statuses);

      return statuses;
    },

    // 2. Initial cursor
    initialPageParam: undefined,

    // 3. Logic to determine the NEXT page
    // We take the ID of the last status in the current list
    getNextPageParam: (lastPage) => {
      return lastPage.length > 0 ? lastPage[lastPage.length - 1].id : undefined;
    },

    // 4. StaleTime keeps the feed from refetching every time you switch tabs
    staleTime: 1000 * 60 * 2, 

    // Inside useHomeTimeline
    // If you want to filter out "Sensitive Content" or "Muted Users" globally without changing 
    // the raw data, you can use the select transformation:
    select: (data) => ({
        pages: data.pages.map(page => page.filter(status => !status.muted)),
        pageParams: data.pageParams,
    }),

  });
};

/* Usage:
const Timeline = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useHomeTimeline();

  return (
    <div className="feed">
      {data?.pages.map((page) => 
        page.map((status) => <StatusItem key={status.id} statusId={status.id} />)
      )}
      
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Show More'}
        </button>
      )}
    </div>
  );
};
*/

export const useHomeTimeline2 = () => {
  return useInfiniteQuery({
    queryKey: ['statuses', 'home'],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get('/api/v1/timelines/home', { 
        params: { max_id: pageParam } 
      });

      // Validate and Enrich every status in the array
      return data.map(rawStatus => statusSchema.parse(rawStatus));
    },
    getNextPageParam: (lastPage) => lastPage[lastPage.length - 1]?.id,
  });
};


/*
Your components become much simpler because they don't need to call getReactForStatus or reduceEmoji anymore.

const StatusActions = ({ status }) => {
  // Data is already enriched by the schema!
  const myReaction = status.myReaction;
  const allReactions = status.enrichedReactions;

  return (
    <div className="actions">
      {allReactions.map(react => (
        <Badge key={react.name} active={react.me}>
          {react.name} {react.count}
        </Badge>
      ))}
    </div>
  );
};

Why this is the "Ultimate" Migration Step:

    1. Runtime Safety: If the server sends an invalid ID or a null count, statusSchema.parse will 
       throw an error immediately, which TanStack Query will catch and display via the isError flag.
    2. Centralized Logic: If you ever change which emojis are "allowed," you change it in the schema, 
       and the entire app updates instantly.
    3. Memory Efficiency: By transforming data at the edge, you avoid re-running complex sorting/merging 
       logic on every single frame during scroll.
*/


export const useTimeline3 = () => {
  const token = useAuthStore(s => s.token);

  return useInfiniteQuery({
    queryKey: ['statuses', 'home'],
    queryFn: fetchTimeline,
    // Only fetch if Zod says the token is valid
    enabled: !!token && authStateSchema.pick({ token: true }).safeParse({ token }).success
  });
};

/*
Why this is a "Production-Grade" Migration:

    1. Crash Prevention: It stops the "White Screen of Death" caused by reading properties like user.avatar 
    when user is accidentally undefined in localStorage.
    2. Security: It acts as a basic check against session injection.
    3. Consistency: Your Zod schemas now act as the "Single Source of Truth" for your entire data flow—from Auth to Statuses to Reactions.

With this, you have a fully type-safe, validated architecture using TanStack Query (Server State) and 
Zustand (Client State).
*/

//--------------------------------------------------------------------
// /"Automatic Cache Pruning"
// /Thinking In a massive feed like a social app, scrolling for hours can lead to thousands of DOM nodes and objects in memory, eventually causing the browser to lag or crash. In
//Redux, you had to manually "slice" your arrays to prevent this. TanStack Query handles this natively via the maxPages option.

// src/features/statuses/api/useTimeline.js

export const useTimeline = (type = 'home') => {
  return useInfiniteQuery({
    queryKey: ['statuses', 'timeline', type],
    queryFn: fetchTimeline,
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage[lastPage.length - 1]?.id,

    // THE MAGIC: Limits the number of pages kept in memory
    // If set to 10, once the user scrolls to page 11, page 1 is discarded.
    maxPages: 10, 
    
    // Optional: Keep the data in 'garbage collection' for 5 minutes 
    // before it's truly deleted from the browser's RAM
    gcTime: 1000 * 60 * 5,
  });
};
/*
2. How it works with Scroll

    Going Down: As the user scrolls down, memory stays flat because old pages are evicted.
    Going Up: If the user scrolls back to the top, TanStack Query will see that Page 1 is missing and automatically refetch it using the getPreviousPageParam logic.

3. Why this is critical for Kollective-FE

    Mobile Performance: Lower-end phones have very limited RAM. Without maxPages, your app will eventually feel "heavy" and slow to respond to clicks.
    DOM Stability: By pruning the data, you can ensure your virtualized list (or standard list) doesn't have to manage 5,000 status items at once.
    Automatic Management: In your statusesSlice.js, you would have needed complex if (items.length > 500) logic. Here, it’s a single line of configuration.
*/

//=============================================

/*
2. Implementing the "Selector"
Update your useTimeline hook. The select function runs after the data is fetched but before 
it is returned to your component. 
This ensures the filtering logic is centralized and efficient.
*/

export const useTimeline = (type = 'home') => {
  const { data: filters } = useFilters();

  return useInfiniteQuery({
    queryKey: ['statuses', 'timeline', type],
    queryFn: fetchTimeline,
    // ... pagination config
    
    // THE FILTERING ENGINE
    select: (data) => {
      if (!filters || filters.length === 0) return data;

      return {
        ...data,
        pages: data.pages.map(page => ({
          ...page,
          // Remove statuses that contain muted keywords
          items: page.items.filter(status => {
            const content = (status.content + status.spoiler_text).toLowerCase();
            return !filters.some(filter => 
              content.includes(filter.phrase.toLowerCase())
            );
          })
        }))
      };
    },
  });
};
//=========================================================================
// src/features/statuses/api/useTimeline.js
export const useTimeline = (type = 'home') => {
  const { data: prefs } = usePreferences(); // Global setting: "Expand all CWs"
  
  return useInfiniteQuery({
    queryKey: ['statuses', 'timeline', type],
    queryFn: fetchTimeline,
    select: (data) => ({
      ...data,
      pages: data.pages.map(page => ({
        ...page,
        items: page.items.map(status => ({
          ...status,
          // LOGIC: Auto-expand if global setting is ON 
          // OR if the post has no spoiler text
          shouldShowContent: prefs?.['reading:expand:spoilers'] || !status.spoiler_text
        }))
      }))
    })
  });
};
/*
const StatusCard = ({ status }) => {
  // Subscribes to the specific relationship for this author
  const { data: rel } = useRelationship(status.account.id);
  
  // Local state for manual toggle
  const [manualExpand, setManualExpand] = useState(false);

  // LOGIC: Show content if manually toggled OR if the user is 'pinned' (trusted)
  const isExpanded = status.shouldShowContent || manualExpand || rel?.pinned;

  if (status.spoiler_text && !isExpanded) {
    return (
      <div className="cw-wrapper">
        <span>Content Warning: {status.spoiler_text}</span>
        <button onClick={() => setManualExpand(true)}>Show More</button>
      </div>
    );
  }

  return <div className="status-content">{status.content}</div>;
};

Scenario	                 Redux Approach	              TanStack + Local State
Global Expansion	Map through all items in reducer	Query select transformation
Individual Toggle	Dispatch EXPAND_STATUS	            useState(false) inside component
Relationship Sync	Complex multi-slice selectors	    Subscribing to ['relationship', id]
*/

//=====================================================================================
// /1. The Cache Enrichment (The "Mute Mask")
// src/features/statuses/api/useTimeline.js
export const useTimeline = (type = 'home') => {
  return useInfiniteQuery({
    queryKey: ['statuses', 'timeline', type],
    queryFn: fetchTimeline,
    select: (data) => ({
      ...data,
      pages: data.pages.map(page => ({
        ...page,
        items: page.items.map(status => ({
          ...status,
          // We mark it, but don't delete it from the array
          isMuted: status.account.muted || false 
        }))
      }))
    })
  });
};
/*
const StatusCard = ({ status }) => {
  const [revealMuted, setRevealMuted] = useState(false);

  // If the user is muted and we haven't clicked "reveal"
  if (status.isMuted && !revealMuted) {
    return (
      <div className="muted-placeholder">
        <span>Post by {status.account.acct} (Muted)</span>
        <button onClick={() => setRevealMuted(true)}>Show Post</button>
      </div>
    );
  }

  return (
    <div className="status-content">
      {/* Standard status rendering logic *//*}
      <p>{status.content}</p>
    </div>
  );
};

*/
//=====================================================================================
// Apply the validation inside your queryFn. If the server sends bad data,
// Zod will catch it before it ever reaches your UI components.
import { statusSchema } from '../schemas/accountSchemas';

export const useTimeline = (type = 'home') => {
  return useInfiniteQuery({
    queryKey: ['statuses', 'timeline', type],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get(`/api/v1/timelines/${type}`, {
        params: { max_id: pageParam }
      });

      // VALIDATION: Parse the array of statuses
      const validatedData = z.array(statusSchema).parse(data);
      
      return validatedData;
    },
    // ... pagination config
  });
};
/*
Fail Fast: You get clear console errors if an instance updates its API in a breaking way Zod Documentation.
TypeScript-like Safety: Even in plain JavaScript, Zod provides "Inferred Types" that autocomplete in your IDE.
Defaulting: Notice .default(0) in the schema—this ensures that even if the API forgets a field, your UI won't crash when trying to render a count.
*/

//=======================================================================================
//TimelineSlice replacement: 
// /Thinking
//In TanStack Query, these hundreds of lines of Redux boilerplate are replaced by a single 
// Generic Timeline Hook. You can delete the timelinesSlice, pending_statuses, 
// and all expandTimeline variations.
//The library handles the "Loading More" guards,
// "Queuing" (via refetchOnWindowFocus and staleTime), and "Cache Deletion" automatically.

// This one hook replaces all expandTimeline variations (Home, Community, Hashtag, etc.).

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useStatusImporter } from '../hooks/useStatusImporter';

export const useTimeline = (timelineId, endpoint, params = {}) => {
  const { importStatusEntities } = useStatusImporter();
  const queryClient = useQueryClient();

  return useInfiniteQuery({
    // Cache is partitioned by timelineId and specific params (e.g. onlyMedia)
    queryKey: ['statuses', 'timeline', timelineId, params],
    queryFn: async ({ pageParam }) => {
      const response = await api.get(endpoint, {
        params: { ...params, max_id: pageParam, limit: 20 }
      });

      const data = response.data;

      // SIDE-LOADING: Seed the global status/account cache
      // Replaces importFetchedStatuses(data)
      importStatusEntities(data);

      // GROUP RELATIONSHIPS: Pre-fetch group data if present
      const groupIds = data.map(s => s.group?.id).filter(Boolean);
      if (groupIds.length > 0) {
        queryClient.prefetchQuery({
          queryKey: ['groups', 'relationships', groupIds.sort()],
          queryFn: () => api.get('/api/v1/pleroma/groups/relationships', { params: { id: groupIds } })
        });
      }

      return {
        items: data,
        nextMaxId: extractMaxIdFromLink(response.headers.get('Link')),
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextMaxId ?? undefined,
    // Logic Port: "Pending Statuses" / Dequeueing logic
    // We use staleTime to keep data "fresh" without jumping the scroll
    staleTime: 1000 * 60 * 2, 
  });
};
/*
Legacy Thunk	           New Hook Usage
expandFollowsTimeline	useTimeline('home', '/api/v1/timelines/home')
expandCommunityTimeline	useTimeline('community', '/api/v1/timelines/public', { local: true })
expandAccountTimeline	useTimeline('account', '/api/v1/accounts/' + id + '/statuses')
expandHashtagTimeline	useTimeline('hashtag', '/api/v1/timelines/tag/' + tag)
*/

//=======================================================================
// src/features/statuses/api/useTimeline.js
//Irreversible Filters
// /Add a helper to distinguish between "hide" (collapse) and "irreversible" (delete) filters.
import { isIrreversible } from '@/features/filters/utils/filterHelpers';

export const useTimeline = (type) => {
  const queryClient = useQueryClient();

  return useInfiniteQuery({
    queryKey: ['statuses', 'timeline', type],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get(`/api/v1/timelines/${type}`, { 
        params: { max_id: pageParam } 
      });
      return data;
    },
    // THE SCRUBBER ENGINE
    select: (data) => {
      const allFilters = queryClient.getQueryData(['filters', 'list']) || [];
      const activeFilters = allFilters.filter(f => isFilterActive(f, type));

      return {
        ...data,
        pages: data.pages.map(page => ({
          ...page,
          // Nuke the status from the array entirely if it's irreversible
          items: page.items.filter(status => !isIrreversible(status, activeFilters))
        }))
      };
    }
  });
};



