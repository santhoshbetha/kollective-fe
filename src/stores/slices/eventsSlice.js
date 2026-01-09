// Action-only slice for event operations (subscribe/unsubscribe/trigger). No local state — only actions.

import { isLoggedIn } from "../../utils/auth";

export function createEventsSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    
    locationSearch(query, signal) {
        fetch(`/api/v1/events/search/location?q=${encodeURIComponent(query)}`, { signal }).then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to search locations (${res.status})`);
          }
          return res.json();
        }).then((locations) => {
          const root = rootGet();
          root.locations.locationSearchSuccess(locations)
          return locations;
        }).catch((err) => {
          console.error('eventsSlice.locationSearch failed', err);
          return null;
        });
    },

    changeEditEventLocation(value) {
        const root = rootGet();
        let location = null;
        if (value) {
          location = root.locations[ value ] || null;
        }
        root.composeEvent.editEventLocation(location);
    },

    uploadEventBanner(file, intl) {
        const root = rootGet();
        let progress = 0;

        root.composeEvent.eventBannerUploadRequest(true);

        this.media.uploadFile(
            file,
            intl,
            (data) => this.eventBannerUploadSuccess(data, file),
            (error) => this.eventBannerUploadFail(error),
            ({ loaded }) => {
                progress = loaded;
                this.eventBannerUploadProgress(progress);
            },
        );
    },

    submitEvent() {
        const root = rootGet();

        const id        = root.compose_event.id;
        const name      = root.compose_event.name;
        const status    = root.compose_event.status;
        const banner    = root.compose_event.banner;
        const startTime = root.compose_event.start_time;
        const endTime   = root.compose_event.end_time;
        const joinMode  = root.compose_event.approval_required ? 'restricted' : 'free';
        const location  = root.compose_event.location;

        if (!name || !name.length) {
          return;
        }

        this.composeEvents.eventSubmitRequest();

        const params = {
            name,
            status,
            start_time: startTime,
            join_mode: joinMode,
            content_type: 'text/markdown',
        };

        if (endTime)  params.end_time    = endTime;
        if (banner)   params.banner_id   = banner.id;
        if (location) params.location_id = location.origin_id; //san this location

        const method = id === null ? 'POST' : 'PUT';
        const path = id === null ? '/api/v1/events' : `/api/v1/events/${id}`;

        fetch(path, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        }).then((res) => {
            if (!res.ok) {
                throw new Error(`Failed to submit event (${res.status})`);
            }
            return res.json();
        }).then((data) => {
            const root = rootGet();
            this.modal.closeModalAction('COMPASE_EVENT');
            this.importer.importFetchedStatus(data);
            root.composeEvent.eventSubmitSuccess(data);
            //TODO: toast success
            return data;
        }).catch((err) => {
            console.error('eventsSlice.submitEvent failed', err);
            const root = rootGet();
            root.composeEvent.eventSubmitFail(err);
            return null;
        });
    },

    joinEvent(id, participationMessage) {
        const root = rootGet();
        const status = root.statuses[id];

        if (!status || !status.event || status.event.join_state) {
            return null;
        }

        fetch(`/api/v1/events/${id}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: participationMessage }),    
        }).then((res) => {
            if (!res.ok) {
                throw new Error(`Failed to join event (${res.status})`);
            }   
            return res.json();
        }
        ).then((data) => {
            root.importer.importFetchedStatus(data);
            // TOSDO: toast success
            return data;
        }).catch((err) => {     
            root.statuses.joinEventFail(err, status, status?.event?.join_state || null)
            console.error('eventsSlice.joinEvent failed', err);
            return null;
        });
    },

    leaveEvent(id) {
        const root = rootGet();
        const status = root.statuses[id];
        if (!status || !status.event || !status.event.join_state) {
            return null;
        }

        root.statuses.leaveEventRequest(status);

        fetch(`/api/v1/events/${id}/leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        }).then((res) => {
            if (!res.ok) {
                throw new Error(`Failed to leave event (${res.status})`);
            }
            return res.json();
        }).then((data) => {
            root.importer.importFetchedStatus(data);
            root.statuses.leaveEventSuccess(data);
            return data;
        }).catch((err) => {
            root.statuses.leaveEventFail(err, status);
            console.error('eventsSlice.leaveEvent failed', err);
            return null;
        });
    },

    fetchEventParticipations(id) {
       fetch(`/api/v1/events/${id}/participations`, {
            method: 'GET',
        }).then((res) => {
            if (!res.ok) {
                throw new Error(`Failed to fetch event participations (${res.status})`);
            }
            return res.json();
        }).then((data) => {
            const root = rootGet();
            root.importer.importFetchedAccounts(data);
            root.userLists.fetchEventParticipationsSuccess(id, data, null);
            return data;
        }).catch((err) => {
            console.error('eventsSlice.fetchEventParticipations failed', err);
            return null;
        });
    },

    expandEventParticipations(id) {
        const root = rootGet();
        const url = root.userLists.event_participations[id]?.next || null;
        if (!url) return null;

        fetch(url, {
            method: 'GET',
        }).then((res) => {
            if (!res.ok) {
                throw new Error(`Failed to fetch event participations (${res.status})`);
            }
            return res.json();
        }).then((data) => {
            root.importer.importFetchedAccounts(data);
            root.userLists.expandEventParticipationsSuccess(id, data, null);
            return data;
        }).catch((err) => {
            console.error('eventsSlice.expandEventParticipations failed', err);
            return null;
        });
    },

    fetchEventParticipationRequests(id) {
       fetch(`/api/v1/events/${id}/participation_requests`, {
            method: 'GET',
        }).then((res) => {
            if (!res.ok) {
                throw new Error(`Failed to fetch event participation requests (${res.status})`);
            }   
            return res.json();
        }).then((data) => {
            const root = rootGet();
            root.importer.importFetchedAccounts(data.map(({ account }) => account));
            root.userLists.fetchEventParticipationRequestsSuccess(id, data, null);
            return data;
        }
        ).catch((err) => {
            console.error('eventsSlice.fetchEventParticipationRequests failed', err);
            return null;
        });
    },

    expandEventParticipationRequests(id) {
        const root = rootGet();
        const url = root.userLists.event_participations[id]?.next || null;
        if (!url) return null;
        fetch(url, {
            method: 'GET',
        }).then((res) => {
            if (!res.ok) {  
                throw new Error(`Failed to fetch event participation requests (${res.status})`);
            }   
            return res.json();
        }).then((data) => {
            root.importer.importFetchedAccounts(data.map(({ account }) => account));
            root.userLists.expandEventParticipationRequestsSuccess(id, data, null);
            return data;
        }).catch((err) => {
            console.error('eventsSlice.expandEventParticipationRequests failed', err);
            return null;
        });
    },

    authorizeEventParticipaionRequest(id, accountId) {
        const root = rootGet();
        fetch(`/api/v1/events/${id}/participation_requests/${accountId}/authorize`, {
            method: 'POST',
        }).then((res) => {
            if (!res.ok) {
                throw new Error(`Failed to authorize event participation request (${res.status})`);
            }   
            return res.json();
        }).then((data) => {
            root.userLists.authorizeOrRejectEventParticipationRequestSuccess(id, accountId, data);
            return data;
        }).catch((err) => {
            console.error('eventsSlice.authorizeEventParticipaionRequest failed', err);
            return null;
        });
    },

    rejectEventParticipationRequest(id, accountId) {
        const root = rootGet();
        fetch(`/api/v1/events/${id}/participation_requests/${accountId}/reject`, {
            method: 'POST',
        }).then((res) => {
            if (!res.ok) {
                throw new Error(`Failed to reject event participation request (${res.status})`);
            }   
            return res.json();
        }).then((data) => {
            root.userLists.authorizeOrRejectEventParticipationRequestSuccess(id, accountId, data);
            return data;
        }   
        ).catch((err) => {
            console.error('eventsSlice.rejectEventParticipationRequest failed', err);
            return null;
        });
    },

    fetchEventIcs(id) {
        fetch(`/api/v1/events/${id}/ics`, {
            method: 'GET',
        }).then((res) => {
            if (!res.ok) {
                throw new Error(`Failed to fetch event ICS (${res.status})`);
            }
            return res.text();  //TODO check later
        }).catch((err) => {
            console.error('eventsSlice.fetchEventIcs failed', err);
            return null;
        });
    },

    editEvent(id) {
        const root = rootGet();
        const status = root.statuses[id];

        if (!status || !status.event) {
            return null;
        }
        
        fetch(`/api/v1/events/${id}/source`, {
            method: 'GET',
        }).then((res) => {
            if (!res.ok) {
                throw new Error(`Failed to fetch event source (${res.status})`);
            }
            return res.json();
        }).then((data) => {
            root.compose.eventformSet(status, data.text, data.location);
            root.composeEvent.eventformSet(status, data.text, data.location);
            return data;
        }).catch((err) => {
            console.error('eventsSlice.editEvent failed', err);
            return null;
        });
    },

    fetchRecentEvents() {
        const root = rootGet();
        if (root.status_lists['recent_events']?.isLoading) {
          return;
        }

        fetch(`/api/v1/timelines/public?only_events=true`, {
            method: 'GET',
        }).then((res) => {
            if (!res.ok) {
                throw new Error(`Failed to fetch recent events (${res.status})`);
            }
            const data = res.json();
            const next = res.next();
            root.statusLists.fetchRecentEventsSuccess(data, next);
            return data;
        }).catch((err) => {
            root.statusLists.fetchRecentEventsFail(err);
            console.error('eventsSlice.fetchRecentEvents failed', err);
            return null;
        });
    },

    fetchJoinedEvents() {
        const root = rootGet();
        if (root.status_lists['joined_events']?.isLoading) {
          return;
        }       
        fetch(`/api/v1/pleroma/events/joined_events`, {
            method: 'GET',
        }).then((res) => {
            if (!res.ok) {
                throw new Error(`Failed to fetch joined events (${res.status})`);
            }
            const data = res.json();
            const next = res.next();
            root.statusLists.fetchJoinedEventsSuccess(data, next);
            return data;
        }).catch((err) => {
            root.statusLists.fetchJoinedEventsFail(err);
            console.error('eventsSlice.fetchJoinedEvents failed', err);
            return null;
        });
    }
  };
}

export default createEventsSlice;
