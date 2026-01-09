// Simple sample implementation (pick random element from array)
import { normalizeStatus } from "../../normalizers/status.js";
import { shouldFilter } from "../../utils/timelines.js";
import { getIn } from "../../utils/immutableSafe.js";

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

const TRUNCATE_LIMIT = 40;
const TRUNCATE_SIZE = 20;

const MAX_QUEUED_ITEMS = 40;

const TimelineRecord = {
  unread: 0,
  online: false,
  top: true,
  isLoading: false,
  hasMore: true,
  next: undefined,
  prev: undefined,
  items: new Set(),
  queuedItems: new Set(), //max= MAX_QUEUED_ITEMS
  totalQueuedItemsCount: 0, //used for queuedItems overflow for MAX_QUEUED_ITEMS+
  loadingFailed: false,
  isPartial: false,
};

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

export const createTimelinesSlice = (setScoped, getScoped, rootSet, rootGet) => {
  const set = setScoped;
  const noOp = () => {};
  const noOpAsync = () => () => new Promise(f => f(undefined));

  const parseTags = (tags = {}, mode) => {
    return (tags[mode] || []).map((tag) => {
      return tag.value;
    });
  };

  return ({
    createStatusRequest(params, idempotencyKey) {
      if (!idempotencyKey) return;
      const statusId = `末pending-${idempotencyKey}`;
      setScoped((state) => {
        if (params.scheduled_at) {
          return state;
        }
        const timelineIds = getTimelinesForStatus(params);

        timelineIds.forEach((timelineId) => {
          const queuedIds = state[timelineId]?.queuedItems || new Set();
          const listedIds = state[timelineId]?.items || new Set();
          const queuedCount = state[timelineId]?.totalQueuedItemsCount || 0;

          if (queuedIds.includes(statusId)) return state;
          if (listedIds.includes(statusId)) return state;

          // 1. Calculate the new values using your existing pure JS logic
          const newTotalCount = queuedCount + 1;
          const newQueuedIds = addStatusId(queuedIds, statusId).slice(
            0,
            TRUNCATE_LIMIT,
          ); // JS equivalent of .take()

          // 2. Create a *new* object for the specific timeline we are updating
          const updatedTimelineData = {
            // We assume the timeline record has other properties we want to preserve
            ...state[timelineId],
            totalQueuedItemsCount: newTotalCount,
            queuedItems: newQueuedIds,
          };

          // 3. Update the main 'timelines' object immutably (shallow merge in set)
          return {
            ...state, // Spread existing timelines
            [timelineId]: updatedTimelineData, // Overwrite only the specific timeline's object
          };
        });
      });
    },

    createStatusSuccess(status, editing, idempotencyKey) {
      if (editing) return;
      if (!idempotencyKey) return;
      const statusId = `末pending-${idempotencyKey}`;
      const oldId = `末pending-${idempotencyKey}`;
      setScoped((state) => {
        if (status.scheduled_at || editing) {
          return state;
        }

        const newTimelinesState = { ...state };

        // Loop through timelines and replace the pending status with the real one
        Object.keys(newTimelinesState).forEach((timelineId) => {
          const currentTimeline = newTimelinesState[timelineId];

          if (currentTimeline) {
            const updatedItemsSet = replaceId(
              currentTimeline.items,
              oldId,
              status.id,
            );

            // Update 'queuedItems' using the pure JS helper function
            const updatedQueuedSet = replaceId(
              currentTimeline.queuedItems,
              oldId,
              status.id,
            );

            // If either changed, create a *new* timeline object immutably
            if (
              updatedItemsSet !== currentTimeline.items ||
              updatedQueuedSet !== currentTimeline.queuedItems
            ) {
              state[timelineId] = {
                ...currentTimeline,
                items: updatedItemsSet,
                queuedItems: updatedQueuedSet,
              };
            }
          }
        });

        const timelineIds = getTimelinesForStatus(status);

        timelineIds.forEach((timelineId) => {
          const top = state[timelineId].top;
          const oldIds = state[timelineId]?.items || new Set();
          const unread = state[timelineId]?.unread || 0;

          if (oldIds.includes(statusId)) return state;

          const newIds = addStatusId(oldIds, statusId);

          if (top) {
            return {
              ...state,
              [timelineId]: {
                items: truncateIds(newIds),
              },
            };
          } else {
            return {
              ...state,
              [timelineId]: {
                unread: unread + 1,
                items: newIds,
              },
            };
          }
        });
      });
    },

    expandTimelineRequest(timeline) {
      if (!timeline) return;

      setScoped((state) => {
        const existingTimeline = state[timeline] || {};
        state[timeline] = { ...existingTimeline, isLoading: true };
      });
    },

    expandTimelineFail(timeline) {
      if (!timeline) return;

      setScoped((state) => {
        const existingTimeline = state[timeline] || {};
        state[timeline] = {
          ...existingTimeline,
          isLoading: false,
          loadingFailed: true,
        };
      });
    },

    expandTimelineSuccess(
      timeline,
      statuses,
      next,
      prev,
      partial,
      isLoadingRecent,
    ) {
      if (!timeline) return;

      setScoped((state) => {
        const newIds = getStatusIds(JSON.parse(JSON.stringify(statuses)));
        const existingTimeline = state[timeline] || {};
        state[timeline] = {
          ...existingTimeline,
          isLoading: false,
          loadingFailed: false,
          isPartial: partial,
          next: next,
          prev: prev,
          hasMore: !next && !isLoadingRecent ? false : state[timeline]?.hasMore,
          items: timeline.endsWith(":pinned")
            ? newIds
            : newIds?.union(existingTimeline.items),
        };
      });
    },

    updateTimeline(timeline, statusId) {
      if (!timeline || !statusId) return;
      setScoped((state) => {
        const top = state[timeline].top;
        const oldIds = state[timeline]?.items || new Set();
        const unread = state[timeline]?.unread || 0;

        if (oldIds.includes(statusId)) return state;
        const newIds = addStatusId(oldIds, statusId);

        const existingTimeline = state[timeline] || {};

        if (top) {
          state[timeline] = {
            ...existingTimeline,
            items: truncateIds(newIds),
          };
        } else {
          state[timeline] = {
            ...existingTimeline,
            unread: unread + 1,
            items: newIds,
          };
        }
      });
    },

    updateTimelineQueue(timeline, statusId) {
      if (!timeline || !statusId) return;
      setScoped((state) => {
        const queuedIds = state[timeline]?.queuedItems || new Set();
        const listedIds = state[timeline]?.items || new Set();
        const queuedCount = state[timeline]?.totalQueuedItemsCount || 0;

        if (queuedIds.includes(statusId)) return state;
        if (listedIds.includes(statusId)) return state;

        const newTotalCount = queuedCount + 1;
        const newQueuedIds = addStatusId(queuedIds, statusId).slice(
          0,
          TRUNCATE_LIMIT,
        );
        const existingTimeline = state[timeline] || {};
        state[timeline] = {
          ...existingTimeline,
          totalQueuedItemsCount: newTotalCount,
          queuedItems: newQueuedIds,
        };
      });
    },

    dequeueTimeline(timeline) {
      if (!timeline) return;
      setScoped((state) => {
        const top = state[timeline]?.top;
        const queuedIds = state[timeline]?.queuedItems || new Set();
        if (queuedIds.size === 0) return state;

        const ids = new Set(existingTimeline.items);
        const existingTimeline = state[timeline] || {};
        const newQueuedIds = queuedIds.union(ids);

        state[timeline] = {
          ...existingTimeline,
          items: top ? truncateIds(newQueuedIds) : newQueuedIds,
          queuedItems: newQueuedIds,
          totalQueuedItemsCount: 0,
        };
      });
    },

    deleteTimeline(id, references, reblogOf) {
      if (!id) return;
      setScoped((state) => {
        const newTimelinesState = JSON.parse(JSON.stringify(state));

        // Define a recursive helper function to handle the original logic cleanly
        const recursiveDelete = (currentStatusId, refs, excludeAccount) => {
          // --- Original 'withMutations' Loop Logic ---
          // Iterate over the timeline IDs using standard JS Object.keys
          Object.keys(newTimelinesState).forEach((timelineId) => {
            if (shouldDelete(timelineId, excludeAccount)) {
              const currentTimeline = newTimelinesState[timelineId];

              if (currentTimeline) {
                // Convert JS Array to Set for the 'delete' operation (equivalent to ImmutableOrderedSet.delete)
                currentTimeline.items = new Set(currentTimeline.items);
                currentTimeline.queuedItems = new Set(
                  currentTimeline.queuedItems,
                );

                // Perform the delete operation using standard JS Set.delete()
                currentTimeline.items.delete(currentStatusId);
                currentTimeline.queuedItems.delete(currentStatusId);
              }
            }
          });

          // --- Original 'references.forEach' Recursion Logic ---
          // Ensure 'refs' is treated as an iterable array/map of tuples
          // (Handling either Array or Map input type from the original TS signature)
          const refsArray = Array.isArray(refs)
            ? refs
            : Array.from(refs.values());

          refsArray.forEach((refTuple) => {
            // refTuple is [refStatusId, refAccountId]
            const [refStatusId, refAccountId] = refTuple;

            // Recurse using the local helper function
            // The empty array '[]' mirrors the original code's recursive call structure
            recursiveDelete(refStatusId, refAccountId, [], excludeAccount);
          });
        };

        const excludeAccount = reblogOf;
        // Start the recursive process with the initial parameters
        recursiveDelete(id, references, excludeAccount);

        // 2. Return the new, fully updated state object to Zustand
        return {
          ...state,
          ...newTimelinesState, // TODO check later
        };
      });
    },

    clearTimeline(timeline) {
      if (!timeline) return;
      set((state) => {
        state[timeline] = { ...TimelineRecord };
      });
    },

    blockOrMuteAccountSuccess(relationship, statuses) {
      if (!relationship || !relationship.id) return;
      if (!Array.isArray(statuses)) return;

      set((state) => {
        statuses.forEach((status) => {
          if (status.account !== relationship.id) return;

          const references = statuses
            .filter((reblog) => reblog.reblog === status.id)
            .map((status) => [status.id, status.account]);

          const newTimelinesState = JSON.parse(JSON.stringify(state));

          // Define a recursive helper function to handle the original logic cleanly
          const recursiveDelete = (currentStatusId, refs, excludeAccount) => {
            // --- Original 'withMutations' Loop Logic ---
            // Iterate over the timeline IDs using standard JS Object.keys
            Object.keys(newTimelinesState).forEach((timelineId) => {
              if (shouldDelete(timelineId, excludeAccount)) {
                const currentTimeline = newTimelinesState[timelineId];

                if (currentTimeline) {
                  // Convert JS Array to Set for the 'delete' operation (equivalent to ImmutableOrderedSet.delete)
                  currentTimeline.items = new Set(currentTimeline.items);
                  currentTimeline.queuedItems = new Set(
                    currentTimeline.queuedItems,
                  );

                  // Perform the delete operation using standard JS Set.delete()
                  currentTimeline.items.delete(currentStatusId);
                  currentTimeline.queuedItems.delete(currentStatusId);
                }
              }
            });

            // --- Original 'references.forEach' Recursion Logic ---
            // Ensure 'refs' is treated as an iterable array/map of tuples
            // (Handling either Array or Map input type from the original TS signature)
            const refsArray = Array.isArray(refs)
              ? refs
              : Array.from(refs.values());

            refsArray.forEach((refTuple) => {
              // refTuple is [refStatusId, refAccountId]
              const [refStatusId, refAccountId] = refTuple;

              // Recurse using the local helper function
              // The empty array '[]' mirrors the original code's recursive call structure
              recursiveDelete(refStatusId, refAccountId, [], excludeAccount);
            });
          };

          const excludeAccount = relationship.id;
          // Start the recursive process with the initial parameters
          recursiveDelete(status.id, references, excludeAccount);

          // 2. Return the new, fully updated state object to Zustand
          return {
            ...state,
            ...newTimelinesState, // TODO check later
          };
        });
      });
    },

    scrollTopTimeline(timeline, top) {
      if (!timeline) return;
      set((state) => {
        let existingTimeline = state[timeline] || {};
        if (top) {
          existingTimeline = { ...existingTimeline, unread: 0 };
        }
        state[timeline] = {
          ...existingTimeline,
          top: top,
        };
      });
    },

    connectTimeline(timeline) {
      if (!timeline) return;
      set((state) => {
        const existingTimeline = state[timeline] || {};
        state[timeline] = { ...existingTimeline, online: true };
      });
    },

    disconnectTimeline(timeline) {
      if (!timeline) return;
      set((state) => {
        const existingTimeline = state[timeline] || {};
        state[timeline] = {
          ...existingTimeline,
          online: false,
        };
      });
    },

    inserttimeline(timeline) {
      if (!timeline) return;
      set((state) => {
        // 1. Get the current timeline object (or a default empty object if it doesn't exist)
        const currentTimeline = state[timeline] || {
          items: new Set() /* default properties */,
        };

        // We operate on the current items set, converting it to an array for easy manipulation
        let itemsArray = Array.from(currentTimeline.items);

        const existingSuggestionIndex = itemsArray.findIndex((key) =>
          key.includes("末suggestions"),
        );

        if (existingSuggestionIndex > -1) {
          itemsArray.splice(existingSuggestionIndex, 1);
        }

        // 3. Determine insertion position and create the new suggestion ID
        const positionInTimeline = sample([5, 6, 7, 8, 9]); // Get a random number 5-9
        const lastItemId = itemsArray[itemsArray.length - 1]; // Get the last item's ID

        if (lastItemId) {
          // Splice the new suggestion ID into the array at the random position
          itemsArray.splice(positionInTimeline, 0, `末suggestions-${lastItemId}`);
        }

        // 4. Convert the final modified array back into a Set (maintains order)
        const updatedItemsSet = new Set(itemsArray);

        // 5. Update the Zustand state immutably:
        return {
          ...state, // Keep all other timelines
          [timeline]: {
            ...currentTimeline, // Keep other properties of this specific timeline
            items: updatedItemsSet, // Update only the 'items' set
          },
        };
      });
    },

    processTimelineUpdate(timeline, status, accept) {
      const root = rootGet();
      const me = root.me;

      const ownStatus = status.account?.id === me;
      const hasPendingStatuses = !root.pending_statuses.isEmpty();

      const columnSettings = this.settings[timeline] || {};//TODO check later
      const shouldSkipQueue = shouldFilter(normalizeStatus(status), columnSettings);

      if (ownStatus && hasPendingStatuses) {
        // WebSockets push statuses without the Idempotency-Key,
        // so if we have pending statuses, don't import it from here.
        // We implement optimistic non-blocking statuses.
        return;
      }

      root.importer.importFetchedStatus(status);

      if (shouldSkipQueue) {
        this.updateTimeline(timeline, status.id, accept);
      } else {
        this.updateTimelineQueue(timeline, status.id, accept);
      }
    },

    updateTimelineAction(timeline, statusId, _accept) {
      //if (accept) {
        this.updateTimeline(timeline, statusId);
      ///}
    },

    updateTimelineQueueAction(timeline, statusId, _accept) {
      //if (!accept) {
        this.updateTimelineQueue(timeline, statusId);
      //}
    },

    dequeueTimelineAction(timelineId, expandFunc, optionalExpandArgs) {
      const root = rootGet();
      const queuedCount = root.timelines?.[timelineId]?.totalQueuedItemsCount || 0;

      if (queuedCount <= 0) return;

      if (queuedCount <= MAX_QUEUED_ITEMS) {
        this.dequeueTimeline(timelineId);
      }

      if (typeof expandFunc === "function") {
        this.clearTimeline(timelineId);
        expandFunc();
      } else {
        if (timelineId === 'home') {
          this.clearTimeline(timelineId);
          this.expandFollowsTimeline(optionalExpandArgs)
        } else if (timelineId === 'community') {
          this.clearTimeline(timelineId);
          this.expandCommunityTimeline(optionalExpandArgs)
        }
      }
    },

    deleteFromTimelines(id) {
      const root = rootGet();
      const accountId = root.statuses[id]?.account?.id;
      const references = root.statuses.filter(status => status.reblog === id).map(status => [status.id, status.account.id]);
      const reblogOf = getIn(root.statuses, [id, 'reblog']) || null;

      this.deleteTimeline(id, accountId, references, reblogOf);
    },

    clearTimelineAction(timeline) { 
      this.clearTimeline(timeline);
    },

    parseTags(tags, mode) {
      return (tags[mode] || []).map(tagObj => tagObj.value);
    },



    async expandTimeline(timelineId, path, params, done = noOp) {
      const root = rootGet();
      const timeline = root.timelines[timelineId] || {};
      const isLoadingMore = !!params.max_id;

      if(timeline.isLoading) {
        done();
        noOpAsync();
      }

      if (!params.max_id &&
        !params.pinned &&
        (timeline.items || new Set()).size > 0 &&
        !path.includes('max_id=')) 
      {
        params.since_id = getIn(timeline, ['items', 0]);
      }

      const isLoadingRecent = !!params.since_id;

      this.expandTimelineRequest(timelineId, isLoadingMore);

      try {
        const res = await fetch(path + new URLSearchParams(params).toString(), { method: "GET" });
        if (!res.ok) throw new Error(`Failed to expand timeline (${res.status})`);
        const { next, prev } = res.pagination();
        const data = await res.json();

        root.importer?.importFetchedStatuses?.(data || []);
        const statusesFromGroups = data.filter((status) => !!status.group);
        this.groupsfetchGroupRelationships(statusesFromGroups.map((status) => status.group?.id));

        this.expandTimelineSuccess(
          timelineId,
          data || [],
          next,
          prev,
          res.status === 206,
          isLoadingRecent,
          isLoadingMore,
        );
        done();
        return data;
      } catch (error) {
        this.expandTimelineFail(timelineId, error, isLoadingMore);
        console.error("timelinesSlice.expandTimeline failed", error);
      }
    },

    expandFollowsTimeline({ url, maxId }, done = noOp) {
      const endpoint = url || '/api/v1/timelines/home';
      const params = {};

      if (!url && maxId) {
        params.max_id = maxId;
      }

      return this.expandTimeline('home', endpoint, params, done);   
    },

    expandPublicTimeline({ url, maxId, onlyMedia, language }, done = noOp) {
      this.expandTimeline(`public${onlyMedia ? ':media' : ''}`, 
                          url || '/api/v1/timelines/public',
                          url ? {} : { max_id: maxId, only_media: !!onlyMedia, language: language || undefined },
                          done);
    },

    expandRemoteTimeline(instance, {  url, maxId, onlyMedia }, done = noOp) {
      this.expandTimeline(`remote${onlyMedia ? ':media' : ''}:${instance}`, 
                          url || '/api/v1/timelines/public',
                          url ? {} : { local: false, instance: instance, max_id: maxId, only_media: !!onlyMedia }, 
                          done
                        );
    },

    expandCommunityTimeline({ url, maxId, onlyMedia }, done = noOp) {
      this.expandTimeline(`community${onlyMedia ? ':media' : ''}`, 
                  url || '/api/v1/timelines/public', 
                  url ? {} : { local: true, 
                               max_id: maxId, 
                               only_media: !!onlyMedia 
                             }, 
                  done
                );
    },

    expandDirectTimeline({ url, maxId }, done = noOp) {
      this.expandTimeline('direct', 
                  url || '/api/v1/timelines/direct', 
                  url ? {} : { max_id: maxId }, 
                  done
                );
    },

    expandAccountTimeline(accountId, { url, maxId, withReplies }, done = noOp) {
      this.expandTimeline(`account:${accountId}${withReplies ? ':with_replies' : ''}`,
                  url || `/api/v1/accounts/${accountId}/statuses`, 
                  url ? {} : { max_id: maxId, with_replies: !!withReplies }, 
                  done
                );
    },

    expandAccountFeaturedTimeline(accountId, done = noOp) {
      this.expandTimeline(`account:${accountId}:pinned`, `/api/v1/accounts/${accountId}/statuses`, { pinned: true, with_muted: true }, done);
    },

    expandAccountMediaTimeline(accountId, { url, maxId } = {}, done = noOp) {
      this.expandTimeline(`account:${accountId}:media`, url || `/api/v1/accounts/${accountId}/statuses`, url ? {} : { max_id: maxId, only_media: true, limit: 40, with_muted: true }, done);
    },

    expandListTimeline(id, { url, maxId } = {}, done = noOp) {
      this.expandTimeline(`list:${id}`, url || `/api/v1/timelines/list/${id}`, url ? {} : { max_id: maxId }, done);
    },

    expandGroupTimeline(id, { maxId } = {}, done = noOp) {
      this.expandTimeline(`group:${id}`, `/api/v1/timelines/group/${id}`, { max_id: maxId }, done);
    },

    expandGroupFeaturedTimeline(id, done = noOp) {
      this.expandTimeline(`group:${id}:pinned`, `/api/v1/timelines/group/${id}`, { pinned: true }, done);
    },
    expandGroupTimelineFromTag(id, tagName, { maxId } = {}, done = noOp) {
      this.expandTimeline(`group:tags:${id}:${tagName}`, `/api/v1/timelines/group/${id}/tags/${tagName}`, { max_id: maxId }, done);
    },

    expandGroupMediaTimeline(id, { maxId } = {}, done = noOp) {
      this.expandTimeline(`group:${id}:media`, `/api/v1/timelines/group/${id}`, { max_id: maxId, only_media: true, limit: 40, with_muted: true }, done);
    },

    expandHashtagTimeline(hashtag, { url, maxId, tags } = {}, done = noOp) {
      this.expandTimeline(`hashtag:${hashtag}`, url || `/api/v1/timelines/tag/${hashtag}`, url ? {} : {
        max_id: maxId,
        any: parseTags(tags, 'any'),
        all: parseTags(tags, 'all'),
        none: parseTags(tags, 'none'),
      }, done);
    },

    insertSuggestionsIntoTimeline(){
      this.insertTimeline('home');
    }
  });
};
