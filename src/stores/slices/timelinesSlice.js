// Simple sample implementation (pick random element from array)
import { normalizeStatus } from "../../normalizers/status.js";
import { shouldFilter } from "../../utils/timelines.js";
import { getIn } from "../../utils/immutableSafe.js";
import { get } from "lodash";

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

const TRUNCATE_LIMIT = 40;
const TRUNCATE_SIZE = 20;

const MAX_QUEUED_ITEMS = 40;

//const TimelineRecord 
const createDefaultTimeline = () => ({
  unread: 0,
  online: false,
  top: true,
  isLoading: false,
  hasMore: true,
  next: undefined,
  prev: undefined,
  items: [],              // Standard Array
  queuedItems: [],        // Standard Array
  totalQueuedItemsCount: 0,
  loadingFailed: false,
  isPartial: false,
});

const getTimelinesForStatus = (status) => {
  switch (status.visibility) {
    case "group":
      return [`group:${status.group?.id || status.group_id}`];
    case "direct":
      return ["direct"];
    case "public":
      return ["home", "community", "public"];
    default:
      return ["home"];
  }
};

const replaceId = (ids, oldId, newId) => {
  const list = [...ids];
  const index = list.indexOf(oldId);

  if (index > -1) {
    return [...list.slice(0, index), newId, ...list.slice(index + 1)];
  } else {
    return ids;
  }
};

// Like `take`, but only if the collection's size exceeds truncateLimit
const truncate = (items, truncateLimit, newSize) =>
  items.size > truncateLimit ? items.take(newSize) : items;

const truncateIds = (items) => truncate(items, TRUNCATE_LIMIT, TRUNCATE_SIZE);

const addStatusId = (queuedIds, statusId) => {
  // Example implementation: adds statusId to an array of IDs
  return [...queuedIds, statusId];
};

const getStatusIds = (statuses) => {
  // 1. Map: Extracts the 'id' property using standard JS array map
  const idsArray = statuses.map((status) => status.id);

  // 2. toOrderedSet(): Converts the resulting array into a standard JavaScript Set
  const idsSet = new Set(idsArray);

  return idsSet;
};

const shouldDelete = (timelineId, excludeAccount) => {
  if (!excludeAccount) return true;
  if (timelineId === `account:${excludeAccount}`) return false;
  if (timelineId.startsWith(`account:${excludeAccount}:`)) return false;
  return true;
};

const performDelete = (state, statusId, references, excludeAccount) => {
  // 1. Iterate through all timelines in the current slice
  Object.keys(state).forEach(timelineId => {
    if (shouldDelete(timelineId, excludeAccount)) {
      const timeline = state[timelineId];
      
      // Use standard JS .filter() to remove the ID (OrderedSet.delete equivalent)
      if (timeline?.items) {
        timeline.items = timeline.items.filter(id => id !== statusId);
      }
      if (timeline?.queuedItems) {
        timeline.queuedItems = timeline.queuedItems.filter(id => id !== statusId);
      }
    }
  });

  // 2. Recursively remove reblogs/references
  if (references && Array.isArray(references)) {
    references.forEach(ref => {
      // ref[0] is the statusId of the reference
      // We pass empty references [] for recursive calls per your original logic
      performDelete(state, ref[0], [], excludeAccount);
    });
  }
};

// Internal helper to handle the recursive deletion
// 'state' here is the Immer proxy of the timelines slice
const performDeleteStatus = (state, statusId, references, excludeAccount) => {
  // 1. Iterate over all timeline IDs in the current slice
  Object.keys(state).forEach(timelineId => {
    if (shouldDelete(timelineId, excludeAccount)) {
      const timeline = state[timelineId];
      if (timeline) {
        // Standard JS filter replaces Immutable .delete()
        timeline.items = timeline.items.filter(id => id !== statusId);
        timeline.queuedItems = timeline.queuedItems.filter(id => id !== statusId);
      }
    }
  });

  // 2. Handle recursion for reblogs/references
  if (references && (Array.isArray(references) || typeof references.forEach === 'function')) {
    references.forEach(ref => {
      // ref is [statusId, accountId]
      performDeleteStatus(state, ref[0], [], excludeAccount);
    });
  }
};

const mergeIds = (current = [], incoming = []) => {
  return [...new Set([...current, ...incoming])];
};

export const createTimelinesSlice = (setScoped, getScoped, rootSet, rootGet) => {
  const getActions = () => rootGet();
  const set = setScoped;
  const noOp = () => {};
  const noOpAsync = () => () => new Promise(f => f(undefined));

  const parseTags = (tags = {}, mode) => {
    return (tags[mode] || []).map((tag) => {
      return tag.value;
    });
  };

  return ({
    createTimelineStatusRequest(params, idempotencyKey) {
      if (!idempotencyKey) return;
      const statusId = `末pending-${idempotencyKey}`;

      setScoped((state) => {
        if (params.scheduled_at) {
          return state;
        }
        const timelineIds = getTimelinesForStatus(params);

        timelineIds.forEach((timelineId) => {
          // Initialize the specific timeline if it doesn't exist
          if (!state[timelineId]) {
             state[timelineId] = createDefaultTimeline(); // Use the factory we made earlier
          }

          const timeline = state[timelineId];

          // Standard JS Array checks
          if (timeline.queuedItems.includes(statusId)) return;
          if (timeline.items.includes(statusId)) return;

          // IMMER PATTERN: Just mutate the properties directly
          timeline.totalQueuedItemsCount += 1;
          
          // Unshift adds to the beginning (like adding to top of timeline)
          timeline.queuedItems.unshift(statusId);
          
          // Truncate if it exceeds limit
          if (timeline.queuedItems.length > TRUNCATE_LIMIT) {
            timeline.queuedItems = timeline.queuedItems.slice(0, TRUNCATE_LIMIT);
          }
        });

        // With Immer, you don't need to return { ...state } 
        // unless you are replacing the entire slice.
      });
    },

    createTimelineStatusSuccess(status, editing, idempotencyKey) {
      if (editing || !idempotencyKey || status.scheduled_at) return;
      
      const pendingId = `末pending-${idempotencyKey}`;

      setScoped((state) => {
        // 1. Replace pending IDs globally in all timelines
        Object.values(state).forEach((timeline) => {
          const itemIdx = timeline.items.indexOf(pendingId);
          if (itemIdx !== -1) timeline.items[itemIdx] = status.id;

          const queuedIdx = timeline.queuedItems.indexOf(pendingId);
          if (queuedIdx !== -1) timeline.queuedItems[queuedIdx] = status.id;
        });

        // 2. Add to relevant timelines
        const timelineIds = getTimelinesForStatus(status);
        timelineIds.forEach((timelineId) => {
          const timeline = state[timelineId];
          if (!timeline || timeline.items.includes(status.id)) return;

          // Add to top or increment unread
          timeline.items.unshift(status.id); // addStatusId equivalent
          if (timeline.top) {
            timeline.items = timeline.items.slice(0, TRUNCATE_LIMIT);
          } else {
            timeline.unread += 1;
          }
        });
      });
    },

    expandTimelineRequest(timelineId) {
      setScoped((state) => {
        if (!state[timelineId]) return;
        state[timelineId].isLoading = true;
      });
    },

    expandTimelineFail(timelineId) {
      setScoped((state) => {
        if (!state[timelineId]) return;
        state[timelineId].isLoading = false;
        state[timelineId].loadingFailed = true;
      });
    },

    expandTimelineSuccess(timelineId, statuses, next, prev, partial, isLoadingRecent) {
      setScoped((state) => {
        const timeline = state[timelineId];
        if (!timeline) return;

        const newIds = getStatusIds(statuses); // Assumes this returns a plain array

        timeline.isLoading = false;
        timeline.loadingFailed = false;
        timeline.isPartial = partial;
        timeline.next = next;
        timeline.prev = prev;
        
        if (!next && !isLoadingRecent) {
          timeline.hasMore = false;
        }

        if (timelineId.endsWith(':pinned')) {
          timeline.items = newIds;
        } else {
          // Standard JS Union (OrderedSet replacement)
          timeline.items = mergeIds(timeline.items, newIds);
        }
      });
    },

    updateTimeline(timelineId, statusId) {
      setScoped((state) => {
        const timeline = state[timelineId];
        if (!timeline || timeline.items.includes(statusId)) return;

        timeline.items.unshift(statusId);
        if (timeline.top) {
          timeline.items = timeline.items.slice(0, TRUNCATE_LIMIT);
        } else {
          timeline.unread += 1;
        }
      });
    },

    updateTimelineQueue(timelineId, statusId) {
      setScoped((state) => {
        const timeline = state[timelineId];
        if (!timeline || timeline.queuedItems.includes(statusId) || timeline.items.includes(statusId)) return;

        timeline.totalQueuedItemsCount += 1;
        timeline.queuedItems.unshift(statusId);
        timeline.queuedItems = timeline.queuedItems.slice(0, TRUNCATE_LIMIT);
      });
    },

    dequeueTimeline(timelineId) {
      setScoped((state) => {
        const timeline = state[timelineId];
        if (!timeline || timeline.queuedItems.length === 0) return;

        // Move queued to main items
        timeline.items = mergeIds(timeline.queuedItems, timeline.items);
        if (timeline.top) {
          timeline.items = timeline.items.slice(0, TRUNCATE_LIMIT);
        }
        timeline.queuedItems = [];
        timeline.totalQueuedItemsCount = 0;
      });
    },
    
    deleteTimelineX(id, references, reblogOf) {
      setScoped((state) => {
        const recursiveDelete = (statusIdToDelete) => {
          Object.values(state).forEach((timeline) => {
            // Standard Array filtering (replaces .delete)
            timeline.items = timeline.items.filter(id => id !== statusIdToDelete);
            timeline.queuedItems = timeline.queuedItems.filter(id => id !== statusIdToDelete);
          });

          // Handle recursion for references
          if (references) {
            references.forEach(([refId]) => recursiveDelete(refId));
          }
          if (reblogOf) {
            recursiveDelete(reblogOf);
          }
        };

        recursiveDelete(id);
      });
    },

    deleteStatusFromTimelines(statusId, accountId, references, excludeAccount) {
      setScoped((state) => {
        performDelete(state, statusId, references, excludeAccount);

        getActions().deleteStatus(statusId, references);
        getActions().deleteStatusesFromContext([statusId]);
        getActions().deleteStatusFromNotifications(statusId);
      });
    },

    clearTimeline(timelineId) {
      setScoped((state) => {
        if (state[timelineId]) {
          state[timelineId].items = [];
          state[timelineId].queuedItems = [];
          state[timelineId].totalQueuedItemsCount = 0;
          state[timelineId].unread = 0;
        }
      });
    },

    blockOrMuteAccountSuccess(relationship, statuses) {
      if (!relationship?.id) return;

      setScoped((state) => {
        // statuses is likely the dictionary from state.statuses
        // We iterate through all statuses to find ones belonging to the blocked/muted account
        Object.values(statuses).forEach(status => {
          if (status.account !== relationship.id) return;

          // buildReferencesTo logic: find statuses that are reblogs of this status
          const references = Object.values(statuses)
            .filter(s => s.reblog === status.id)
            .map(s => [s.id, s.account]);

          // Trigger the recursive deletion on the draft state
          performDeleteStatus(state, status.id, references, relationship.id);
        });
      });
    },

    scrollTopTimeline(timelineId, top) {
      setScoped((state) => {
        if (!state[timelineId]) return;
        state[timelineId].top = top;
        if (top) {
          state[timelineId].unread = 0;
        }
      });
    },

    connectTimeline(timelineId) {
      setScoped((state) => {
        if (!state[timelineId]) return;
        state[timelineId].online = true;
      });
    },

    disconnectTimeline(timelineId) {
      setScoped((state) => {
        if (!state[timelineId]) return;
        state[timelineId].online = false;
      });
    },

    inserttimeline(timelineId) {
      setScoped((state) => {
        const timeline = state[timelineId];
        if (!timeline) return;

        // 1. Remove existing suggestion if present (Array.filter is cleaner than splice)
        timeline.items = timeline.items.filter(id => !id.includes("末suggestions"));

        // 2. Determine insertion position
        const positionInTimeline = Math.floor(Math.random() * (9 - 5 + 1)) + 5;
        const lastItemId = timeline.items[timeline.items.length - 1];

        if (lastItemId) {
          // 3. Insert new suggestion at the random position
          timeline.items.splice(positionInTimeline, 0, `末suggestions-${lastItemId}`);
        }
      });
    },

    processTimelineUpdate(timelineId, status) {
      const root = rootGet();
      const me = root.me;
      
      // 1. Check if it's our own status and we have pending work
      const ownStatus = status.account?.id === me;
      // .size > 0 replaces .isEmpty() for standard JS Sets/Maps or .length for Arrays
      const hasPendingStatuses = root.pending_statuses?.length > 0;

      if (ownStatus && hasPendingStatuses) {
        return;
      }

      // 2. Get Settings (assuming they are in a root 'settings' slice)
      const columnSettings = root.settings?.[timelineId] || {};
      
      // 3. Filtering logic
      // Note: We use the status directly as it's now a standard JS object
      const shouldSkipQueue = !shouldFilter(status, columnSettings);

      // 4. Import the status into the global 'statuses' slice
      getActions().importFetchedStatus(status);

      // 5. Decide whether to show immediately or queue
      if (shouldSkipQueue) {
        getActions().updateTimeline(timelineId, status.id);
      } else {
        getActions().updateTimelineQueue(timelineId, status.id);
      }
    },

    updateTimelineAction(timelineId, statusId) {
      getActions().updateTimeline(timelineId, statusId);
    },

    updateTimelineQueueAction(timelineId, statusId) {
      getActions().updateTimelineQueue(timelineId, statusId);
    },

    dequeueTimelineAction(timelineId, expandFunc, optionalExpandArgs) {
      const state = rootGet();
      const timeline = state.timelines[timelineId];
      const queuedCount = timeline?.totalQueuedItemsCount || 0;

      if (queuedCount <= 0) return;

      // If the queue is manageable, just merge it
      if (queuedCount <= MAX_QUEUED_ITEMS) {
        getActions().dequeueTimeline(timelineId);
      }

      // If a specific expand function was passed (e.g. for a custom search)
      if (typeof expandFunc === "function") {
        getActions().clearTimeline(timelineId);
        expandFunc();
      } else {
        // Fallback to default timeline expansion logic
        getActions().clearTimeline(timelineId);
        if (timelineId === 'home') {
          getActions().expandFollowsTimeline(optionalExpandArgs);
        } else if (timelineId === 'community') {
          getActions().expandCommunityTimeline(optionalExpandArgs);
        }
      }
    },

    deleteFromTimelines(id) {
      const root = rootGet();
      const status = root.statuses[id];
      if (!status) return;

      const accountId = status.account?.id;
      
      // Find references (reblogs) using standard JS array methods
      // Replaces Immutable .filter().map()
      const references = Object.values(root.statuses)
        .filter(s => s.reblog === id)
        .map(s => [s.id, s.account?.id]);

      const reblogOf = root.statuses[id]?.reblog || null;

      getActions().deleteStatusFromTimelines(id, accountId, references, reblogOf);
    },

    clearTimelineAction(timelineId) { 
      getActions().clearTimeline(timelineId);
    },

    parseTags(tags, mode) {
      // Direct JS access replaces Immutable logic
      return (tags?.[mode] || []).map(tagObj => tagObj.value);
    },

    async expandTimeline(timelineId, path, params = {}, done = () => {}) {
        const root = rootGet();
        const timeline = root.timelines[timelineId];
        const isLoadingMore = !!params.max_id;

        // 1. Guard against double-loading
        if (timeline?.isLoading) {
          done();
          return;
        }

        // 2. Pagination Logic
        // If we aren't loading more/pinned/recent, try to fetch since the last known ID
        if (!params.max_id && 
            !params.pinned && 
            timeline?.items?.length > 0 && 
            !path.includes('max_id=')) 
        {
          params.since_id = timeline.items[0];
        }

        const isLoadingRecent = !!params.since_id;

        // 3. Trigger Request Action
        getActions().expandTimelineRequest(timelineId, isLoadingMore);

        try {
          // Construct URL
          const query = new URLSearchParams(params).toString();
          const url = query ? `${path}?${query}` : path;

          const res = await fetch(url, { method: "GET" });
          
          if (!res.ok) throw new Error(`Failed to expand timeline (${res.status})`);

          // Assume res.pagination() is a custom helper provided by your API wrapper
          const { next, prev } = res.pagination ? res.pagination() : {};
          const data = await res.json();

          // 4. Import Data into root slices
          getActions().importFetchedStatuses?.(data || []);
          
          // Handle Group Relationships if applicable
          const groupIds = (data || [])
            .filter(status => !!status.group)
            .map(status => status.group.id);
            
          if (groupIds.length > 0) {
            getActions().groupsfetchGroupRelationships?.(groupIds);
          }

          // 5. Success Action
          getActions().expandTimelineSuccess(
            timelineId,
            data || [],
            next,
            prev,
            res.status === 206, // isPartial if status is 206
            isLoadingRecent,
            isLoadingMore,
          );

          done();
          return data;
        } catch (error) {
          // 6. Fail Action
          getActions().expandTimelineFail(timelineId, error, isLoadingMore);
          console.error("timelinesSlice.expandTimeline failed", error);
          done();
        }
    },

    expandFollowsTimeline({ url, maxId } = {}, done = () => {}) {
      const endpoint = url || '/api/v1/timelines/home';
      const params = {};

      if (!url && maxId) {
        params.max_id = maxId;
      }

      // Call the base expandTimeline via the root actions
      return getActions().expandTimeline('home', endpoint, params, done);
    },

    expandPublicTimeline({ url, maxId, onlyMedia, language } = {}, done = () => {}) {
      const timelineKey = `public${onlyMedia ? ':media' : ''}`;
      const endpoint = url || '/api/v1/timelines/public';
      
      const params = url ? {} : { 
        max_id: maxId, 
        only_media: !!onlyMedia, 
        language: language || undefined 
      };

      return getActions().expandTimeline(timelineKey, endpoint, params, done);
    },

    expandRemoteTimeline(instance, { url, maxId, onlyMedia } = {}, done = () => {}) {
      const timelineKey = `remote${onlyMedia ? ':media' : ''}:${instance}`;
      const endpoint = url || '/api/v1/timelines/public';
      const params = url ? {} : { 
        local: false, 
        instance: instance, 
        max_id: maxId, 
        only_media: !!onlyMedia 
      };

      return getActions().expandTimeline(timelineKey, endpoint, params, done);
    },

    expandCommunityTimeline({ url, maxId, onlyMedia } = {}, done = () => {}) {
      const timelineKey = `community${onlyMedia ? ':media' : ''}`;
      const endpoint = url || '/api/v1/timelines/public';
      const params = url ? {} : { 
        local: true, 
        max_id: maxId, 
        only_media: !!onlyMedia 
      };

      return getActions().expandTimeline(timelineKey, endpoint, params, done);
    },

    expandDirectTimeline({ url, maxId } = {}, done = () => {}) {
      const endpoint = url || '/api/v1/timelines/direct';
      const params = url ? {} : { max_id: maxId };

      return getActions().expandTimeline('direct', endpoint, params, done);
    },

    expandAccountTimeline(accountId, { url, maxId, withReplies } = {}, done = () => {}) {
      const timelineKey = `account:${accountId}${withReplies ? ':with_replies' : ''}`;
      const endpoint = url || `/api/v1/accounts/${accountId}/statuses`;
      const params = url ? {} : { 
        max_id: maxId, 
        exclude_replies: !withReplies 
      };

      return getActions().expandTimeline(timelineKey, endpoint, params, done);
    },

    expandAccountFeaturedTimeline(accountId, done = () => {}) {
      const timelineKey = `account:${accountId}:pinned`;
      const endpoint = `/api/v1/accounts/${accountId}/statuses`;
      const params = { pinned: true, with_muted: true };

      return getActions().expandTimeline(timelineKey, endpoint, params, done);
    },

    expandAccountMediaTimeline(accountId, { url, maxId } = {}, done = () => {}) {
      const timelineKey = `account:${accountId}:media`;
      const endpoint = url || `/api/v1/accounts/${accountId}/statuses`;
      const params = url ? {} : { 
        max_id: maxId, 
        only_media: true, 
        limit: 40, 
        with_muted: true 
      };

      return getActions().expandTimeline(timelineKey, endpoint, params, done);
    },

    expandListTimeline(id, { url, maxId } = {}, done = () => {}) {
      const timelineKey = `list:${id}`;
      const endpoint = url || `/api/v1/timelines/list/${id}`;
      const params = url ? {} : { max_id: maxId };

      return getActions().expandTimeline(timelineKey, endpoint, params, done);
    },

    expandGroupTimeline(id, { maxId } = {}, done = () => {}) {
      const timelineKey = `group:${id}`;
      const endpoint = `/api/v1/timelines/group/${id}`;
      const params = { max_id: maxId };

      return getActions().expandTimeline(timelineKey, endpoint, params, done);
    },

    expandGroupFeaturedTimeline(id, done = () => {}) {
      const timelineKey = `group:${id}:pinned`;
      const endpoint = `/api/v1/timelines/group/${id}`;
      const params = { pinned: true };

      return getActions().expandTimeline(timelineKey, endpoint, params, done);
    },
    
    expandGroupTimelineFromTag(id, tagName, { maxId } = {}, done = () => {}) {
      const timelineKey = `group:tags:${id}:${tagName}`;
      const endpoint = `/api/v1/timelines/group/${id}/tags/${tagName}`;
      const params = { max_id: maxId };

      return getActions().expandTimeline(timelineKey, endpoint, params, done);
    },

    expandGroupMediaTimeline(id, { maxId } = {}, done = () => {}) {
      const timelineKey = `group:${id}:media`;
      const endpoint = `/api/v1/timelines/group/${id}`;
      const params = { 
        max_id: maxId, 
        only_media: true, 
        limit: 40, 
        with_muted: true 
      };

      return getActions().expandTimeline(timelineKey, endpoint, params, done);
    },
    
    expandHashtagTimeline(hashtag, { url, maxId, tags } = {}, done = () => {}) {
      const timelineKey = `hashtag:${hashtag}`;
      const endpoint = url || `/api/v1/timelines/tag/${hashtag}`;
      
      // Use the parseTags helper to extract values for the API params
      const params = url ? {} : {
        max_id: maxId,
        any: getActions().parseTags(tags, 'any'),
        all: getActions().parseTags(tags, 'all'),
        none: getActions().parseTags(tags, 'none'),
      };

      return getActions().expandTimeline(timelineKey, endpoint, params, done);
    },

    insertSuggestionsIntoTimeline() {
      // Direct call to the insertTimeline action logic
      return getActions().insertTimeline('home');
    },
  });
};
