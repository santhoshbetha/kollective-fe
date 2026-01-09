import { getFeatures } from "../../utils/features";

const ScheduledStatusRecord = {
  id: "",
  scheduled_at: new Date(),
  media_attachments: null,
  text: "",
  in_reply_to_id: null,
  media_ids: null,
  sensitive: false,
  spoiler_text: "",
  visibility: "public",
  poll: null,
};

export const createScheduledStatusesSlice = (
  setScoped,
  getScoped,
  rootSet,
  rootGet,
) => ({
  importStatus(status) {
    setScoped((state) => {
      if (!status.scheduled_at) return;
      if (status && status.id) {
        state[status.id] = ScheduledStatusRecord(status);
      }
    });
  },

  createStatusSuccess(status) {
    setScoped((state) => {
      if (!status.scheduled_at) return;
      if (status && status.id) {
        state[status.id] = ScheduledStatusRecord(status);
      }
    });
  },

  importStatuses(statuses) {
    setScoped((state) => {
      (statuses || []).forEach((status) => {
        if (!status.scheduled_at) return;
        if (status && status.id) {
          state[status.id] = ScheduledStatusRecord(status);
        }
      });
    });
  },

  fetchScheduledStatuses(statuses) {
    setScoped((state) => {
      (statuses || []).forEach((status) => {
        if (!status.scheduled_at) return;
        if (status && status.id) {
          state[status.id] = ScheduledStatusRecord(status);
        }
      });
    });
  },

  cancelScheduledStatusRequest(status) {
    setScoped((state) => {
      if (status && status.id) {
        delete state[status.id];
      }
    });
  },

  cancelScheduledStatusSuccess(status) {
    setScoped((state) => {
      if (status && status.id) {
        delete state[status.id];
      }
    });
  },

  async fetchScheduledStatusesAction() {
    const root = rootGet();

    if (root.statusLists['scheduled_statuses']?.isLoading) {
      return;
    }

    const features = getFeatures();

    if (!features.scheduledStatuses) return;

    root.statusLists.fetchOrExpandScheduledStatusesRequest();

    try {
      const res = await fetch(`/api/v1/scheduled_statuses`, {
        method: "GET",
        headers: {  
          "Content-Type": "application/json",
        },
      });

      res.then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch scheduled statuses");
        }
        const data = await response.json();
        const next = response.next();
        this.fetchScheduledStatuses(data);
        root.statusLists.fetchScheduledStatusesSuccess(data, next);
      });
    } catch (error) {
      root.statusLists.fetchOrExpandScheduledStatusesFail();
      console.error("Error fetching scheduled statuses:", error); 
    }
  },

  async cancelScheduledStatus(id) {
    const root = rootGet();
    this.cancelScheduledStatusRequest(id);
    root.statusLists.cancelScheduledStatusesRequestOrSuccess(id);

    try {
       const res = await fetch(`/api/v1/scheduled_statuses/${id}`, {
        method: "DELETE",
        headers: {  
          "Content-Type": "application/json",
        },
      });

      res.then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to cancel scheduled status");
        }
        const data = await response.json();
        this.cancelScheduledStatusSuccess(data);
        root.statusLists.cancelScheduledStatusesRequestOrSuccess(id);
      });
    } catch (error) {
      root.statusLists.fetchOrExpandScheduledStatusesFail(id);
      console.error("Error cancelling scheduled status:", error); 
    }
  },
  
  async expandScheduledStatuses() {
    const root = rootGet();
    const url = root.statusLists['scheduled_statuses']?.next || null;

    if (url === null || root.statusLists['scheduled_statuses']?.isLoading) {
      return;
    }

    root.statusLists.fetchOrExpandScheduledStatusesRequest();

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {  
          "Content-Type": "application/json",
        },
      });

      res.then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to expand scheduled statuses");
        }
        const data = await response.json();
        const next = response.next();
        this.fetchScheduledStatuses(data);
        root.statusLists.expandScheduledStatusesSuccess(data, next);
      });
    } catch (error) {
      root.statusLists.fetchOrExpandScheduledStatusesFail();
      console.error("Error expanding scheduled statuses:", error); 
    } 
  },

  
});
