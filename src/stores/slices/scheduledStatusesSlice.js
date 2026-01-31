import { getFeatures } from "../../utils/features";

// Helper to map raw data to the status record shape
const mapToRecord = (data) => ({
  id: data.id || "",
  scheduled_at: data.scheduled_at ? new Date(data.scheduled_at) : new Date(),
  media_attachments: data.media_attachments || null,
  text: data.text || "",
  in_reply_to_id: data.in_reply_to_id || null,
  media_ids: data.media_ids || null,
  sensitive: !!data.sensitive,
  spoiler_text: data.spoiler_text || "",
  visibility: data.visibility || "public",
  poll: data.poll || null,
});

export const createScheduledStatusesSlice = (
  setScoped,
  getScoped,
  rootSet,
  rootGet,
) => {
  const getActions = () => rootGet();

  // Internal helper for batch updating state
  const updateRecords = (data) => {
    const items = Array.isArray(data) ? data : [data];
    setScoped((state) => {
      items.forEach((item) => {
        if (item?.id && item.scheduled_at) {
          state[item.id] = mapToRecord(item);
        }
      });
    });
  };

  return {
    importScheduledStatus: updateRecords,
    createScheduledStatusSuccess: updateRecords,
    importScheduledStatuses: updateRecords,
    fetchScheduledStatuses: updateRecords,

    cancelScheduledStatusRequest(id) {
      setScoped((state) => {
        if (id) delete state[id];
      });
    },

    cancelScheduledStatusSuccess(id) {
      setScoped((state) => {
        if (id) delete state[id];
      });
    },

    async fetchScheduledStatusesAction() {
      const actions = getActions();
      const listState = actions.statusLists?.scheduled_statuses;

      if (listState?.isLoading || !getFeatures().scheduledStatuses) return;

      actions.fetchOrExpandScheduledStatusesRequest();

      try {
        const res = await fetch(`/api/v1/scheduled_statuses`);
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        // Handle custom .next() or Link headers as per your API
        const next = typeof res.next === 'function' ? res.next() : null;

        actions.fetchScheduledStatuses(data);
        actions.fetchScheduledStatusesSuccess(data, next);
      } catch (error) {
        actions.fetchOrExpandScheduledStatusesFail();
        console.error(error);
      }
    },

     async cancelScheduledStatus(id) {
      const actions = getActions();
      
      // Optimistic UI update
      actions.cancelScheduledStatusRequest(id);
      actions.cancelScheduledStatusesRequestOrSuccess(id);

      try {
        const res = await fetch(`/api/v1/scheduled_statuses/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to cancel");

        actions.cancelScheduledStatusSuccess(id);
      } catch (error) {
        actions.fetchOrExpandScheduledStatusesFail(id);
        console.error(error);
      }
    },
  
    async expandScheduledStatuses() {
      const actions = getActions();
      const listState = actions.statusLists?.scheduled_statuses;
      const url = listState?.next;

      if (!url || listState?.isLoading) return;

      actions.fetchOrExpandScheduledStatusesRequest();

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to expand");

        const data = await res.json();
        const next = typeof res.next === 'function' ? res.next() : null;

        actions.fetchScheduledStatuses(data);
        actions.expandScheduledStatusesSuccess(data, next);
      } catch (error) {
        actions.fetchOrExpandScheduledStatusesFail();
        console.error(error);
      }
    },

  
}};
