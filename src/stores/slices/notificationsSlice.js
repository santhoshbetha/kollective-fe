import normalizeNotification from "../../normalizers/notification.js";
import { validType } from "../../utils/notification.js";
import { asPlain } from "../../utils/immutableSafe.js";
import { getIn } from "../../utils/immutableSafe.js";
import { getFilters, regexFromFilters } from "../../selectors/index.js";
import { htmlToPlaintext } from "../../utils/html.js";
import { isLoggedIn } from "../../utils/auth.js";
import { getFeatures } from "../../utils/features.js";
import { NOTIFICATION_TYPES, EXCLUDE_TYPES, excludeTypesFromFilter } from "../../utils/notification.js";
import { compareId } from "../../utils/comparators.js";
import useBoundStore from "../boundStore.js";

// Lightweight message templates (avoid pulling in `react-intl`/`intl-messageformat` here)
const NOTIFICATION_TEMPLATES = {
  'notification.mention': '{name} mentioned you',
  'notifications.group': '{count} notifications',
};

const MAX_QUEUED_NOTIFICATIONS = 40;

const parseId = (id) => parseInt(id, 10);

// For sorting the notifications
const comparator = (a, b) => {
  const parse = (m) => parseId(m.id);
  if (parse(a) < parse(b)) return 1;
  if (parse(a) > parse(b)) return -1;
  return 0;
};

const minifyNotification = (notification) => {
  const n = notification || {};
  const accountId = n.account.id || n.account;
  const targetId = n.target.id || n.target;
  const statusId = n.status.id || n.status;

  return {
    ...n,
    account: accountId,
    target: targetId,
    status: statusId,
  };
};

//const fixNotification = (notification) => {
 // const normalized = normalizeNotification(notification) || {};
  //return minifyNotification(normalized);
//};

const fixNotification = (n) => {
  const normalized = normalizeNotification(n) || {};
  return {
    ...normalized,
    account: normalized.account?.id ?? normalized.account,
    target: normalized.target?.id ?? normalized.target,
    status: normalized.status?.id ?? normalized.status,
  };
};

const sortMapById = (map) => {
  const entries = Array.from(map.entries()).sort((a, b) => {
    return parseInt(b[0], 10) - parseInt(a[0], 10); // Simple descending ID sort
  });
  return new Map(entries);
};

/*const isValid = (notification) => {
  try {
    if (!notification || typeof notification !== "object") return false;
    // Ensure the notification is a known type
    if (!validType(notification.type)) return false;

    // Ensure account exists: it may be an object with `id` or a primitive id
    const acct = notification.account;
    if (!acct) return false;
    if (typeof acct === "object") {
      if (!acct.id && acct.id !== 0) return false;
    }

    // For certain types ensure `status` is present (either id or object with id)
    if (
      ["mention", "reblog", "favourite", "poll", "status"].includes(
        notification.type,
      )
    ) {
      const st = notification.status;
      if (!st) return false;
      if (typeof st === "object") {
        if (!st.id && st.id !== 0) return false;
      }
    }

    return true;
  } catch {
    return false;
  }
};*/

const isValid = (n) => {
  if (!n || typeof n !== "object" || !validType(n.type)) return false;
  if (!n.account || (typeof n.account === "object" && n.account.id == null)) return false;
  
  const needsStatus = ["mention", "reblog", "favourite", "poll", "status"].includes(n.type);
  if (needsStatus && (!n.status || (typeof n.status === "object" && n.status.id == null))) return false;
  
  return true;
};

const countFuture = (notifications, lastId) => {
  const last = parseId(lastId);
  if (!last || last <= 0) return 0;
  let acc = 0;

  if (notifications instanceof Map) {
    for (const [key, notification] of notifications.entries()) {
      const nid = parseId(key ?? (notification && notification.id));
      if (nid > last) acc += 1;
    }
    return acc;
  }

  if (Array.isArray(notifications)) {
    for (const notification of notifications) {
      const nid = parseId(notification && (notification.id ?? notification));
      if (nid > last) acc += 1;
    }
    return acc;
  }

  // Fallback: iterate object values
  if (notifications && typeof notifications === "object") {
    for (const k of Object.keys(notifications)) {
      const notification = notifications[k];
      const nid = parseId(k ?? (notification && notification.id));
      if (nid > last) acc += 1;
    }
  }

  return acc;
};

const noOp = () => new Promise(f => f(undefined));

export function createNotificationsSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();

  // Private helper for removing follow request notifications
  const removeFollowRequests = (state, accountId) => {
    for (const [id, notification] of state.items.entries()) {
      if (
        notification.account === accountId &&
        notification.type === "follow_request"
      ) {
        state.items.delete(id);
      }
    }
  };

  const updateUnreadFromMarker = (state, marker) => {
    let lastReadId = -1;
    try {
      const m = asPlain(marker) || {};
      const n = m.notifications || {};
      lastReadId = n.last_read_id ?? n.lastReadId ?? -1;
    } catch {
      lastReadId = -1;
    }

    const parsedId = parseId(lastReadId);
    if (!lastReadId || parsedId <= 0) return;

    state.unread = countFuture(state.items, lastReadId);
    state.lastRead = lastReadId;
  };

  return {
    items: new Map(),
    queuedNotifications: new Map(),
    hasMore: true,
    top: false,
    unread: 0,
    isLoading: false,
    totalQueuedNotificationsCount: 0,
    lastRead: -1,

    expandNotificationsRequest: () => setScoped(s => { s.isLoading = true; }),
    expandNotificationsFail: () => setScoped(s => { s.isLoading = false; }),

    setNotificationsFilter() {
      setScoped((state) => {
        state.items = new Map();
        state.hasMore = true;
      });
    },

    scrollToTopNotifications(top) {
      setScoped((state) => {
        if (top) state.unread = 0;
        state.top = top;
      });
    },

    updateNotifications(notification) {
      setScoped((state) => {
        // Handle Map pruning if at top
        if (state.top && state.items.size > 40) {
          const kept = Array.from(state.items.entries()).slice(0, 20);
          state.items = new Map(kept);
        }

        state.items.set(notification.id, fixNotification(notification));
        state.items = sortMapById(state.items);
      });
    },

    updateNotificationsQueue(notification, intlMessages, intlLocale) {
      setScoped((state) => {
        if (state.queuedNotifications.has(notification.id) || state.items.has(notification.id)) {
          return;
        }

        state.queuedNotifications.set(notification.id, {
          notification,
          intlMessages,
          intlLocale,
        });

        state.queuedNotifications = sortMapById(state.queuedNotifications);
        state.totalQueuedNotificationsCount += 1;

        // Trim Queue
        if (state.queuedNotifications.size > MAX_QUEUED_NOTIFICATIONS) {
          const trimmed = Array.from(state.queuedNotifications.entries()).slice(0, MAX_QUEUED_NOTIFICATIONS);
          state.queuedNotifications = new Map(trimmed);
        }
      });
    },

    dequeueNotifications() {
      setScoped((state) => {
        state.queuedNotifications = new Map();
        state.totalQueuedNotificationsCount = 0;
      });
    },

    expandNotificationsSuccess(notifications, next) {
      setScoped((state) => {
        notifications.forEach((n) => {
          const normalized = normalizeNotification(n);
          if (isValid(normalized)) {
            state.items.set(normalized.id, fixNotification(n));
          }
        });

        state.items = sortMapById(state.items);
        state.hasMore = !!next;
        state.isLoading = false;
      });
    },

    blockAccountSuccess(relationship) {
      setScoped((state) => {
        const blockedId = relationship.id;
        for (const [id, n] of state.items.entries()) {
          if (n.account === blockedId) {
            state.items.delete(id);
          }
        }
      });
    },

    muteAccountSuccess(relationship) {
      if (!relationship.muting_notifications) return;
      
      setScoped((state) => {
        const mutedId = relationship.id;
        for (const [id, n] of state.items.entries()) {
          if (n.account === mutedId) {
            state.items.delete(id);
          }
        }
      });
    },

    authorizeFollowRequestSuccess(accountId) {
      setScoped((state) => {
        removeFollowRequests(state, accountId);
      });
    },

    rejectFollowRequestSuccess(accountId) {
      setScoped((state) => {
        removeFollowRequests(state, accountId);
      });
    },

    clearNotifications() {
      setScoped((state) => {
        state.items = new Map();
        state.hasMore = true;
      });
    },

    markReadNotificationsRequest(lastRead) {
      setScoped((state) => {
        state.lastRead = lastRead;
      });
    },

    fetchMarkerSuccess(marker) {
      setScoped((state) => {
        updateUnreadFromMarker(state, marker);
      });
    },

    saveMarkerRequest(marker) {
      setScoped((state) => {
        updateUnreadFromMarker(state, marker);
      });
    },

    saveMarkerSuccess(marker) {
      setScoped((state) => {
        updateUnreadFromMarker(state, marker);
      });
    },

    deleteStatusFromNotifications(id) {
      setScoped((state) => {
        // Direct deletion on the Map draft via Immer
        state.items.delete(id);
      });
    },

    setNotification(payload) {
      setScoped((state) => {
        // Dynamic key check on the scoped state object
        if (Object.hasOwn(state, payload.timelineId)) {
          state[payload.timelineId] = payload.value;
        }
      });
    },

    resetNotifications() {
      setScoped((state) => {
        state.home = false;
        state.public = false;
        state.instance = false;
      });
    },

    fetchRelatedRelationships(notifications) {
      const actions = getActions();
      const accountIds = notifications
        .filter(n => n.type === 'follow')
        .map(n => n.account?.id)
        .filter(Boolean);

      if (accountIds.length === 0) return Promise.resolve();
      return actions.fetchRelationships(accountIds);
    },

    updateNotificationsAction(notification) {
      const actions = getActions();
      const showInColumn = actions.getSettings()?.notifications?.shows?.[notification.type] ?? true;

      // Batch import entities
      if (notification.account) actions.importFetchedAccount(notification.account);
      if (notification.target) actions.importFetchedAccount(notification.target);
      if (notification.status) actions.importFetchedStatus(notification.status);

      if (showInColumn) {
        actions.updateNotifications(notification);
        actions.updateFollowRequestNotifications?.(notification);
        actions.fetchRelatedRelationships([notification]);
      }
    },

    updateNotificationsQueueAction(notification, intlMessages, intlLocale, curPath) {
      const actions = getActions();
      
      // 1. Filter out ignored types
      if (!notification.type || ['pleroma:chat_mention', 'chat'].includes(notification.type)) return;

      const settings = actions.getSettings()?.notifications || {};
      const showAlert = settings.alerts?.[notification.type];
      const playSound = settings.sounds?.[notification.type];
      const filters = getFilters(rootGet(), { contextType: 'notifications' });
      
      let isFiltered = false;
      if (['mention', 'status'].includes(notification.type) && notification.status) {
        const regex = regexFromFilters(filters);
        const text = `${notification.status.spoiler_text}\n${htmlToPlaintext(notification.status.content)}`;
        isFiltered = !!(regex && regex.test(text));
      }

      // 2. Browser Notifications
      if (showAlert && !isFiltered && window.Notification?.permission === 'granted') {
        const template = intlMessages?.[`notification.${notification.type}`] || NOTIFICATION_TEMPLATES[`notification.${notification.type}`] || '{name}';
        const name = notification.account.display_name || notification.account.username;
        const title = template.replace('{name}', name);
        const body = notification.status?.spoiler_text || htmlToPlaintext(notification.status?.content || '');

        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title, {
            body,
            icon: notification.account.avatar,
            tag: notification.id,
            data: { url: '/notifications' },
          });
        }).catch(console.warn);
      }

      // 3. Audio & State
      if (playSound && !isFiltered) {
         useBoundStore.getState().playSound('boop');
      }

      if (curPath === '/notifications') {
        actions.updateNotificationsQueue(notification, intlMessages, intlLocale);
      } else {
        actions.updateNotifications(notification);
      }
    },

    dequeueNotificationsAction() {
      const actions = getActions();
      const { queuedNotifications, totalQueuedNotificationsCount } = getScoped();

      if (totalQueuedNotificationsCount === 0) return;

      if (totalQueuedNotificationsCount <= MAX_QUEUED_NOTIFICATIONS) {
        queuedNotifications.forEach(block => actions.updateNotificationsAction(block.notification));
      } else {
        actions.expandNotifications();
      }

      actions.dequeueNotifications();
      // Ensure markRead exists on your slice/root
      actions.markReadNotifications?.(); 
    },

    async expandNotifications({ maxId } = {}, done = noOp) {
      const actions = getActions();
      if (!isLoggedIn(rootGet()) || rootGet().notifications.isLoading) return await done();

      actions.expandNotificationsRequest();

      const settings = actions.getSettings()?.notifications || {};
      const activeFilter = settings.quickFilter?.active;
      const features = getFeatures();
      
      const params = new URLSearchParams();
      if (maxId) params.append('max_id', maxId);

      // Handle Filtering Logic
      if (activeFilter === "all") {
        features.notificationsIncludeTypes 
          ? NOTIFICATION_TYPES.filter(t => !EXCLUDE_TYPES.includes(t)).forEach(t => params.append('types[]', t))
          : EXCLUDE_TYPES.forEach(t => params.append('exclude_types[]', t));
      } else if (activeFilter) {
        const filters = Array.isArray(activeFilter) ? activeFilter : [activeFilter];
        features.notificationsIncludeTypes
          ? filters.forEach(t => params.append('types[]', t))
          : excludeTypesFromFilter(activeFilter).forEach(t => params.append('exclude_types[]', t));
      }

      try {
        const res = await fetch(`/api/v1/notifications?${params}`);
        if (!res.ok) throw new Error('Fetch failed');
        
        const data = await res.json();
        const next = res.headers.get('link');

        // Extract entities for importer
        const accounts = new Set();
        const statuses = new Set();
        data.forEach(item => {
          if (item.account) accounts.add(item.account);
          if (item.target) accounts.add(item.target);
          if (item.status) statuses.add(item.status);
        });

        actions.importFetchedAccounts(Array.from(accounts));
        actions.importFetchedStatuses(Array.from(statuses));

        actions.expandNotificationsSuccess(data, next, !!maxId);
        await actions.fetchRelatedRelationships(data);
      } catch (e) {
        actions.expandNotificationsFail();
      } finally {
        await done();
      }
    },

    clearNotificationsAction() {
      const actions = getActions();
      if (!isLoggedIn(rootGet())) return;

      actions.clearNotifications();
      fetch('/api/v1/notifications/clear', { method: 'POST' }).catch(console.warn);
    },

    scrollTopNotifications(top) {
      const actions = getActions();
      actions.scrollToTopNotifications(top);
      actions.markReadNotifications();
    },

    setFilter(filterType) {
      const actions = getActions();

      // Update both local slice state and persistent settings
      actions.setNotificationsFilter(['notifications', 'quickFilter', 'active'], filterType);
      actions.setNotificationsFilter?.(['notifications', 'quickFilter', 'active'], filterType);
      
      actions.expandNotifications();
      actions.saveSettings?.();
    },

    async markRead(max_id) {
      try {
        // Return the fetch promise so callers can await it if necessary
        return await fetch('/api/v1/notifications/mark_read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ max_id }),
        });
      } catch (e) {
        console.error('notificationsSlice.markRead failed', e);
        return null;
      }
    },

    markReadNotifications() {
      const actions = getActions();
      if (!isLoggedIn(rootGet())) return;

      // Access state safely from scoped getter
      const { items, lastRead } = getScoped();
      
      // Get the first (newest) entry in the Map
      const firstEntry = items.entries().next();
      if (firstEntry.done) return;

      const topNotificationId = firstEntry.value[1]?.id ?? firstEntry.value[0];
      const parsedLastRead = parseId(lastRead);

      if (topNotificationId && (parsedLastRead <= 0 || compareId(topNotificationId, lastRead) > 0)) {
        const marker = {
          notifications: {
            last_read_id: topNotificationId,
          },
        };

        // Coordinate with markers slice and API
        actions.saveMarker?.(marker);
        actions.markRead(topNotificationId);
      }
    },
  };
}

export default createNotificationsSlice;
