import {
  simulateEmojiReact,
  simulateUnEmojiReact,
} from "../../utils/emoji-reacts";
import { asPlain, getId } from "../../utils/immutableSafe";
import { shouldHaveCard } from "../../utils/status";
import { isLoggedIn } from "../../utils/auth";
import { getFeatures } from "../../utils/features";

export const createStatusesSlice = (setScoped, getScoped, rootSet, rootGet) => {
  const getActions = () => rootGet();

  // Helper for batch updating records
  const mergeStatus = (state, status, expandSpoilers) => {
    const s = asPlain(status);
    if (!s?.id) return;
    
    state[s.id] = { ...(state[s.id] || {}), ...s };
    if (expandSpoilers && state[s.id].spoiler_text) {
      state[s.id].spoiler_text = "";
    }
  };

  // Helper for adjusting parent reply counts
  const adjustReplyCount = (state, inReplyToId, delta) => {
    if (!inReplyToId || !state[inReplyToId]) return;
    const current = state[inReplyToId].replies_count || 0;
    state[inReplyToId].replies_count = Math.max(0, current + delta);
  };

  const statusExists = (rootState, statusId) => {
    return (rootState.statuses[statusId] || null) !== null;
  };

  // Import helpers
  return ({
    StatusImport(status, expandSpoilers) {
      setScoped((state) => mergeStatus(state, status, expandSpoilers));
    },

    StatusesImport(statuses, expandSpoilers = false) {
      if (!Array.isArray(statuses)) return;
      setScoped((state) => {
        statuses.forEach((s) => mergeStatus(state, s, expandSpoilers));
      });
    },

    createStatusRequest(params, editing) {
      if (editing) return;
      setScoped((state) => adjustReplyCount(state, params?.in_reply_to_id, 1));
    },

    createStatusFail(params, editing) {
      if (editing) return;
      setScoped((state) => adjustReplyCount(state, params?.in_reply_to_id, -1));
    },

    deleteStatusRequest(params) {
      setScoped((state) => adjustReplyCount(state, params?.in_reply_to_id, -1));
    },

    deleteStatusFail(params) {
      setScoped((state) => adjustReplyCount(state, params?.in_reply_to_id, 1));
    },

    favouriteRequest(status) {
      const id = getId(status);
      setScoped((state) => {
        if (!state[id]) return;
        state[id].favourited = true;
        state[id].favourites_count = (state[id].favourites_count || 0) + 1;
      });
    },

    unFavouriteRequest(status) {
      const id = getId(status);
      setScoped((state) => {
        if (!state[id]) return;
        state[id].favourited = false;
        state[id].favourites_count = Math.max(0, (state[id].favourites_count || 0) - 1);
      });
    },

    dislikeRequest(status) {
      const id = getId(status);
      setScoped((state) => {
        if (!state[id]) return;
        state[id].disliked = true;
        state[id].dislikes_count = (state[id].dislikes_count || 0) + 1;
      });
    },

    undislikeRequest(status) {
      const id = getId(status);
      setScoped((state) => {
        if (!state[id]) return;
        state[id].disliked = false;
        state[id].dislikes_count = Math.max(0, (state[id].dislikes_count || 0) - 1);
      });
    },

    emojiReactRequest(status, emoji, custom) {
      const id = getId(status);
      setScoped((state) => {
        if (!state[id]) return;
        state[id].emojiReacts = simulateEmojiReact(state[id].emojiReacts, emoji, custom);
      });
    },

    unEmojiReactRequest(status, emoji) {
      const id = getId(status);
      setScoped((state) => {
        if (!state[id]) return;
        state[id].emojiReacts = simulateUnEmojiReact(state[id].emojiReacts, emoji);
      });
    },

    reblogRequest: (status) => setScoped((s) => { s[getId(status)].reblogged = true; }),
    reblogFail: (status) => setScoped((s) => { s[getId(status)].reblogged = false; }),
    unreblogRequest: (status) => setScoped((s) => { s[getId(status)].reblogged = false; }),
    unreblogFail: (status) => setScoped((s) => { s[getId(status)].reblogged = true; }),
    
    muteStatusSuccess: (id) => setScoped((s) => { if (s[id]) s[id].muted = true; }),
    unmuteStatusSuccess: (id) => setScoped((s) => { if (s[id]) s[id].muted = false; }),

    favouriteFail(status) {
      const id = getId(status);
      if (!id) return;
      setScoped((ss) => {
        const existing = ss[id] || {};
        ss[id] = { ...existing, favourited: false };
      });
    },

    dislikeFail(status) {
      const id = getId(status);
      if (!id) return;
      setScoped((s) => {
        const existing = s[id] || {};
        s[id] = { ...existing, disliked: false };
      });
    },

    revealStatus(ids) {
      setScoped((state) => {
        ids.forEach((id) => { if (state[id]) state[id].hidden = false; });
      });
    },

    hideStatus(ids) {
      setScoped((state) => {
        ids.forEach((id) => { if (state[id]) state[id].hidden = true; });
      });
    },

    undoStatusTranslate(id) {
      setScoped((state) => {
        if (state[id]) delete state[id].translation;
      });
    },

    unfilterStatus(id) {
      setScoped((state) => {
        if (state[id]) state[id].showFiltered = false;
      });
    },

    joinEventRequest(id) {
      if (!id) return;
      setScoped((state) => {
        if (!state[id]) return;
        // Ensure the event object exists before mutating
        state[id].event = state[id].event || {};
        state[id].event.join_state = "pending";
      });
    },

    joinEventFail(id) {
      if (!id) return;
      setScoped((state) => {
        if (state[id]?.event) {
          state[id].event.join_state = null;
        }
      });
    },

    leaveEventRequest(id) {
      if (!id) return;
      setScoped((state) => {
        if (state[id]?.event) {
          state[id].event.join_state = null;
        }
      });
    },

    leaveEventFail(id, previousState) {
      if (!id) return;
      setScoped((state) => {
        if (state[id]?.event) {
          state[id].event.join_state = previousState;
        }
      });
    },

    // Ensure your store is created with immer: create(...)(immer((set) => ({ ... })))
    deleteStatusFromStatuses: (id, references) => setScoped((state) => {
      const recursiveDelete = (targetId, targetRefs) => {
        // 1. Process child references recursively
        targetRefs.forEach(([refId, subRefs = []]) => {
          recursiveDelete(refId, subRefs);
        });

        // 2. Mutate the draft directly using the 'delete' keyword
        delete state.statuses[targetId];
      };

      recursiveDelete(id, references);
    }),

    async createStatus(params, idempotencyKey, statusId) {
      const actions = getActions();
      const isEditing = !!statusId;

      // Extract settings safely using root selectors
      const settings = actions.settings?.getSettings?.() || {};
      if (settings.discloseClient) {
        params.disclose_client = true;
      }

      // 1. Notify all interested slices of the request
      const requestPayload = [params, idempotencyKey, { editing: isEditing }];
      actions.createStatusRequest(...requestPayload);
      actions.createTimelineStatusRequest?.(...requestPayload);
      actions.createStatusRequest?.(...requestPayload);
      actions.createContextStatusRequest?.(...requestPayload);

      const isNew = statusId === null;
      const path = isNew ? '/api/v1/statuses' : `/api/v1/statuses/${statusId}`;
      
      try {
        const res = await fetch(path, {
          method: isNew ? 'POST' : 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey 
          },
          body: JSON.stringify(params),
        });

        if (!res.ok) throw new Error(`Failed to create status (${res.status})`);
        const status = await res.json();

        if (!status.card && shouldHaveCard(status)) {
          status.expectsCard = true;
        }

        // 2. Import entity and notify success across slices
        actions.importFetchedStatus?.(status, idempotencyKey);
        
        const successArgs = [status, params, idempotencyKey, { editing: isEditing }];
        actions.createStatusSuccess?.(...successArgs);
        actions.createScheduledStatusSuccess?.(...successArgs);
        actions.createStatusListStatusSuccess?.(...successArgs);
        actions.createTimelineStatusSuccess?.(...successArgs);
        actions.createContextStatusSuccess?.(...successArgs);

        // 3. Handle Card Polling
        if (status.expectsCard) {
          const poll = async (retries = 5) => {
            try {
              const pRes = await fetch(`/api/v1/statuses/${status.id}`);
              if (!pRes.ok) return;
              
              const data = await pRes.json();
              if (data.card) {
                actions.importFetchedStatus?.(data);
              } else if (retries > 0) {
                setTimeout(() => poll(retries - 1), 1500);
              }
            } catch (e) { console.error("Card poll failed", e); }
          };
          setTimeout(poll, 1000);
        }

        return status;
      } catch (error) {
        actions.createStatusFail(error, params, idempotencyKey, { editing: isEditing });
        throw error;
      }
    },

    async editStatus(id) {
      const actions = getActions();
      const status = rootGet().statuses[id];
      if (!status) return;

      try {
        const res = await fetch(`/api/v1/statuses/${id}`);
        if (!res.ok) throw new Error("Failed to fetch status");
        
        const data = await res.json();
        // Consolidate status with potential poll data before opening modal
        const statusWithPoll = status.poll ? { ...status, poll: rootGet().polls[status.poll] } : status;
        
        actions.composeStatus?.setComposeToStatus?.(statusWithPoll, data.text, data.spoiler_text, data.content_type, false);
        actions.openModalAction?.('COMPOSE');
      } catch (error) {
        console.error("editStatus failed", error);
      }
    },

    async fetchStatus(id) {
      const actions = getActions();
      try {
        const res = await fetch(`/api/v1/statuses/${id}`);
        if (!res.ok) throw new Error("Status not found");
        
        const status = await res.json();
        actions.importFetchedStatus?.(status);
        
        if (status.group?.id) {
          actions.fetchGroupRelationships?.([status.group.id]);
        }
        return status;
      } catch (error) {
        console.error("fetchStatus failed", error);
      }
    },

    async deleteStatus(id, withRedraft) {
      const actions = getActions();
      if (!isLoggedIn(rootGet())) return null;

      const status = rootGet().statuses[id];
      if (!status) return;

      actions.deleteStatusRequest(status);

      try {
        const res = await fetch(`/api/v1/statuses/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete failed");
        
        const data = await res.json();
        actions.deleteFromTimelines?.(id);

        if (withRedraft) {
          const statusWithPoll = status.poll ? { ...status, poll: rootGet().polls[status.poll] } : status;
          actions.setComposeToStatus?.(statusWithPoll, data.text, data.spoiler_text, data.kollective?.content_type, true);
          actions.openModalAction?.('COMPOSE');
        }
      } catch (error) {
        actions.deleteStatusFail({ params: status });
        console.error("deleteStatus failed", error);
      }
    },

    updateStatus(status) {
      const actions = getActions();
      
      // Coordinate with the central importer to update the status in state
      actions.importFetchedStatus?.(status);
    },

    async fetchContext(id) {
      const actions = getActions();
      const stringId = String(id);

      try {
        const res = await fetch(`/api/v1/statuses/${stringId}/context`);
        if (!res.ok) throw new Error(`Context fetch failed: ${res.status}`);
        
        const data = await res.json();

        // 1. Handle Mitra-style (Flat array of statuses)
        if (Array.isArray(data)) {
          actions.importFetchedStatuses?.(data);
        } 
        // 2. Handle Mastodon-style (Ancestors/Descendants object)
        else if (data && typeof data === 'object') {
          const { ancestors = [], descendants = [] } = data;
          const allStatuses = [...ancestors, ...descendants];
          
          actions.importFetchedStatuses?.(allStatuses);
          actions.contexts?.fetchContextSuccess?.(stringId, ancestors, descendants);
        }

        return data;
      } catch (error) {
        console.error("StatusesSlice.fetchContext failed", error);
        
        // Handle 404: If the status no longer exists, remove it from timelines
        if (error.status === 404 || error.response?.status === 404) {
          actions.deleteFromTimelines?.(stringId);
        }
      }
    },

    async fetchNext(statusId, nextUrl) {
      const actions = getActions();
      if (!nextUrl) return;

      try {
        const res = await fetch(nextUrl);
        if (!res.ok) throw new Error("Failed to fetch next context page");

        const data = await res.json();
        
        // Import entities
        actions.importFetchedStatuses?.(data);

        // Update context slice (appending to descendants)
        actions.contexts?.fetchContextSuccess?.({
          id: statusId,
          ancestors: [],
          descendants: data
        });

        // Determine if there is another page based on the Link header
        const nextLink = typeof res.next === 'function' ? res.next() : null;
        
        return { next: nextLink };
      } catch (error) {
        console.error("StatusesSlice.fetchNext failed", error);
      }
    },

    async fetchAncestors(id) {
      const actions = getActions();
      try {
        const res = await fetch(`/api/v1/statuses/${id}/context/ancestors`);
        if (!res.ok) throw new Error(`Ancestors fetch failed (${res.status})`);
        
        const ancestors = await res.json();
        actions.importFetchedStatuses?.(ancestors);
        return ancestors;
      } catch (error) {
        console.error("StatusesSlice.fetchAncestors failed", error);
      }
    },

    async fetchDescendants(id) {
      const actions = getActions();
      try {
        const res = await fetch(`/api/v1/statuses/${id}/context/descendants`);
        if (!res.ok) throw new Error(`Descendants fetch failed (${res.status})`);
        
        const descendants = await res.json();
        actions.importFetchedStatuses?.(descendants);
        return descendants;
      } catch (error) {
        console.error("StatusesSlice.fetchDescendants failed", error);
      }
    },

    async fetchStatusWithContext(id) {
      const actions = getActions();
      const features = getFeatures();

      if (features.paginatedContext) {
        // 1. Fetch the main status first
        await actions.fetchStatus(id);

        // 2. Fetch context parts in parallel
        const [ancestors, descendants] = await Promise.all([
          actions.fetchAncestors(id),
          actions.fetchDescendants(id)
        ]);

        // 3. Notify context slice of the combined results
        actions.contexts?.fetchContextSuccess?.(id, ancestors || [], descendants || []);

        // Return pagination if supported by your fetch wrapper
        return typeof descendants?.pagination === 'function' ? descendants.pagination() : { next: null };
      } else {
        // Fallback for non-paginated instances
        await Promise.all([
          actions.fetchContext(id),
          actions.fetchStatus(id),
        ]);
        return { next: null, prev: null };
      }
    },

    async muteStatus(id) {
      const actions = getActions();
      if (!isLoggedIn(rootGet())) return null;

      try {
        const res = await fetch(`/api/v1/statuses/${id}/mute`, { method: "POST" });
        if (!res.ok) throw new Error(`Mute failed (${res.status})`);
        
        actions.muteStatusSuccess(id);
      } catch (error) {
        console.error("StatusesSlice.muteStatus failed", error);
      }
    },

    async unmuteStatus(id) {
      const actions = getActions();
      if (!isLoggedIn(rootGet())) return null;

      try {
        const res = await fetch(`/api/v1/statuses/${id}/unmute`, { method: "POST" });
        if (!res.ok) throw new Error(`Unmute failed (${res.status})`);
        
        actions.unmuteStatusSuccess(id);
      } catch (error) {
        console.error("StatusesSlice.unmuteStatus failed", error);
      }
    },

    toggleMuteStatus(status) {
      const actions = getActions();
      return status.muted 
        ? actions.unmuteStatus(status.id) 
        : actions.muteStatus(status.id);
    },

    hideStatusAction(ids) {
      const actions = getActions();
      const idArray = Array.isArray(ids) ? ids : [ids];
      actions.hideStatus(idArray);
    },

    revealStatusAction(ids) {
      const actions = getActions();
      const idArray = Array.isArray(ids) ? ids : [ids];
      actions.revealStatus(idArray);
    },

    toggleStatusHidden(status) {
      const actions = getActions();
      return status.hidden 
        ? actions.revealStatusAction(status.id) 
        : actions.hideStatusAction(status.id);
    },

    async translateStatus(id, lang) {
      try {
        const res = await fetch(`/api/v1/statuses/${id}/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target_language: lang }),
        });

        if (!res.ok) throw new Error(`Translation failed (${res.status})`);
        
        const data = await res.json();
        
        // Update local state via Immer setter
        setScoped((state) => {
          if (state[id]) {
            state[id].translation = data;
          }
        });
      } catch (error) {
        console.error("StatusesSlice.translateStatus failed", error);
      }
    },

  });
};

export default createStatusesSlice;

