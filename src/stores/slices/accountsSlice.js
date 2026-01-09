// Action-only slice for account operations. This slice intentionally
// exposes no state — only actions that operate on the root store via
// `rootSet` and `rootGet`.

import { relationshipSchema } from "../../schemas/relationship";
import { selectAccount } from "../selectors/accountsSelector";
import { getFeatures } from "../../utils/features";
import { isLoggedIn } from "../../utils/auth";

export function createAccountsSlice(setScoped, getScoped, rootSet, rootGet) {
  return {

    async createAccount(params) {
      return fetch('/api/v1/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params || {}),
      })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to create account (${res.status})`);
        return res.json();
      })
      .catch((err) => {
        console.error('accountsSlice.createAccount failed', err);
        return null;
      }); 
    },

    async fetchRelationships(accountIds) {
      if (!Array.isArray(accountIds) || accountIds.length === 0) return {};

      const results = [];

      const chunkArray = (arr, size) => {
        const out = [];
        for (let i = 0; i < arr.length; i += size) {
          out.push(arr.slice(i, i + size));
        }
        return out;
      };

      try {
        for (const ids of chunkArray(accountIds, 20)) {
          const params = new URLSearchParams();
          ids.forEach((id) => params.append('id', id));
          const response = await fetch(`/api/v1/accounts/relationships?${params.toString()}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch relationships (${response.status})`);
          }
          const json = await response.json();
          const data = relationshipSchema.array().parse(json || []);
          results.push(...data);
        }

        // Store relationships via relationships slice action
        const root = rootGet();
        if (root?.relationships && typeof root.relationships.fetchRelationshipsSuccess === 'function') {
          root.relationships.fetchRelationshipsSuccess(results);
        }

        return results;
      } catch (err) {
        console.error('accountsSlice.fetchRelationships failed', err);
        return {};
      }
    },

    // Fetch an account from the API and store it under `state.accounts[id]`.
    async fetchAccount(id) {
      if (!id) return null;
      this.fetchRelationships([id]); // prefetch relationship
      const account = selectAccount(rootGet(), id);
      if (account) {
        return Promise.resolve(account);
      }
      const root = rootGet();

      try {
        const res = await fetch(`/api/v1/accounts/${id}`);
        if (!res.ok) throw new Error(`Failed to fetch account (${res.status})`);
        const data = await res.json();
        root.importer.importFetchedAccount(data);
        // Populate lightweight per-account metadata for other flows
        root.accountsMeta?.mergeAccountMetaFromAccount?.(data);
        return data;
      } catch (err) {
        console.error('accountsSlice.fetchAccount failed', err);
        return null;
      }
    },

    async accountSearch(params, signal) {
      const res = await fetch(`/api/v1/accounts/search?${new URLSearchParams(params || {})}`, {
        method: 'GET',
        signal,
      });
      
      if (!res.ok) throw new Error(`Failed to search accounts (${res.status})`); 
      const accounts = await res.json();
      const root = rootGet();
      root.importer?.importFetchedAccounts?.(accounts);
      // Merge metadata for each imported account so other slices can rely on it
      if (Array.isArray(accounts)) {
        accounts.forEach((a) => root.accountsMeta?.mergeAccountMetaFromAccount?.(a));
      }
      return accounts;
    },

    async fetchAccountByUsername(username, history) {
      if (!username) return null;
      const root = rootGet();
      const me = root.auth?.me;
      const features = getFeatures();

      // Prefer direct account-by-username endpoint when available
      if (features.accountByUsername && (me || !features.accountLookup)) {
        try {
          const res = await fetch(`/api/v1/accounts/${username}`);
          if (!res.ok) throw new Error(`Failed to fetch account by username (${res.status})`);
          const data = await res.json();
          await this.fetchRelationships([data.id]); // prefetch relationships
          root.importer?.importFetchedAccount?.(data);
          root.accountsMeta?.mergeAccountMetaFromAccount?.(data);
          return data;
        } catch (err) {
          console.error('accountsSlice.fetchAccountByUsername failed', err);
          if (history && err?.response?.status === 401) {
            history.push('/login');
          }
          return null;
        }
      }

      // Fallback: search for the account and return the best match
      try {
        const accounts = await this.accountSearch({ q: username, limit: 5, resolve: true });
        const found = Array.isArray(accounts)
          ? accounts.find((a) => a.acct === username || a.username === username)
          : null;
        if (found) {
          await this.fetchRelationships([found.id]); // prefetch relationships
          root.accountsMeta?.mergeAccountMetaFromAccount?.(found);
          return found;
        }
        return null;
      } catch (err) {
        console.error('accountsSlice.fetchAccountByUsername (search) failed', err);
        return null;
      }
    },

    async blockAccount(id) {
      if (!isLoggedIn(rootGet())) return null;
      const root = rootGet();

      try {
        const res = await fetch(`/api/v1/accounts/${id}/block`, {
          method: 'POST',
        });
        if (!res.ok) throw new Error(`Failed to block account (${res.status})`);
        const data = await res.json();

        // Import updated relationship/account info if importer/entities exist
        root.entities?.importEntities?.([data], 'relationships');

        // Notify other slices if they expose the expected handlers
        root.contexts?.blockOrMuteAccountSuccess?.(data, root.statuses);
        root.notifications?.blockAccountSuccess?.(data);
        root.relationships?.blockOrUnBlockAccountSuccess?.(data);
        root.suggestions?.blockOrMuteAccountSuccess?.(data);
        root.timelines?.blockOrMuteAccountSuccess?.(data, root.statuses);

        return data;
      } catch (err) {
        console.error('accountsSlice.blockAccount failed', err);
        return null;
      }
    },

    async unblockAccount(id) {
      if (!isLoggedIn(rootGet())) return null;
      const root = rootGet();

      try {
        const res = await fetch(`/api/v1/accounts/${id}/unblock`, {
          method: 'POST',
        });
        if (!res.ok) throw new Error(`Failed to unblock account (${res.status})`);
        const data = await res.json();

        // Import updated relationship/account info if importer/entities exist
        root.entities?.importEntities?.([data], 'relationships');

        // Notify other slices if they expose the expected handlers
        root.contexts?.unblockOrUnmuteAccountSuccess?.(data, root.statuses);
        root.notifications?.unblockAccountSuccess?.(data);
        root.relationships?.blockOrUnBlockAccountSuccess?.(data);
        root.suggestions?.unblockOrUnmuteAccountSuccess?.(data);
        root.timelines?.unblockOrUnmuteAccountSuccess?.(data, root.statuses);

        return data;  
      } catch (err) {
        console.error('accountsSlice.unblockAccount failed', err);
        return null;
      }
    },

    muteAccount(id, notifications, duration = 0) {
      if (!isLoggedIn(rootGet())) return null;
      const root = rootGet();

      const params = {
        notifications,
      };

      if (duration) {
       // params.duration = duration;
        params.expires_in = duration; //TODO decide one later
      }

      return fetch(`/api/v1/accounts/${id}/mute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          params
        }),
      })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to mute account (${res.status})`);
        return res.json();
      })
      .then((data) => {
        // Import updated relationship/account info if importer/entities exist
        root.entities?.importEntities?.([data], 'relationships');

        // Notify other slices if they expose the expected handlers
        root.contexts?.blockOrMuteAccountSuccess?.(data, root.statuses);
        root.notifications?.muteAccountSuccess?.(data);
        root.relationships?.muteOrUnmuteAccountSuccess?.(data);
        root.suggestions?.blockOrMuteAccountSuccess?.(data);
        root.timelines?.blockOrMuteAccountSuccess?.(data, root.statuses);

        return data;
      })
      .catch((err) => {
        console.error('accountsSlice.muteAccount failed', err);
        return null;
      });
    },

    unmuteAccount(id) {
      if (!isLoggedIn(rootGet())) return null;
      const root = rootGet();

      return fetch(`/api/v1/accounts/${id}/unmute`, {
        method: 'POST',
      })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to unmute account (${res.status})`);       
        return res.json();
      })
      .then((data) => {
        // Import updated relationship/account info if importer/entities exist
        root.entities?.importEntities?.([data], 'relationships');

        // Notify other slices if they expose the expected handlers
        root.contexts?.unblockOrUnmuteAccountSuccess?.(data, root.statuses);
        root.notifications?.unmuteAccountSuccess?.(data);
        root.relationships?.muteOrUnmuteAccountSuccess?.(data);
        root.suggestions?.unblockOrUnmuteAccountSuccess?.(data);
        root.timelines?.unblockOrUnmuteAccountSuccess?.(data, root.statuses);

        return data;
      })
      .catch((err) => {
        console.error('accountsSlice.unmuteAccount failed', err);
        return null;
      });
    },

    subscribeAccount(id, notifications) {
      if (!isLoggedIn(rootGet())) return null;
      const root = rootGet();

      return fetch(`/api/v1/accounts/${id}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notifications
        }),
      })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to subscribe account (${res.status})`);
        return res.json();
      })
      .then((data) => {
        // Import updated relationship/account info if importer/entities exist
        root.entities?.importEntities?.([data], 'relationships');

        // Notify other slices if they expose the expected handlers
        root.relationships?.subscribeOrUnsubscribeAccountSuccess?.(data);   
        return data;
      })
      .catch((err) => {
        console.error('accountsSlice.subscribeAccount failed', err);
        return null;
      });
    },

    unsubscribeAccount(id) {
      if (!isLoggedIn(rootGet())) return null;
      const root = rootGet();

      return fetch(`/api/v1/accounts/${id}/unsubscribe`, {
        method: 'POST',
      })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to unsubscribe account (${res.status})`);
        return res.json();
      })
      .then((data) => {
        // Import updated relationship/account info if importer/entities exist
        root.entities?.importEntities?.([data], 'relationships');

        // Notify other slices if they expose the expected handlers
        root.relationships?.subscribeOrUnsubscribeAccountSuccess?.(data);   
        return data;
      })
      .catch((err) => {
        console.error('accountsSlice.unsubscribeAccount failed', err);
        return null;
      });
    },

    removeFromFollowers(id) {
      if (!isLoggedIn(rootGet())) return null;
      const root = rootGet();

      return fetch(`/api/v1/accounts/${id}/remove_from_followers`, {
        method: 'POST',
      })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to remove from followers (${res.status})`);
        return res.json();
      })
      .then((data) => {
        // Import updated relationship/account info if importer/entities exist
        root.entities?.importEntities?.([data], 'relationships');     
        // Notify other slices if they expose the expected handlers 
        root.relationships?.removeAccountFromFollowersSuccess?.(data);   
        return data;
      } )
      .catch((err) => {
        console.error('accountsSlice.removeFromFollowers failed', err);
        return null;
      });
    },

    async fetchFollowers(id) {
      if (!id) return [];
      const root = rootGet();
      try {
        const res = await fetch(`/api/v1/accounts/${id}/followers`, { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to fetch followers (${res.status})`);
        const data = await res.json();

        // parse next from Link header
        const link = res.headers.get('link') || res.headers.get('Link');
        let next = null;
        if (link) {
          const m = link.match(/<([^>]+)>\s*;\s*rel="?next"?/i);
          if (m) next = m[1];
        }
        if (!next && data && typeof data.next === 'string') next = data.next;

        root.importer?.importFetchedAccounts?.(data);
        if (Array.isArray(data)) {
          data.forEach((a) => root.accountsMeta?.mergeAccountMetaFromAccount?.(a));
        }
        root.userLists?.fetchFollowersSuccess?.(id, data, next);
        await this.fetchRelationships(data.map((acc) => acc.id)); // prefetch relationships
        return data;
      } catch (err) {
        console.error('accountsSlice.fetchFollowers failed', err);
        return [];
      }
    },

    async expandFollowers(id) {
      if (!id) return [];
      if (!isLoggedIn(rootGet())) return null;
      const root = rootGet();
      const url = root.userLists?.followers?.[id]?.next;

      if (!url) {
        return null;
      }

      try {
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to expand followers (${res.status})`);
        const data = await res.json();

        // Try to parse a `next` pagination URL from Link header (RFC 5988)
        const link = res.headers.get('link') || res.headers.get('Link');
        let next = null;
        if (link) {
          const m = link.match(/<([^>]+)>\s*;\s*rel="?next"?/i);
          if (m) next = m[1];
        }

        // Some APIs embed pagination in the response body
        if (!next && data && typeof data.next === 'string') next = data.next;

        root.importer?.importFetchedAccounts?.(data);
        if (Array.isArray(data)) {
          data.forEach((a) => root.accountsMeta?.mergeAccountMetaFromAccount?.(a));
        }
        root.userLists?.expandFollowersSuccess?.(id, data, next);
        this.fetchRelationships(data.map((acc) => acc.id)); // prefetch relationships
        return data;
      } catch (err) {
        console.error('accountsSlice.expandFollowers failed', err);
        return [];
      } 
    },

    async fetchFollowing(id) {
      if (!id) return [];
      const root = rootGet();
      try {
        const res = await fetch(`/api/v1/accounts/${id}/following`, { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to fetch following (${res.status})`);
        const data = await res.json();

        const link = res.headers.get('link') || res.headers.get('Link');
        let next = null;
        if (link) {
          const m = link.match(/<([^>]+)>\s*;\s*rel="?next"?/i);
          if (m) next = m[1];
        }
        if (!next && data && typeof data.next === 'string') next = data.next;

        root.importer?.importFetchedAccounts?.(data);
        if (Array.isArray(data)) {
          data.forEach((a) => root.accountsMeta?.mergeAccountMetaFromAccount?.(a));
        }
        root.userLists?.fetchFollowingSuccess?.(id, data, next);
        await this.fetchRelationships(data.map((acc) => acc.id)); // prefetch relationships
        return data;
      } catch (err) {
        console.error('accountsSlice.fetchFollowing failed', err);
        return [];
      }
    },

    async expandFollowing(id) {
      if (!id) return [];
      if (!isLoggedIn(rootGet())) return null;
      const root = rootGet();
      const url = root.userLists?.following?.[id]?.next;

      if (!url) return null;

      try {
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to expand following (${res.status})`);
        const data = await res.json();

        const link = res.headers.get('link') || res.headers.get('Link');
        let next = null;
        if (link) {
          const m = link.match(/<([^>]+)>\s*;\s*rel="?next"?/i);
          if (m) next = m[1];
        }
        if (!next && data && typeof data.next === 'string') next = data.next;

        root.importer?.importFetchedAccounts?.(data);
        if (Array.isArray(data)) {
          data.forEach((a) => root.accountsMeta?.mergeAccountMetaFromAccount?.(a));
        }
        root.userLists?.expandFollowingSuccess?.(id, data, next);
        await this.fetchRelationships(data.map((acc) => acc.id));
        return data;
      } catch (err) {
        console.error('accountsSlice.expandFollowing failed', err);
        return [];
      }
    },

    async fetchFollowRequests() {
      if (!isLoggedIn(rootGet())) return [];
      const root = rootGet();
      try {
        const res = await fetch('/api/v1/follow_requests', { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to fetch follow requests (${res.status})`);
        const data = await res.json();
        root.importer?.importFetchedAccounts?.(data);
        if (Array.isArray(data)) {
          data.forEach((a) => root.accountsMeta?.mergeAccountMetaFromAccount?.(a));
        }
        root.followRequests?.fetchFollowRequestsSuccess?.(data);
        return data;
      } catch (err) {
        console.error('accountsSlice.fetchFollowRequests failed', err);
        return [];
      }
    },

    async expandFollowRequests() {
      if (!isLoggedIn(rootGet())) return [];
      const root = rootGet();
      const url = root.userLists?.follow_requests?.next;
      if (!url) return null;
      try {
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to expand follow requests (${res.status})`);
        const data = await res.json();

        const link = res.headers.get('link') || res.headers.get('Link');
        let next = null;
        if (link) {
          const m = link.match(/<([^>]+)>\s*;\s*rel="?next"?/i);
          if (m) next = m[1];
        }
        if (!next && data && typeof data.next === 'string') next = data.next;

        root.importer?.importFetchedAccounts?.(data);
        if (Array.isArray(data)) {
          data.forEach((a) => root.accountsMeta?.mergeAccountMetaFromAccount?.(a));
        }
        root.followRequests?.expandFollowRequestsSuccess?.(data, next);
        return data;
      } catch (err) {
        console.error('accountsSlice.expandFollowRequests failed', err);
        return [];
      }
    },

    async authorizeFollowRequest(id) {
      if (!isLoggedIn(rootGet())) return null;
      const root = rootGet();
      try {
        const res = await fetch(`/api/v1/follow_requests/${id}/authorize`, { method: 'POST' });
        if (!res.ok) throw new Error(`Failed to authorize follow request (${res.status})`);
        const data = await res.json();
        root.followRequests?.authorizeFollowRequestSuccess?.(data);
        return data;
      } catch (err) {
        console.error('accountsSlice.authorizeFollowRequest failed', err);
        return null;
      }
    },

    async rejectFollowRequest(id) {
      if (!isLoggedIn(rootGet())) return null;
      const root = rootGet();
      try {
        const res = await fetch(`/api/v1/follow_requests/${id}/reject`, { method: 'POST' });
        if (!res.ok) throw new Error(`Failed to reject follow request (${res.status})`);
        const data = await res.json();
        root.followRequests?.rejectFollowRequestSuccess?.(data);
        return data;
      } catch (err) {
        console.error('accountsSlice.rejectFollowRequest failed', err);
        return null;
      }
    },

    async pinAccount(id) {
      if (!isLoggedIn(rootGet())) return null;
      const root = rootGet();
      try {
        const res = await fetch(`/api/v1/accounts/${id}/pin`, { method: 'POST' });
        if (!res.ok) throw new Error(`Failed to pin account (${res.status})`);
        const data = await res.json();
        root.userLists?.pinAccountSuccess?.(data);
        return data;
      } catch (err) {
        console.error('accountsSlice.pinAccount failed', err);
        return null;
      }
    },

    async unpinAccount(id) {
      if (!isLoggedIn(rootGet())) return null;
      const root = rootGet();
      try {
        const res = await fetch(`/api/v1/accounts/${id}/unpin`, { method: 'POST' });
        if (!res.ok) throw new Error(`Failed to unpin account (${res.status})`);
        const data = await res.json();
        root.userLists?.unpinAccountSuccess?.(data);
        return data;
      } catch (err) {
        console.error('accountsSlice.unpinAccount failed', err);
        return null;
      }
    },
    
    async updateNotificationSettings(params) {
      try {
        const res = await fetch('/api/v1/notification_settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params || {}),
        });
        if (!res.ok) throw new Error(`Failed to update notification settings (${res.status})`);
        const data = await res.json();
        return data;
      } catch (err) {
        console.error('accountsSlice.updateNotificationSettings failed', err);
        return null;
      }
    },

    async fecthPinnedAccounts(id) {
      if (!id) return [];
      const root = rootGet();
      try {
        const res = await fetch(`/api/v1/accounts/${id}/endorsements`, { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to fetch pinned accounts (${res.status})`);
        const data = await res.json();
        root.importer?.importFetchedAccounts?.(data);
        if (Array.isArray(data)) {
          data.forEach((a) => root.accountsMeta?.mergeAccountMetaFromAccount?.(a));
        }
        root.userLists?.fecthPinnedAccountsSuccess?.(id, data, null);
        return data;
      } catch (err) {
        console.error('accountsSlice.fecthPinnedAccounts failed', err);
        return [];
      }
    },

    async accountLookup(acct, signal) {
      if (!acct) return null;
      try {
        const res = await fetch(`/api/v1/accounts/lookup?acct=${encodeURIComponent(acct)}`, {
          method: 'GET',
          signal,
        });
        if (!res.ok) throw new Error(`Failed to lookup account (${res.status})`);
        const account = await res.json();
        const root = rootGet();
        if (account && account.id) {
          root.importer?.importFetchedAccount?.(account);
          root.accountsMeta?.mergeAccountMetaFromAccount?.(account);
          return account;
        }
        return null;
      } catch (err) {
        console.error('accountsSlice.accountLookup failed', err);
        return null;
      }
    },

    async fetchBirthdayReminders(month, day) {
      if (!isLoggedIn(rootGet())) return null;
      const root = rootGet();
      const me = root.auth?.me;
      if (month < 1 || month > 12 || day < 1 || day > 31) return [];
      try {
        const res = await fetch(`/api/v1/birthdays?month=${month}&day=${day}`, { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to fetch birthday reminders (${res.status})`);
        const data = await res.json();
        root.importer?.importFetchedAccounts?.(data);
        if (Array.isArray(data)) {
          data.forEach((a) => root.accountsMeta?.mergeAccountMetaFromAccount?.(a));
        }
        root.userLists?.fetchBirthdayRemindersSuccess?.(me, data);
        return data;
      } catch (err) {
        console.error('accountsSlice.fetchBirthdayReminders failed', err);
        return [];
      }
    },
 
  };
}

export default createAccountsSlice;
