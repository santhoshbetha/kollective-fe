import {
  simulateEmojiReact,
  simulateUnEmojiReact,
} from "../../utils/emoji-reacts";
import { asPlain, getId } from "../../utils/immutableSafe";
import settingsSchema from "../../schemas/settings";
import { shouldHaveCard } from "../../utils/status";
import { isLoggedIn } from "../../utils/auth";
import { getFeatures } from "../../utils/features";

export const createStatusesSlice = (setScoped, getScoped, rootSet, rootGet) => {
  const set = setScoped;

  const statusExists = (rootState, statusId) => {
    return (rootState.statuses[statusId] || null) !== null;
  };

  // Import helpers
  return ({
    importStatus(status, expandSpoilers) {
      const s = asPlain(status) || {};
      if (!s || !s.id) return;
      set((state) => {
        const existing = state[s.id] || {};
        const merged = { ...existing, ...s };
        if (expandSpoilers && merged.spoiler_text) merged.spoiler_text = "";
        state[s.id] = merged;
      });
    },

    importStatuses(statuses, expandSpoilers = false) {
      if (!Array.isArray(statuses)) return;
      set((state) => {
        statuses.forEach((status) => {
          const s = asPlain(status) || {};
          if (!s || !s.id) return;
          const existing = state[s.id] || {};
          const merged = { ...existing, ...s };
          if (expandSpoilers && merged.spoiler_text) merged.spoiler_text = "";
          state[s.id] = merged;
        });
      });
    },

    createStatusRequest(params, editing) {
      if (editing) return;
      if (!params || !params.in_reply_to_id) return;
      setScoped((state) => {
        const parent = state[params.in_reply_to_id] || {};
        const current =
          typeof parent.replies_count === "number" ? parent.replies_count : 0;
        state[params.in_reply_to_id] = { ...parent, replies_count: current + 1 };
      });
    },

    createStatusFail(params, editing) {
      if (editing) return;
      if (!params || !params.in_reply_to_id) return;
      setScoped((state) => {
        const parent = state[params.in_reply_to_id] || {};
        const current =
          typeof parent.replies_count === "number" ? parent.replies_count : 0;
        state[params.in_reply_to_id] = {
          ...parent,
          replies_count: Math.max(0, current - 1),
        };
      });
    },

    favouriteRequest(status) {
      const id = getId(status);
      if (!id) return;
      set((state) => {
        const existing = state[id] || {};
        const current =
          typeof existing.favourites_count === "number"
            ? existing.favourites_count
            : 0;
        state[id] = {
          ...existing,
          favourited: true,
          favourites_count: Math.max(0, current + 1),
        };
      });
    },

    unFavouriteRequest(status) {
      const id = getId(status);
      if (!id) return;
      set((state) => {
        const existing = state[id] || {};
        const current =
          typeof existing.favourites_count === "number"
            ? existing.favourites_count
            : 0;
        state[id] = {
          ...existing,
          favourited: false,
          favourites_count: Math.max(0, current - 1),
        };
      });
    },

    dislikeRequest(status) {
      const id = getId(status);
      if (!id) return;
      set((state) => {
        const existing = state[id] || {};
        const current =
          typeof existing.dislikes_count === "number"
            ? existing.dislikes_count
            : 0;
        state[id] = {
          ...existing,
          disliked: true,
          dislikes_count: Math.max(0, current + 1),
        };
      });
    },

    undislikeRequest(status) {
      const id = getId(status);
      if (!id) return;
      set((state) => {
        const existing = state[id] || {};
        const current =
          typeof existing.dislikes_count === "number"
            ? existing.dislikes_count
            : 0;
        state[id] = {
          ...existing,
          disliked: false,
          dislikes_count: Math.max(0, current - 1),
        };
      });
    },

    emojiReactRequest(status, emoji, custom) {
      const id = getId(status);
      if (!id) return;
      set((state) => {
        const existing = state[id] || {};
        state[id] = {
          ...existing,
          emojiReacts: simulateEmojiReact(existing.emojiReacts, emoji, custom),
        };
      });
    },

    unEmojiReactRequest(status, emoji) {
      const id = getId(status);
      if (!id) return;
      set((state) => {
        const existing = state[id] || {};
        state[id] = {
          ...existing,
          emojiReacts: simulateUnEmojiReact(existing.emojiReacts, emoji),
        };
      });
    },

    favouriteFail(status) {
      const id = getId(status);
      if (!id) return;
      set((state) => {
        const existing = state[id] || {};
        state[id] = { ...existing, favourited: false };
      });
    },

    dislikeFail(status) {
      const id = getId(status);
      if (!id) return;
      set((state) => {
        const existing = state[id] || {};
        state[id] = { ...existing, disliked: false };
      });
    },

    reblogRequest(status) {
      const id = getId(status);
      if (!id) return;
      set((state) => {
        const existing = state[id] || {};
        state[id] = { ...existing, reblogged: true };
      });
    },

    reblogFail(status) {
      const id = getId(status);
      if (!id) return;
      set((state) => {
        const existing = state[id] || {};
        state[id] = { ...existing, reblogged: false };
      });
    },

    unreblogRequest(status) {
      const id = getId(status);
      if (!id) return;
      set((state) => {
        const existing = state[id] || {};
        state[id] = { ...existing, reblogged: false };
      });
    },

    unreblogFail(status) {
      const id = getId(status);
      if (!id) return;
      set((state) => {
        const existing = state[id] || {};
        state[id] = { ...existing, reblogged: true };
      });
    },

    muteStatusSuccess(statusId) {
      if (!statusId) return;
      set((state) => {
        const existing = state[statusId] || {};
        state[statusId] = { ...existing, muted: true };
      });
    },

    unmuteStatusSuccess(statusId) {
      if (!statusId) return;
      set((state) => {
        const existing = state[statusId] || {};
        state[statusId] = { ...existing, muted: false };
      });
    },

    revealStatus(ids) {
      if (!Array.isArray(ids)) return;
      set((state) => {
        ids.forEach((id) => {
          const existing = state[id] || {};
          state[id] = { ...existing, hidden: false };
        });
      });
    },

    hideStatus(ids) {
      if (!Array.isArray(ids)) return;
      set((state) => {
        ids.forEach((id) => {
          const existing = state[id] || {};
          state[id] = { ...existing, hidden: true };
        });
      });
    },

    deleteStatusRequest(params) {
      if (!params || !params.in_reply_to_id) return;
      set((state) => {
        const parent = state[params.in_reply_to_id] || {};
        const current =
          typeof parent.replies_count === "number" ? parent.replies_count : 0;
        state[params.in_reply_to_id] = {
          ...parent,
          replies_count: Math.max(0, current - 1),
        };
      });
    },

    deleteStatusFail(params) {
      if (!params || !params.in_reply_to_id) return;
      set((state) => {
        const parent = state[params.in_reply_to_id] || {};
        const current =
          typeof parent.replies_count === "number" ? parent.replies_count : 0;
        state[params.in_reply_to_id] = { ...parent, replies_count: current + 1 };
      });
    },

    undoStatusTranslate(id) {
      if (!id) return;
      set((state) => {
        if (state[id]) {
          const copy = { ...state[id] };
          delete copy.translation;
          state[id] = copy;
        }
      });
    },

    unfilterStatus(id) {
      if (!id) return;
      set((state) => {
        if (!state[id]) return;
        state[id] = { ...state[id], showFiltered: false };
      });
    },

    deleteTimeline(id, references) {
      if (!id) return;
      set((state) => {
        const toDelete = new Set();
        const rec = (sid) => {
          if (!state[sid] || toDelete.has(sid)) return;
          toDelete.add(sid);
          const refs = references;
          if (Array.isArray(refs)) refs.forEach(rec);
        };
        rec(id);
        toDelete.forEach((sid) => delete state[sid]);
      });
    },

    joinEventRequest(id) {
      if (!id) return;
      set((state) => {
        const existing = state[id] || {};
        state[id] = {
          ...existing,
          event: { ...(existing.event || {}), join_state: "pending" },
        };
      });
    },

    joinEventFail(id) {
      if (!id) return;
      set((state) => {
        const existing = state[id] || {};
        state[id] = {
          ...existing,
          event: { ...(existing.event || {}), join_state: null },
        };
      });
    },

    leaveEventRequest(id) {
      if (!id) return;
      set((state) => {
        const existing = state[id] || {};
        state[id] = {
          ...existing,
          event: { ...(existing.event || {}), join_state: null },
        };
      });
    },

    leaveEventFail(id, previousState) {
      if (!id) return;
      set((state) => {
        const existing = state[id] || {};
        state[id] = {
          ...existing,
          event: { ...(existing.event || {}), join_state: previousState },
        };
      });
    },

    async createStatus(params, idempotencyKey, statusId) {
      const root = rootGet();
      const settings = settingsSchema.parse(root.settings.toJS() || {});//TOD check this later

      if (settings.discloseClient) {
        params.disclose_client = true;
      }
      this.createStatusRequest(params, idempotencyKey, { editing: !!statusId });
      root.timelines.createStatusRequest(params, idempotencyKey, { editing: !!statusId });
      root.pendingStatuses.createStatusRequest(params, idempotencyKey, { editing: !!statusId });
      root.contexts.createStatusRequest(params, idempotencyKey, { editing: !!statusId });

      const method = statusId === null ? 'POST' : 'PUT';
      const path = statusId === null ? '/api/v1/statuses' : `/api/v1/statuses/${statusId}`;
      const headers = { 'Idempotency-Key': idempotencyKey };

      try {
        const res = await fetch(path, {
          method,
          headers,
          body: JSON.stringify(params),
        });
        if (!res.ok) throw new Error(`Failed to create status (${res.status})`);
        const status = await res.json();

        // The backend might still be processing the rich media attachment
        if (!status.card && shouldHaveCard(status)) {
          status.expectsCard = true;
        }

        root.importer?.importFetchedStatus?.(status, idempotencyKey);

        root.pendingStatuses.createStatusSuccess(status, params, idempotencyKey, { editing: !!statusId });
        root.scheduledStatuses?.createStatusSuccess?.(status, params, idempotencyKey, { editing: !!statusId });
        root.statusLists?.createStatusSuccess?.(status, params, idempotencyKey, { editing: !!statusId });
        root.timelines.createStatusSuccess(status, params, idempotencyKey, { editing: !!statusId });
        root.contexts.createStatusSuccess(status, params, idempotencyKey, { editing: !!statusId });

        // Poll the backend for the updated card
        if (status.expectsCard) {
          const delay = 1000;

          const poll = (retries = 5) => {
            fetch(`/api/v1/statuses/${status.id}`, { method: "GET" }
            ).then(async (response) => {
              if (!response.ok) {
                throw new Error(
                  `Failed to poll status for card (${response.status})`,
                );
              }
              const data = await response.json();
              if (data.card) {
                // Update the status with the new card
                root.importer?.importFetchedStatus?.(data);
              } else if (retries > 0 && response.status === 200) {
                // Retry after delay
                setTimeout(() => poll(retries - 1), delay);
              }
            })
              .catch((error) => {
                console.error("Error polling status for card:", error);
              });
          };

          setTimeout(() => poll(), delay);
        }

        return status;
      } catch (error) {
        this.createStatusFail(error, params, idempotencyKey, { editing: !!statusId });
        throw error;
      }
    },

    async editStatus(id) {
      const root = rootGet();
      let status = root.statuses[id];

      if (status.poll) {
        status = status['poll', root.polls[status.poll]];
      }

      try {
        const res = await fetch(`/api/v1/statuses/${id}`, { method: "GET" });
        if (!res.ok) throw new Error(`Failed to fetch status (${res.status})`);
        const data = await res.json();
        root.composeStatus.setComposeToStatus(status, data.text, data.spoiler_text, data.content_type, false);
        root.modal.openModalAction('COMPOSE');
      } catch (error) {
        console.error("Error in editStatus:", error);
      }
    },

    async fetchStatus(id) {
      const root = rootGet();
      const skipLoading = statusExists(root, id);

      try {
        const res = await fetch(`/api/v1/statuses/${id}`, { method: "GET" });
        if (!res.ok) throw new Error(`Failed to fetch status (${res.status})`);
        const status = await res.json();
        root.importer?.importFetchedStatus?.(status);
        if (status.group) {
          root.groups.fetchGroupRelationships([status.group.id])
        }
        return status;
      } catch (error) {
        console.error("Error in fetchStatus:", error);
      }
    },

    async deleteStatus(id, withRedraft) {
      const root = rootGet();
      if (!isLoggedIn(root)) {
        return null;
      }

      let status = root.statuses[id];
      if (status.poll) {
        status = status['poll', root.polls[status.poll]];
      }

      this.deleteStatusRequest(status);

      try {
        const res = await fetch(`/api/v1/statuses/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error(`Failed to delete status (${res.status})`);
        root.timelines.deleteFromTimelines(id);

        const data = await res.json();

        if (withRedraft) {
          root.composeStatus.setComposeToStatus(status, data.text, data.spoiler_text, data.pleroma?.content_type, withRedraft);
          root.modal.openModalAction('COMPOSE');
        }
      } catch (error) {
        this.deleteStatusFail({ params: status }); //TODO check later
        console.error("Error in deleteStatus:", error);
      }
    },

    updateStatus(status) {
      const root = rootGet();
      root.importer?.importFetchedStatus?.(status);
    },

    async fetchContext(id) {
      const root = rootGet();
      try {
        const res = await fetch(`/api/v1/statuses/${id}/context`, { method: "GET" });
        if (!res.ok) throw new Error(`Failed to fetch context (${res.status})`);
        const context = await res.json();
        if (Array.isArray(context)) {
          // Mitra: returns a list of statuses
          root.importer?.importFetchedStatuses?.(context);
        } else if (typeof context === 'object') {
          const { ancestors, descendants } = context;
          const statuses = ancestors.concat(descendants);
          root.importer?.importFetchedStatuses?.(statuses);
          root.contexts.fetchContextSuccess(id, ancestors, descendants);
        } else {
          throw context;
        }
        return context;
      } catch (error) {
        console.error("Error in fetchContext:", error);
        if (error.response && error.response.status === 404) {
          root.timelines.deleteFromTimelines(id);
        }
      }
    },

    async fetchNext(statusId, next) {
      const root = rootGet();
      const response = root[next];//TODO check later
      const data = await response.json();

      root.importer.importFetchedStatuses(data);

      root.contexts.fetchContextSuccess({
        id: statusId,
        ancestors: [],
        descendants: data
      }
      );

      return {
        next: response.pagination().next
      }
    },

    async fetchAncestors(id) {
      const root = rootGet();
      try {
        const res = await fetch(`/api/v1/statuses/${id}/context/ancestors`, { method: "GET" });
        if (!res.ok) throw new Error(`Failed to fetch ancestors (${res.status})`);
        const ancestors = await res.json();
        root.importer?.importFetchedStatuses?.(ancestors);
        return ancestors;
      } catch (error) {
        console.error("Error in fetchAncestors:", error);
      }
    },

    async fetchDescendants(id) {
      const root = rootGet();
      try {
        const res = await fetch(`/api/v1/statuses/${id}/context/descendants`, { method: "GET" });
        if (!res.ok) throw new Error(`Failed to fetch descendants (${res.status})`);
        const descendants = await res.json();
        root.importer?.importFetchedStatuses?.(descendants);
        return descendants;
      } catch (error) {
        console.error("Error in fetchDescendants:", error);
      }
    },

    async fetchStatusWithContext(id) {
      const root = rootGet();
      const features = getFeatures();

      if (features.paginatedContext) {
        await this.fetchStatus(id);

        const [ancestors, descendants] = await Promise.all([
          this.fetchAncestors(id),
          this.fetchDescendants(id)
        ]);

        this.contexts.fetchContextSuccess(id, ancestors, descendants);

        return descendants.pagination();
      } else {
        await Promise.all([
          this.fetchContext(id),
          this.fetchStatus(id),
        ]);
        return {
          next: null, prev: null
        }
      }
    },

    async muteStatus(id) {
      const root = rootGet();
      if (!isLoggedIn(root)) {
        return null;
      }

      try {
        const res = await fetch(`/api/v1/statuses/${id}/mute`, { method: "POST" });
        if (!res.ok) throw new Error(`Failed to mute status (${res.status})`);
        this.muteStatusSuccess(id);
      } catch (error) {
        console.error("Error in muteStatus:", error);
      }
    },

    async unmuteStatus(id) {
      const root = rootGet();
      if (!isLoggedIn(root)) {
        return null;
      }

      try {
        const res = await fetch(`/api/v1/statuses/${id}/unmute`, { method: "POST" });
        if (!res.ok) throw new Error(`Failed to unmute status (${res.status})`);
        this.unmuteStatusSuccess(id);
      } catch (error) {
        console.error("Error in unmuteStatus:", error);
      }
    },

    toggleMuteStatus(status) {
      if (status.muted) {
        return this.unmuteStatus(status.id);
      } else {
        return this.muteStatus(status.id);
      }
    },

    hideStatusAction(ids) {
      const root = rootGet();
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      root.statuses.hideStatus(ids);
    },

    revealStatusAction(ids) {
      const root = rootGet();
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      root.statuses.revealStatus(ids);
    },

    toggleStatusHidden(status) {
      if (status.hidden) {
        return this.revealStatusAction(status.id);
      } else {
        return this.hideStatusAction(status.id);
      }
    },

    async translateStatus(id, lang) {
      const root = rootGet();
      try {
        const res = await fetch(`/api/v1/statuses/${id}/translate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ target_language: lang }),
        });
        if (!res.ok) throw new Error(`Failed to translate status (${res.status})`);
        const data = await res.json();
        root.statuses.translateStatusSuccess({ id, translation: data });
      } catch (error) {
        console.error("Error in translateStatus:", error);
      }
    }
  });
};

export default createStatusesSlice;
