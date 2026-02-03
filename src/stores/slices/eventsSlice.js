// Action-only slice for event operations (subscribe/unsubscribe/trigger). No local state — only actions.
export function createEventsSlice(setScoped, getScoped, rootSet, rootGet) {
  // Helper to access all root-level actions
  const getActions = () => rootGet();
  return {
    
    async locationSearch(query, signal) {
      try {
        const res = await fetch(`/api/v1/events/search/location?q=${encodeURIComponent(query)}`, { signal });
        if (!res.ok) throw new Error(`Location search failed (${res.status})`);
        
        const locations = await res.json();
        // Notify locations slice via root action
        getActions().locationSearchSuccess?.(locations);
        return locations;
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('eventsSlice.locationSearch failed', err);
        return null;
      }
    },

    changeEditEventLocation(value) {
      const state = rootGet();
      const actions = getActions();
      
      // Look up location object from the locations slice data
      const location = value ? (state.locations?.[value] || null) : null;
      
      // Update the compose event state
      actions.editEventLocation?.(location);
    },

    uploadEventBanner(file, intl) {
      const actions = getActions();
      
      // Trigger request state in composeEvent slice
      actions.eventBannerUploadRequest?.(true);

      // Delegate to media slice for actual upload
      actions.uploadFile?.(
        file,
        intl,
        (data) => actions.eventBannerUploadSuccess?.(data),
        (error) => actions.eventBannerUploadFail?.(error),
        ({ loaded, total }) => {
          actions.eventBannerUploadProgress?.(loaded / total);
        }
      );
    },

    async submitEvent() {
      const state = rootGet();
      const actions = getActions();
      const eventData = state.composeEvent; // Assuming state key

      if (!eventData?.name?.length) return;

      actions.eventSubmitRequest?.();

      const params = {
        name: eventData.name,
        status: eventData.status,
        start_time: eventData.start_time,
        join_mode: eventData.approval_required ? 'restricted' : 'free',
        content_type: 'text/markdown',
      };

      if (eventData.end_time) params.end_time = eventData.end_time;
      if (eventData.banner) params.banner_id = eventData.banner.id;
      if (eventData.location) params.location_id = eventData.location.origin_id;

      const method = eventData.id === null ? 'POST' : 'PUT';
      const path = eventData.id === null ? '/api/v1/events' : `/api/v1/events/${eventData.id}`;

      try {
        const res = await fetch(path, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (!res.ok) throw new Error(`Submit failed (${res.status})`);
        
        const data = await res.json();

        actions.closeModalAction?.('COMPASE_EVENT');
        actions.importFetchedStatus?.(data);
        actions.eventSubmitSuccess?.(data);
        
        return data;
      } catch (err) {
        console.error('eventsSlice.submitEvent failed', err);
        actions.eventSubmitFail?.(err);
        return null;
      }
    },

    async joinEvent(id, participationMessage) {
      const state = rootGet();
      const actions = getActions();
      const status = state.statuses?.[id];

      if (!status?.event || status.event.join_state) return null;

      try {
        const res = await fetch(`/api/v1/events/${id}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: participationMessage }),
        });

        if (!res.ok) throw new Error(`Join failed (${res.status})`);
        
        const data = await res.json();
        actions.importFetchedStatus?.(data);
        return data;
      } catch (err) {
        console.error('eventsSlice.joinEvent failed', err);
        actions.joinEventFail?.(err, status);
        return null;
      }
    },

    async leaveEvent(id) {
      const state = rootGet();
      const actions = getActions();
      const status = state.statuses?.[id];

      if (!status?.event?.join_state) return null;

      actions.leaveEventRequest?.(status);

      try {
        const res = await fetch(`/api/v1/events/${id}/leave`, { method: 'POST' });
        if (!res.ok) throw new Error(`Leave failed (${res.status})`);
        
        const data = await res.json();
        actions.importFetchedStatus?.(data);
        actions.leaveEventSuccess?.(data);
        return data;
      } catch (err) {
        console.error('eventsSlice.leaveEvent failed', err);
        actions.leaveEventFail?.(err, status);
        return null;
      }
    },

    async fetchEventParticipations(id) {
      const actions = getActions();
      try {
        const res = await fetch(`/api/v1/events/${id}/participations`, { method: 'GET' });
        if (!res.ok) throw new Error(res.status);
        
        const data = await res.json();
        actions.importFetchedAccounts?.(data);
        actions.fetchEventParticipationsSuccess?.(id, data, null);
        return data;
      } catch (err) {
        console.error('eventsSlice.fetchEventParticipations failed', err);
        return null;
      }
    },

    async expandEventParticipations(id) {
      const state = rootGet();
      const actions = getActions();
      const url = state.userLists?.event_participations?.[id]?.next;
      if (!url) return null;

      try {
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) throw new Error(res.status);
        
        const data = await res.json();
        actions.importFetchedAccounts?.(data);
        actions.expandEventParticipationsSuccess?.(id, data, null);
        return data;
      } catch (err) {
        console.error('eventsSlice.expandEventParticipations failed', err);
        return null;
      }
    },

    async fetchEventParticipationRequests(id) {
      const actions = getActions();
      try {
        const res = await fetch(`/api/v1/events/${id}/participation_requests`, { method: 'GET' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        
        // Map account objects from the request objects
        const accounts = data.map(({ account }) => account);
        actions.importFetchedAccounts?.(accounts);
        
        // Notify userLists using uniquely named root action
        actions.fetchEventParticipationRequestsSuccess?.(id, data, null);
        return data;
      } catch (err) {
        console.error('eventsSlice.fetchEventParticipationRequests failed', err);
        return null;
      }
    },

    async expandEventParticipationRequests(id) {
      const state = rootGet();
      const actions = getActions();
      
      // Reach into userLists state via root
      const url = state.userLists?.event_participations?.[id]?.next;
      if (!url) return null;

      try {
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        const accounts = data.map(({ account }) => account);
        
        actions.importFetchedAccounts?.(accounts);
        actions.expandEventParticipationRequestsSuccess?.(id, data, null);
        return data;
      } catch (err) {
        console.error('eventsSlice.expandEventParticipationRequests failed', err);
        return null;
      }
    },

    async authorizeEventParticipationRequest(id, accountId) {
      const actions = getActions();
      try {
        const res = await fetch(`/api/v1/events/${id}/participation_requests/${accountId}/authorize`, {
          method: 'POST'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        actions.authorizeOrRejectEventParticipationRequestSuccess?.(id, accountId, data);
        return data;
      } catch (err) {
        console.error('eventsSlice.authorizeEventParticipationRequest failed', err);
        return null;
      }
    },

    async rejectEventParticipationRequest(id, accountId) {
      const actions = getActions();
      try {
        const res = await fetch(`/api/v1/events/${id}/participation_requests/${accountId}/reject`, {
          method: 'POST'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        actions.authorizeOrRejectEventParticipationRequestSuccess?.(id, accountId, data);
        return data;
      } catch (err) {
        console.error('eventsSlice.rejectEventParticipationRequest failed', err);
        return null;
      }
    },

    async fetchEventIcs(id) {
      if (!id) return null;

      try {
        const res = await fetch(`/api/v1/events/${id}/ics`, {
          method: 'GET',
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch event ICS (${res.status})`);
        }

        // 1. Read as text (standard for iCalendar files)
        const icsData = await res.text();

        // 2. Since this isn't a state update, we return the text 
        // so the UI can trigger a download or parse it.
        return icsData;
      } catch (err) {
        console.error('eventsSlice.fetchEventIcs failed', err);
        return null;
      }
    },

    // Optional helper to trigger a browser download of the ICS file
    async downloadEventIcs(id, fileName = 'event.ics') {
      const data = await this.fetchEventIcs(id);
      if (!data) return;

      const blob = new Blob([data], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    },    

    async editEvent(id) {
      const state = rootGet();
      const actions = getActions();
      const status = state.statuses?.[id];

      if (!status?.event) return null;
      
      try {
        const res = await fetch(`/api/v1/events/${id}/source`, { method: 'GET' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        
        // Update both compose slices via root actions
        actions.eventformSet?.(status, data.text, data.location);
        // Note: ensure your slice names/actions are unique to avoid collisions
        return data;
      } catch (err) {
        console.error('eventsSlice.editEvent failed', err);
        return null;
      }
    },

    async fetchRecentEvents() {
      const state = rootGet();
      const actions = getActions();
      
      // Check loading state in statusLists slice
      if (state.statusLists?.recent_events?.isLoading) return;

      try {
        const res = await fetch(`/api/v1/timelines/public?only_events=true`, { method: 'GET' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        // Standard JS regex for Link header pagination
        const link = res.headers.get('Link');
        const next = link?.match(/<([^>]+)>;\s*rel="next"/i)?.[1] || null;

        actions.fetchRecentEventsSuccess?.(data, next);
        return data;
      } catch (err) {
        actions.fetchRecentEventsFail?.(err);
        console.error('eventsSlice.fetchRecentEvents failed', err);
        return null;
      }
    },

    async fetchJoinedEvents() {
      const state = rootGet();
      const actions = getActions();

      // 1. Check loading state using standard JS property access
      if (state.statusLists?.['joined_events']?.isLoading) {
        return;
      }

      try {
        const res = await fetch(`/api/v1/kollective/events/joined_events`, {
          method: 'GET',
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch joined events (${res.status})`);
        }

        const data = await res.json();
        
        // 2. Parse pagination from Link header (native fetch replacement for .next())
        const link = res.headers.get('Link');
        const next = link?.match(/<([^>]+)>;\s*rel="next"/i)?.[1] || null;

        // 3. Trigger success via root-level action
        actions.fetchJoinedEventsSuccess?.(data, next);
        
        return data;
      } catch (err) {
        // 4. Trigger fail via root-level action
        actions.fetchJoinedEventsFail?.(err);
        console.error('eventsSlice.fetchJoinedEvents failed', err);
        return null;
      }
    },
  };
}

export default createEventsSlice;
