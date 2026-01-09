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

const fixNotification = (notification) => {
  const normalized = normalizeNotification(notification) || {};
  return minifyNotification(normalized);
};

const isValid = (notification) => {
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
  return {
    items: new Map(),
    hasMore: true,
    top: false,
    unread: 0,
    isLoading: false,
    queuedNotifications: new Map(), //max = MAX_QUEUED_NOTIFICATIONS
    totalQueuedNotificationsCount: 0, //used for queuedItems overflow for MAX_QUEUED_NOTIFICATIONS+
    lastRead: -1,

    expandNotificationsRequest() {
      setScoped((state) => {
        state.isLoading = true;
      });
    },

    expandNotificationsFail() {
      setScoped((state) => {
        state.isLoading = false;
      });
    },

    setNotificationsFilter(path, value) {
      setScoped((state) => {
        state.items = new Map();
        state.hasMore = true;
      });
    },

    scrollToTopNotifications(top) {
      setScoped((state) => {
        if (top) {
          state.unread = 0;
        }
        state.top = top;
      });
    },

    updateNotifications(notification) {
      setScoped((state) => {
        let newMap = new Map(state.items);

        if (state.top && newMap.size > 40) {
          // Take the first 20 entries. Note: Native JS Map doesn't have a 'take' method.
          // We simulate this by creating a new Map from a slice of the entries.
          const entries = Array.from(newMap.entries()).slice(0, 20);
          newMap = new Map(entries);
        }

        // Set the new notification (overwrites if ID exists)
        newMap.set(notification.id, fixNotification(notification));

        // Sort the entries. Native JS Map iteration order is insertion order,
        // so sorting requires converting to an array, sorting, then converting back.
        const sortedEntries = Array.from(newMap.entries()).sort((a, b) =>
          comparator(a[1], b[1]),
        );
        newMap = new Map(sortedEntries);

        return { items: newMap };
      });
    },

    updateNotificationsQueue(notification, intlMessages, intlLocale) {
      setScoped((state) => {
        let newMap = new Map(state.queuedNotifications);

        const alreadyExists =
          state.queuedNotifications.has(notification.id) ||
          state.items.has(notification.id);
        if (alreadyExists) return state;

        // Set the new notification (overwrites if ID exists)
        newMap.set(notification.id, {
          notification: notification,
          intlMessages: intlMessages,
          intlLocale: intlLocale,
        });

        // Sort the entries by the inner notification object
        const sortedEntries = Array.from(newMap.entries()).sort((a, b) =>
          comparator(a[1].notification, b[1].notification),
        );
        newMap = new Map(sortedEntries);

        const MAX_QUEUED_NOTIFICATIONS = 40;
        // Trim to max size
        if (newMap.size > MAX_QUEUED_NOTIFICATIONS) {
          const entries = Array.from(newMap.entries()).slice(
            0,
            MAX_QUEUED_NOTIFICATIONS,
          );
          newMap = new Map(entries);
        }

        return {
          queuedNotifications: newMap,
          totalQueuedNotificationsCount:
            state.totalQueuedNotificationsCount + 1,
        };
      });
    },

    dequeueNotifications() {
      setScoped((state) => {
        if (state.totalQueuedNotificationsCount <= 0) return state;

        // clear the queue
        return {
          queuedNotifications: new Map(),
          totalQueuedNotificationsCount: 0,
        };
      });
    },

    expandNotificationsSuccess(notifications, next) {
      setScoped((state) => {
        const newMap = new Map(state.items);

        const newItems = notifications.map(normalizeNotification);
        newItems.forEach((notification) => {
          if (isValid(notification)) {
            newMap.set(notification.id, fixNotification(notification));
          }
        });

        // Sort the entries
        const sortedEntries = Array.from(newMap.entries()).sort((a, b) =>
          comparator(a[1], b[1]),
        );
        return {
          items: new Map(sortedEntries),
          hasMore: !!next,
          isLoading: false,
        };
      });
    },

    blockAccountSuccess(relationship) {
      setScoped((state) => {
        const newMap = new Map(state.items);
        const blockedAccountId = relationship.id;

        // Remove notifications from the blocked account
        for (const [id, notification] of newMap.entries()) {
          if (notification.account === blockedAccountId) {
            newMap.delete(id);
          }
        }

        return { items: newMap };
      });
    },

    muteAccoutSuccess(relationship) {
      setScoped((state) => {
        if (!relationship.muting_notifications) {
          return state;
        }
        const newMap = new Map(state.items);
        const mutedAccountId = relationship.id;

        // Remove notifications from the muted account
        for (const [id, notification] of newMap.entries()) {
          if (notification.account === mutedAccountId) {
            newMap.delete(id);
          }
        }

        return { items: newMap };
      });
    },

    authorizeFollowRequestSuccess(accountId) {
      setScoped((state) => {
        const newMap = new Map(state.items);

        // Remove follow_request notifications for this account
        for (const [id, notification] of newMap.entries()) {
          if (
            notification.account === accountId &&
            notification.type === "follow_request"
          ) {
            newMap.delete(id);
          }
        }

        return { items: newMap };
      });
    },

    rejectFollowRequestSuccess(accountId) {
      setScoped((state) => {
        const newMap = new Map(state.items);

        // Remove follow_request notifications for this account
        for (const [id, notification] of newMap.entries()) {
          if (
            notification.account === accountId &&
            notification.type === "follow_request"
          ) {
            newMap.delete(id);
          }
        }

        return { items: newMap };
      });
    },

    clearNotifications() {
      setScoped((state) => {
        return {
          items: new Map(),
          hasMore: true,
        };
      });
    },

    markReadNotificationsRequest(lastRead) {
      setScoped((state) => {
        state.lastRead = lastRead;
      });
    },

    fetchMarkerSuccess(marker) {
      setScoped((state) => {
        // marker may be Immutable-like or plain JS — normalize then read safely
        let lastReadId = -1;
        try {
          const m = asPlain(marker) || {};
          lastReadId = (m.notifications && (m.notifications.last_read_id ?? m.notifications.lastReadId)) ?? -1;
        } catch {
          lastReadId = -1;
        }

        lastReadId = lastReadId == null ? -1 : lastReadId;
        if (!lastReadId || parseId(lastReadId) <= 0) return state;

        const notifications = state.items;
        const unread = countFuture(notifications, lastReadId);

        state.unread = unread;
        state.lastRead = lastReadId;
      });
    },

    saveMarkerRequest(marker) {
      setScoped((state) => {
        // marker may be Immutable-like or plain JS — normalize then read safely
        let lastReadId = -1;
        try {
          const m = asPlain(marker) || {};
          lastReadId = (m.notifications && (m.notifications.last_read_id ?? m.notifications.lastReadId)) ?? -1;
        } catch {
          lastReadId = -1;
        }

        lastReadId = lastReadId == null ? -1 : lastReadId;
        if (!lastReadId || parseId(lastReadId) <= 0) return state;

        const notifications = state.items;
        const unread = countFuture(notifications, lastReadId);

        state.unread = unread;
        state.lastRead = lastReadId;
      });
    },

    saveMarkerSuccess(marker) {
      setScoped((state) => {
        // marker may be Immutable-like or plain JS — normalize then read safely
        let lastReadId = -1;
        try {
          const m = asPlain(marker) || {};
          lastReadId = (m.notifications && (m.notifications.last_read_id ?? m.notifications.lastReadId)) ?? -1;
        } catch {
          lastReadId = -1;
        }

        lastReadId = lastReadId == null ? -1 : lastReadId;
        if (!lastReadId || parseId(lastReadId) <= 0) return state;

        const notifications = state.items;
        const unread = countFuture(notifications, lastReadId);

        state.unread = unread;
        state.lastRead = lastReadId;
      });
    },


    deleteTimeline(id) {
      setScoped((state) => {
        const newMap = new Map(state.items);
        newMap.delete(id);
        return { items: newMap };
      });
    },

    setNotification(payload) {
      setScoped((state) => {
        if (payload.timelineId in state) {
          state[payload.timelineId] = payload.value;
        }
      });
    },

    resetNotifications() {
      setScoped((state) => {
        state.home = false
        state.public = false;
        state.instance = false;
      });
    },

    fetchRelatedRelationships(notifications) {
      const accountIds = notifications.filter(item => item.type === 'follow').map(item => item.account.id);
      if (accountIds.length === 0) return Promise.resolve();

      const root = rootGet();
      return root.accounts.fetchRelationships(accountIds);
    },

    updateNotificationsAction(notification) {
      const root = rootGet();
      const showInColumn = getIn(root.settings.getSettings(), ['notifications', 'shows', notification.type]) || true;

      if (notification.account) {
        root.importer.importFetchedAccount(notification.account);
      }

      // Used by Move notification
      if (notification.target) {
        root.importer.importFetchedAccount(notification.target);
      }

      if (notification.status) {
        root.importer.importFetchedStatus(notification.status);
      }

      if (showInColumn) {
        this.updateNotifications(notification);
        this.userLists.updateNotifications(notification);
        this.fetchRelatedRelationships([notification]);
      }
    },

    updateNotificationsQueueAction(notification, intlMessages, intlLocale, curPath) {
      const root = rootGet();
      if (!notification.type) return; // drop invalid notifications
      if (notification.type === 'pleroma:chat_mention') return; // Drop chat notifications, handle them per-chat
      if (notification.type === 'chat') return; // Drop Truth Social chat notifications.

      const showAlert = getIn(root.settings.getSettings(), ['notifications', 'alerts', notification.type]);
      const filters = getFilters(root, { contextType: 'notifications' });
      const playSound = getIn(root.settings.getSettings(), ['notifications', 'sounds', notification.type]);

      let filtered = false;
      const isOnNotificationsPage = curPath === '/notifications';

      if (['mention', 'status'].includes(notification.type)) {
        const regex = regexFromFilters(filters);
        const searchIndex = notification.status.spoiler_text + '\n' + htmlToPlaintext(notification.status.content);
        filtered = regex && regex.test(searchIndex);
      }

      try {
        // eslint-disable-next-line compat/compat
        const isNotificationsEnabled = window.Notification?.permission === 'granted';
        if (showAlert && !filtered && isNotificationsEnabled) {
          const template = (intlMessages && intlMessages[`notification.${notification.type}`]) || NOTIFICATION_TEMPLATES[`notification.${notification.type}`] || '{name}';
          const name = notification.account.display_name && notification.account.display_name.length > 0 ? notification.account.display_name : notification.account.username;
          const title = template.replace('{name}', name);
          const body = (notification.status && notification.status.spoiler_text.length > 0) ? notification.status.spoiler_text : htmlToPlaintext(notification.status ? notification.status.content : '');

          navigator.serviceWorker.ready.then(serviceWorkerRegistration => {
            serviceWorkerRegistration.showNotification(title, {
              body,
              icon: notification.account.avatar,
              tag: notification.id,
              data: {
                url: '/notifications',
              },
            }).catch(console.error);
          }).catch(console.error);
        }
      } catch (e) {
        console.warn(e);
      }

      if (playSound && !filtered) {
         useBoundStore.getState().playSound('boop');
      }

      if (isOnNotificationsPage) {
        this.updateNotificationsQueue(notification, intlMessages, intlLocale);
      } else {
        this.updateNotifications(notification);
      }
    },

    dequeueNotificationsAction() {
      const root = rootGet();
      const queuedNotifications = root.notifications.queuedNotifications;
      const totalQueuedNotificationsCount = root.notifications.totalQueuedNotificationsCount;

      if (totalQueuedNotificationsCount === 0) {
        return;
      } else if (totalQueuedNotificationsCount > 0 && totalQueuedNotificationsCount <= MAX_QUEUED_NOTIFICATIONS) {
        queuedNotifications.forEach((block) => {
          this.updateNotificationsAction(block.notification);
        });
      } else {
        this.expandNotifications();
      }

      this.dequeueNotifications();
      this.markReadNotifications();
    },

    async expandNotifications({ maxId } = {}, done = noOp) {
      const root = rootGet();
      if (!isLoggedIn(root)) return Promise.resolve();

      const features = getFeatures();
      const activeFilter = getIn(root.settings.getSettings(), [
        "notifications",
        "quickFilter",
        "active",
      ]);
      const isLoadingMore = !!maxId;

      // Avoid duplicate concurrent loads
      if (root.notifications.isLoading) {
        await done();
        return Promise.resolve();
      }

      this.expandNotificationsRequest();

      // Build params gently — support older object-shape logic while using URLSearchParams later
      const paramsObj = {};
      if (maxId) paramsObj.max_id = maxId;

      if (activeFilter === "all") {
        if (features.notificationsIncludeTypes) {
          paramsObj.types = NOTIFICATION_TYPES.filter((type) => !EXCLUDE_TYPES.includes(type));
        } else {
          paramsObj.exclude_types = EXCLUDE_TYPES;
        }
      } else if (activeFilter) {
        if (features.notificationsIncludeTypes) {
          paramsObj.types = Array.isArray(activeFilter) ? activeFilter : [activeFilter];
        } else {
          paramsObj.exclude_types = excludeTypesFromFilter(activeFilter);
        }
      }

      if (!maxId && root.notifications.items.size > 0) {
        paramsObj.since_id = getIn(root.notifications, ['items', 0, 'id']);
      }

      this.expandNotificationsRequest(isLoadingMore);

      try {
        const res = await fetch('/api/v1/notifications/' + new URLSearchParams(paramsObj), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            //Authorization: `Bearer ${root.auth.app?.access_token}`,
          },
        });
        if (!res.ok) throw new Error(`Failed to expand notifications (${res.status})`);
        const data = await res.json();
        // `res` is a native Response; parse `Link` header if present to find `next`.
        const link = res.headers ? res.headers.get('link') : null;
        const next = link ? link : null;

        const entries = (data).reduce((acc, item) => {
          if (item.account?.id) {
            acc.accounts[item.account.id] = item.account;
          }

          // Used by Move notification
          if (item.target?.id) {
            acc.accounts[item.target.id] = item.target;
          }

          if (item.status?.id) {
            acc.statuses[item.status.id] = item.status;
          }

          return acc;
        }, { accounts: {}, statuses: {} });

        root.importer.importFetchedAccounts(Object.values(entries.accounts));
        root.importer.importFetchedStatuses(Object.values(entries.statuses));

        const statusesFromGroups = (Object.values(entries.statuses)).filter((status) => !!status.group);
        const root = rootGet();
        root.groups?.fetchGroupRelationships?.(statusesFromGroups);

        this.expandNotificationsSuccess(data, next, isLoadingMore)

        await this.fetchRelatedRelationships(data || []);
        await done();
        return Promise.resolve();
      } catch (e) {
        this.expandNotificationsFail();
        console.error(e);
        await done();
        return Promise.resolve();
      }
    },

    clearNotificationsAction() {
      const root = rootGet();
      if (!isLoggedIn(root)) return;

      this.clearNotifications();

      try {
        void fetch('/api/v1/notifications/clear', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            //Authorization: `Bearer ${root.auth.app?.access_token}`,
          },
        });
      } catch (e) {
        console.error('notificationsSlice.clearNotifications failed', e);
      }
    },

    scrollTopNotifications(top) {
      this.scrollToTopNotifications(top);
      this.markReadNotifications();
    },

    setFilter(filterType) {
      const root = rootGet();

      this.setNotificationsFilter(['notifications', 'quickFilter', 'active'], filterType);
      root.settings.setNotificationsFilter(['notifications', 'quickFilter', 'active'], filterType);
      this.expandNotifications();
      this.settings.saveSettings();
    },

    markRead(max_id) {
      try {
        const res = fetch('/api/v1/notifications/mark_read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            //Authorization: `Bearer ${root.auth.app?.access_token}`,
          },
          body: JSON.stringify({ max_id }),
        });
        return res
      } catch (e) {
        console.error('notificationsSlice.markRead failed', e);
        return null;
      }
    },

    markReadNotififications() {
      const root = rootGet();
      if (!isLoggedIn(root)) return;
      // Get the first entry in the Map of notifications (if any)
      const firstEntry = this.items.entries().next();
      const topNotificationId = firstEntry.done ? undefined : (firstEntry.value[1]?.id ?? firstEntry.value[0]);
      const lastReadId = root.notifications.lastRead;
      if (!lastReadId || parseId(lastReadId) <= 0) return;

      if (topNotificationId && (lastReadId === -1 || compareId(topNotificationId, lastReadId) > 0)) {
        const marker = {
          notifications: {
            last_read_id: topNotificationId,
          },
        };

        this.markers.saveMarker(marker);
        this.markRead(topNotificationId)
      }
    },







  };
}

export default createNotificationsSlice;
