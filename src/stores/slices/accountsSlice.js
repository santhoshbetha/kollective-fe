// Action-only slice for account operations. This slice intentionally
// exposes no state — only actions that operate on the root store via
// `rootSet` and `rootGet`.

import { relationshipSchema } from "../../schemas/relationship";
import { selectAccount } from "../selectors/accountsSelector";
import { getFeatures } from "../../utils/features";
import { isLoggedIn } from "../../utils/auth";

export function createAccountsSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();
  return {

    async createAccount(params) {
      try {
        const res = await fetch('/api/v1/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params || {}),
        });

        if (!res.ok) throw new Error(`Failed to create account (${res.status})`);
        
        return await res.json();
      } catch (err) {
        console.error('accountsSlice.createAccount failed', err);
        return null;
      }
    },

    async fetchRelationships(accountIds) {
      if (!Array.isArray(accountIds) || accountIds.length === 0) return [];

      const results = [];
      const CHUNK_SIZE = 20;

      try {
        // Chunking loop using standard JS
        for (let i = 0; i < accountIds.length; i += CHUNK_SIZE) {
          const chunk = accountIds.slice(i, i + CHUNK_SIZE);
          
          const params = new URLSearchParams();
          chunk.forEach((id) => params.append('id', id));

          const response = await fetch(`/api/v1/accounts/relationships?${params.toString()}`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch relationships (${response.status})`);
          }

          const json = await response.json();
          const data = relationshipSchema.array().parse(json || []);
          results.push(...(data || []));
        }

        // --- Cross-Slice Communication ---
        // Since you are spreading actions to the root, call the success action directly
        const actions = getActions();
        if (typeof actions.fetchRelationshipsSuccess === 'function') {
          actions.fetchRelationshipsSuccess(results);
        }

        return results;
      } catch (err) {
        console.error('accountsSlice.fetchRelationships failed', err);
        return []; // Return empty array on failure for consistency
      }
    },

    // Fetch an account from the API and store it under `state.accounts[id]`.
    async fetchAccount(id) {
      if (!id) return null;

      // 1. Prefetch relationships using the uniquely named root action
      await getActions().fetchRelationships([id]);

      // 2. Check if the account already exists in state
      // (Using the selector we discussed earlier)
      const state = rootGet();
      const account = selectAccount(state, id);
      
      if (account) {
        return account; // Async functions wrap return values in a Promise automatically
      }

      try {
        const res = await fetch(`/api/v1/accounts/${id}`);
        if (!res.ok) throw new Error(`Failed to fetch account (${res.status})`);
        
        const data = await res.json();

        // 3. Coordinate with other slices via root actions
        const actions = getActions();
        
        // Import the account data into the main dictionary
        actions.importFetchedAccount?.(data);
        
        // Populate lightweight per-account metadata if the action exists
        actions.mergeAccountMetaFromAccount?.(data);

        return data;
      } catch (err) {
        console.error('accountsSlice.fetchAccount failed', err);
        return null;
      }
    },

    async accountSearch(params, signal) {
      try {
        const query = new URLSearchParams(params || {}).toString();
        const res = await fetch(`/api/v1/accounts/search?${query}`, {
          method: 'GET',
          signal,
        });

        if (!res.ok) throw new Error(`Failed to search accounts (${res.status})`);
        
        const accounts = await res.json();
        const actions = getActions();

        // 1. Import accounts into the main statuses/accounts dictionary
        actions.importFetchedAccounts?.(accounts);

        // 2. Map through and merge metadata if the array is valid
        if (Array.isArray(accounts)) {
          accounts.forEach((account) => {
            actions.mergeAccountMetaFromAccount?.(account);
          });
        }

        return accounts;
      } catch (err) {
        // Handle AbortError specifically if using AbortController (signal)
        if (err.name === 'AbortError') {
          console.log('Account search aborted');
        } else {
          console.error('accountsSlice.accountSearch failed', err);
          throw err; // Re-throw so the UI can handle the error state
        }
      }
    },

    async fetchAccountByUsername(username, history) {
      if (!username) return null;

      const actions = getActions();
      const state = rootGet();
      const me = state.auth?.me;
      const features = getFeatures(); // Assuming this is a global or imported util

      // 1. Prefer direct account-by-username endpoint
      if (features.accountByUsername && (me || !features.accountLookup)) {
        try {
          const res = await fetch(`/api/v1/accounts/${username}`);

          if (!res.ok) {
            // Handle specific 401 Unauthorized for history redirect
            if (res.status === 401 && history) {
              history.push('/login');
            }
            throw new Error(`Failed to fetch account by username (${res.status})`);
          }

          const data = await res.json();

          // Prefetch relationships and import data
          await actions.fetchRelationships([data.id]);
          actions.importFetchedAccount?.(data);
          actions.mergeAccountMetaFromAccount?.(data);

          return data;
        } catch (err) {
          console.error('accountsSlice.fetchAccountByUsername failed', err);
          return null;
        }
      }

      // 2. Fallback: Search for the account
      try {
        // Use the root action instead of 'this'
        const accounts = await actions.accountSearch({ q: username, limit: 5, resolve: true });
        
        const found = Array.isArray(accounts)
          ? accounts.find((a) => a.acct === username || a.username === username)
          : null;

        if (found) {
          await actions.fetchRelationships([found.id]);
          // Import into core dictionary if search didn't already
          actions.importFetchedAccount?.(found); 
          actions.mergeAccountMetaFromAccount?.(found);
          return found;
        }

        return null;
      } catch (err) {
        console.error('accountsSlice.fetchAccountByUsername (search) failed', err);
        return null;
      }
    },

    async blockAccount(id) {
      const state = rootGet();
      const actions = getActions();

      // 1. Check Auth using your helper
      if (!isLoggedIn(state)) return null;

      try {
        const res = await fetch(`/api/v1/accounts/${id}/block`, {
          method: 'POST',
        });

        if (!res.ok) throw new Error(`Failed to block account (${res.status})`);
        
        const data = await res.json(); // The relationship object

        // 2. Import updated relationship data
        actions.importEntities?.([data], 'relationships');

        // 3. Notify other slices using the uniquely named root actions
        // We pass rootGet().statuses directly where needed
        const currentStatuses = rootGet().statuses;

        actions.blockOrMuteAccountSuccess?.(data, currentStatuses);
        actions.blockAccountSuccess?.(data);
        actions.blockOrUnBlockAccountSuccess?.(data);
        // Note: suggestions and timelines shared the same success handler name in your old code
        // Ensure these are unique or called correctly via the spread root
        actions.suggestionBlockOrMuteSuccess?.(data); 

        return data;
      } catch (err) {
        console.error('accountsSlice.blockAccount failed', err);
        return null;
      }
    },

    async unblockAccount(id) {
      const state = rootGet();
      const actions = getActions();

      // 1. Auth Guard
      if (!isLoggedIn(state)) return null;

      try {
        const res = await fetch(`/api/v1/accounts/${id}/unblock`, {
          method: 'POST',
        });

        if (!res.ok) throw new Error(`Failed to unblock account (${res.status})`);
        
        const data = await res.json(); // The updated relationship object

        // 2. Update relationship data in entities slice
        actions.importEntities?.([data], 'relationships');

        // 3. Notify relevant slices using uniquely named actions
        const currentStatuses = rootGet().statuses;

        // Contexts/Timeline unblocking logic
        actions.unblockOrUnmuteAccountSuccess?.(data, currentStatuses);
        
        // Notifications unblock logic
        actions.unblockAccountSuccess?.(data);
        
        // Relationships toggle logic (this one shared a name for block/unblock)
        actions.blockOrUnBlockAccountSuccess?.(data);
        
        // Suggestions/Timelines specific unblock success
        actions.suggestionUnblockSuccess?.(data);
        actions.timelineUnblockSuccess?.(data);

        return data;
      } catch (err) {
        console.error('accountsSlice.unblockAccount failed', err);
        return null;
      }
    },

    async muteAccount(id, notifications, duration = 0) {
      const state = rootGet();
      const actions = getActions();

      // 1. Auth Guard
      if (!isLoggedIn(state)) return null;

      // 2. Prepare request body
      const bodyData = { notifications };
      if (duration) {
        bodyData.duration = duration;
        bodyData.expires_in = duration; 
      }

      try {
        const res = await fetch(`/api/v1/accounts/${id}/mute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData), // Passed directly, not nested
        });

        if (!res.ok) throw new Error(`Failed to mute account (${res.status})`);
        
        const data = await res.json(); // The updated relationship object

        // 3. Update state via root-level actions
        actions.importEntities?.([data], 'relationships');

        // 4. Trigger success handlers across slices
        const currentStatuses = rootGet().statuses;

        // Note: Using the unique names we discussed to avoid spread collisions
        actions.timelineBlockOrMuteSuccess?.(data, currentStatuses);
        actions.notificationMuteSuccess?.(data);
        actions.relationshipMuteOrUnmuteSuccess?.(data);
        actions.suggestionBlockOrMuteSuccess?.(data);

        return data;
      } catch (err) {
        console.error('accountsSlice.muteAccount failed', err);
        return null;
      }
    },

    async unmuteAccount(id) {
      const state = rootGet();
      const actions = getActions();

      // 1. Auth Guard
      if (!isLoggedIn(state)) return null;

      try {
        const res = await fetch(`/api/v1/accounts/${id}/unmute`, {
          method: 'POST',
        });

        if (!res.ok) throw new Error(`Failed to unmute account (${res.status})`);
        
        const data = await res.json(); // The updated relationship object

        // 2. Update state via root-level actions
        actions.importEntities?.([data], 'relationships');

        // 3. Trigger success handlers across slices
        const currentStatuses = rootGet().statuses;

        // Contexts/Timeline unmuting logic
        // Use unique names to avoid spread collisions in useBoundStore
        actions.unblockOrUnmuteAccountSuccess?.(data, currentStatuses);
        actions.notificationUnmuteSuccess?.(data);
        actions.relationshipMuteOrUnmuteSuccess?.(data);
        
        // Suggestions/Timelines specific unblock/unmute success
        actions.suggestionUnmuteSuccess?.(data);
        actions.timelineUnmuteSuccess?.(data, currentStatuses);

        return data;
      } catch (err) {
        console.error('accountsSlice.unmuteAccount failed', err);
        return null;
      }
    },

    async subscribeAccount(id, notifications) {
      const state = rootGet();
      const actions = getActions();

      // 1. Auth Guard using current state
      if (!isLoggedIn(state)) return null;

      try {
        const res = await fetch(`/api/v1/accounts/${id}/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notifications }),
        });

        if (!res.ok) throw new Error(`Failed to subscribe account (${res.status})`);
        
        const data = await res.json(); // Updated relationship object

        // 2. Import updated relationship via root action
        actions.importEntities?.([data], 'relationships');

        // 3. Notify the relationships slice of success
        actions.subscribeOrUnsubscribeAccountSuccess?.(data);

        return data;
      } catch (err) {
        console.error('accountsSlice.subscribeAccount failed', err);
        return null;
      }
    },

    async unsubscribeAccount(id) {
      const state = rootGet();
      const actions = getActions();

      // 1. Auth Guard
      if (!isLoggedIn(state)) return null;

      try {
        const res = await fetch(`/api/v1/accounts/${id}/unsubscribe`, {
          method: 'POST',
        });

        if (!res.ok) throw new Error(`Failed to unsubscribe account (${res.status})`);
        
        const data = await res.json();

        // 2. Update state via root-level actions
        actions.importEntities?.([data], 'relationships');

        // 3. Trigger success handler
        actions.subscribeOrUnsubscribeAccountSuccess?.(data);

        return data;
      } catch (err) {
        console.error('accountsSlice.unsubscribeAccount failed', err);
        return null;
      }
    },

    async removeFromFollowers(id) {
      const state = rootGet();
      const actions = getActions();

      // 1. Auth Guard
      if (!isLoggedIn(state)) return null;

      try {
        const res = await fetch(`/api/v1/accounts/${id}/remove_from_followers`, {
          method: 'POST',
        });

        if (!res.ok) {
          throw new Error(`Failed to remove from followers (${res.status})`);
        }
        
        const data = await res.json(); // The updated relationship object

        // 2. Import updated relationship via root-level entities action
        actions.importEntities?.([data], 'relationships');

        // 3. Notify the relationships slice of success
        actions.removeAccountFromFollowersSuccess?.(data);

        return data;
      } catch (err) {
        console.error('accountsSlice.removeFromFollowers failed', err);
        return null;
      }
    },

    async fetchFollowers(id) {
      if (!id) return [];

      const actions = getActions();

      try {
        const res = await fetch(`/api/v1/accounts/${id}/followers`, { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to fetch followers (${res.status})`);
        
        const data = await res.json();

        // 1. Improved Link Header parsing
        const link = res.headers.get('Link');
        let next = null;
        if (link) {
          const match = link.match(/<([^>]+)>;\s*rel="next"/i);
          next = match ? match[1] : null;
        }
        // Fallback to data.next if provided by JSON
        if (!next && data?.next) next = data.next;

        // 2. Import accounts into the global dictionary
        actions.importFetchedAccounts?.(data);

        // 3. Merge metadata for each account
        if (Array.isArray(data)) {
          data.forEach((acc) => actions.mergeAccountMetaFromAccount?.(acc));
        }

        // 4. Notify userLists slice of success
        // Note: Renamed to be specific to avoid spread collisions
        actions.userListFetchFollowersSuccess?.(id, data, next);

        // 5. Prefetch relationships for the newly fetched followers
        if (Array.isArray(data) && data.length > 0) {
          await actions.fetchRelationships(data.map((acc) => acc.id));
        }

        return data;
      } catch (err) {
        console.error('accountsSlice.fetchFollowers failed', err);
        return [];
      }
    },

    async expandFollowers(id) {
      if (!id) return [];
      
      const state = rootGet();
      const actions = getActions();

      // 1. Auth Guard
      if (!isLoggedIn(state)) return null;

      // 2. Retrieve the next URL from the userLists slice state
      const url = state.userLists?.followers?.[id]?.next;

      if (!url) {
        return null;
      }

      try {
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to expand followers (${res.status})`);
        
        const data = await res.json();

        // 3. Modern Link Header parsing
        const link = res.headers.get('Link');
        let next = null;
        if (link) {
          const match = link.match(/<([^>]+)>;\s*rel="next"/i);
          next = match ? match[1] : null;
        }

        // Fallback to data.next if provided in the body
        if (!next && data?.next) {
          next = data.next;
        }

        // 4. Import accounts and merge metadata via root actions
        actions.importFetchedAccounts?.(data);
        
        if (Array.isArray(data)) {
          data.forEach((account) => {
            actions.mergeAccountMetaFromAccount?.(account);
          });
        }

        // 5. Notify userLists slice to append the new data
        // Renamed to follow your unique-naming pattern for root-level actions
        actions.userListExpandFollowersSuccess?.(id, data, next);

        // 6. Prefetch relationships for the newly fetched followers
        if (Array.isArray(data) && data.length > 0) {
          await actions.fetchRelationships(data.map((acc) => acc.id));
        }

        return data;
      } catch (err) {
        console.error('accountsSlice.expandFollowers failed', err);
        return [];
      } 
    },

    async fetchFollowing(id) {
      if (!id) return [];

      const actions = getActions();

      try {
        const res = await fetch(`/api/v1/accounts/${id}/following`, { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to fetch following (${res.status})`);
        
        const data = await res.json();

        // 1. Standardized Link Header parsing
        const link = res.headers.get('Link');
        let next = null;
        if (link) {
          const match = link.match(/<([^>]+)>;\s*rel="next"/i);
          next = match ? match[1] : null;
        }
        
        // Fallback to data.next if provided in the response body
        if (!next && data?.next) next = data.next;

        // 2. Import accounts into the global dictionary via root actions
        actions.importFetchedAccounts?.(data);

        // 3. Merge account metadata
        if (Array.isArray(data)) {
          data.forEach((acc) => actions.mergeAccountMetaFromAccount?.(acc));
        }

        // 4. Notify userLists slice of success
        // Renamed to be specific to avoid spread collisions in useBoundStore
        actions.userListFetchFollowingSuccess?.(id, data, next);

        // 5. Prefetch relationships for the fetched accounts
        if (Array.isArray(data) && data.length > 0) {
          await actions.fetchRelationships(data.map((acc) => acc.id));
        }

        return data;
      } catch (err) {
        console.error('accountsSlice.fetchFollowing failed', err);
        return [];
      }
    },

    async expandFollowing(id) {
      if (!id) return [];
      
      const state = rootGet();
      const actions = getActions();

      // 1. Auth Guard
      if (!isLoggedIn(state)) return null;

      // 2. Access the next URL from the userLists slice state
      const url = state.userLists?.following?.[id]?.next;

      if (!url) {
        return null;
      }

      try {
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to expand following (${res.status})`);
        
        const data = await res.json();

        // 3. Link Header parsing (RFC 8288)
        const link = res.headers.get('Link');
        let next = null;
        if (link) {
          const match = link.match(/<([^>]+)>;\s*rel="next"/i);
          next = match ? match[1] : null;
        }

        // Fallback to data.next from JSON body
        if (!next && typeof data?.next === 'string') {
          next = data.next;
        }

        // 4. Import accounts and metadata via root actions
        actions.importFetchedAccounts?.(data);
        
        if (Array.isArray(data)) {
          data.forEach((account) => {
            actions.mergeAccountMetaFromAccount?.(account);
          });
        }

        // 5. Update userLists slice (renamed to avoid collisions)
        actions.userListExpandFollowingSuccess?.(id, data, next);

        // 6. Prefetch relationships using the root action
        if (Array.isArray(data) && data.length > 0) {
          await actions.fetchRelationships(data.map((acc) => acc.id));
        }

        return data;
      } catch (err) {
        console.error('accountsSlice.expandFollowing failed', err);
        return [];
      }
    },

    async fetchFollowRequests() {
      const state = rootGet();
      const actions = getActions();

      // 1. Auth Guard
      if (!isLoggedIn(state)) return [];

      try {
        const res = await fetch('/api/v1/follow_requests', { method: 'GET' });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch follow requests (${res.status})`);
        }
        
        const data = await res.json();

        // 2. Import accounts via the global importer action
        actions.importFetchedAccounts?.(data);

        // 3. Merge metadata for each account
        if (Array.isArray(data)) {
          data.forEach((account) => {
            actions.mergeAccountMetaFromAccount?.(account);
          });
        }

        // 4. Notify the followRequests slice of success
        // Renamed to be specific to avoid spread collisions in useBoundStore
        actions.followRequestsFetchSuccess?.(data);

        return data;
      } catch (err) {
        console.error('accountsSlice.fetchFollowRequests failed', err);
        return [];
      }
    },

    async expandFollowRequests() {
      const state = rootGet();
      const actions = getActions();

      // 1. Auth Guard
      if (!isLoggedIn(state)) return [];

      // 2. Retrieve pagination URL from state
      const url = state.userLists?.follow_requests?.next;
      if (!url) return null;

      try {
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to expand follow requests (${res.status})`);
        
        const data = await res.json();

        // 3. Link Header parsing
        const link = res.headers.get('Link');
        let next = null;
        if (link) {
          const match = link.match(/<([^>]+)>;\s*rel="next"/i);
          next = match ? match : null;
        }

        // Fallback for body-embedded pagination
        if (!next && typeof data?.next === 'string') {
          next = data.next;
        }

        // 4. Import accounts and metadata via root actions
        actions.importFetchedAccounts?.(data);

        if (Array.isArray(data)) {
          data.forEach((account) => {
            actions.mergeAccountMetaFromAccount?.(account);
          });
        }

        // 5. Notify followRequests slice of expansion success
        // Renamed to follow your unique-naming pattern for root-level actions
        actions.followRequestsExpandSuccess?.(data, next);

        return data;
      } catch (err) {
        console.error('accountsSlice.expandFollowRequests failed', err);
        return [];
      }
    },

    async authorizeFollowRequest(id) {
      const state = rootGet();
      const actions = getActions();

      // 1. Auth Guard
      if (!isLoggedIn(state)) return null;

      try {
        const res = await fetch(`/api/v1/follow_requests/${id}/authorize`, { 
          method: 'POST' 
        });

        if (!res.ok) {
          throw new Error(`Failed to authorize follow request (${res.status})`);
        }

        const data = await res.json(); // The updated relationship object

        // 2. Notify the followRequests slice of success
        // Renamed to be specific to avoid spread collisions in useBoundStore
        actions.followRequestAuthorizeSuccess?.(data);

        return data;
      } catch (err) {
        console.error('accountsSlice.authorizeFollowRequest failed', err);
        return null;
      }
    },

    async rejectFollowRequest(id) {
      const state = rootGet();
      const actions = getActions();

      // 1. Auth Guard
      if (!isLoggedIn(state)) return null;

      try {
        const res = await fetch(`/api/v1/follow_requests/${id}/reject`, { 
          method: 'POST' 
        });

        if (!res.ok) {
          throw new Error(`Failed to reject follow request (${res.status})`);
        }

        const data = await res.json(); // The updated relationship object

        // 2. Notify the followRequests slice of success
        // Flattened call via the root store
        actions.followRequestRejectSuccess?.(data);

        return data;
      } catch (err) {
        console.error('accountsSlice.rejectFollowRequest failed', err);
        return null;
      }
    },

    async pinAccount(id) {
      const state = rootGet();
      const actions = getActions();

      // 1. Auth Guard using current state
      if (!isLoggedIn(state)) return null;

      try {
        const res = await fetch(`/api/v1/accounts/${id}/pin`, { 
          method: 'POST' 
        });

        if (!res.ok) {
          throw new Error(`Failed to pin account (${res.status})`);
        }

        const data = await res.json(); // The updated relationship or account object

        // 2. Notify the userLists slice of success
        // Renamed to be specific to avoid spread collisions in useBoundStore
        actions.userListPinAccountSuccess?.(data);

        return data;
      } catch (err) {
        console.error('accountsSlice.pinAccount failed', err);
        return null;
      }
    },

    async unpinAccount(id) {
      const state = rootGet();
      const actions = getActions();

      // 1. Auth Guard
      if (!isLoggedIn(state)) return null;

      try {
        const res = await fetch(`/api/v1/accounts/${id}/unpin`, { 
          method: 'POST' 
        });

        if (!res.ok) {
          throw new Error(`Failed to unpin account (${res.status})`);
        }

        const data = await res.json(); // Usually the updated relationship object

        // 2. Notify the userLists slice of success
        // Flattened call via the root store with a unique name
        actions.userListUnpinAccountSuccess?.(data);

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

        if (!res.ok) {
          throw new Error(`Failed to update notification settings (${res.status})`);
        }

        const data = await res.json();
        
        // If you later need to update a 'settings' slice with this data:
        // getActions().updateSettingsSuccess?.(data);

        return data;
      } catch (err) {
        console.error('accountsSlice.updateNotificationSettings failed', err);
        return null;
      }
    },

    async fetchPinnedAccounts(id) {
      if (!id) return [];

      const actions = getActions();

      try {
        const res = await fetch(`/api/v1/accounts/${id}/endorsements`, { 
          method: 'GET' 
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch pinned accounts (${res.status})`);
        }
        
        const data = await res.json();

        // 1. Import accounts into the global dictionary via root actions
        actions.importFetchedAccounts?.(data);

        // 2. Merge account metadata
        if (Array.isArray(data)) {
          data.forEach((account) => {
            actions.mergeAccountMetaFromAccount?.(account);
          });
        }

        // 3. Notify userLists slice of success
        // Renamed to be specific to avoid spread collisions in useBoundStore
        actions.userListFetchPinnedAccountsSuccess?.(id, data, null);

        return data;
      } catch (err) {
        console.error('accountsSlice.fetchPinnedAccounts failed', err);
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

        if (!res.ok) {
          throw new Error(`Failed to lookup account (${res.status})`);
        }

        const account = await res.json();
        const actions = getActions();

        if (account && account.id) {
          // 1. Import the account into the main normalized dictionary
          actions.importFetchedAccount?.(account);

          // 2. Merge metadata for the account
          actions.mergeAccountMetaFromAccount?.(account);

          return account;
        }

        return null;
      } catch (err) {
        // Handle AbortError specifically to avoid logging cancellations as errors
        if (err.name === 'AbortError') {
          console.log('Account lookup aborted');
        } else {
          console.error('accountsSlice.accountLookup failed', err);
        }
        return null;
      }
    },

    async fetchBirthdayReminders(month, day) {
      const state = rootGet();
      const actions = getActions();

      // 1. Auth Guard
      if (!isLoggedIn(state)) return null;
      
      const me = state.auth?.me;

      // 2. Validation
      if (month < 1 || month > 12 || day < 1 || day > 31) return [];

      try {
        const res = await fetch(`/api/v1/birthdays?month=${month}&day=${day}`, { 
          method: 'GET' 
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch birthday reminders (${res.status})`);
        }
        
        const data = await res.json();

        // 3. Import accounts and metadata via root actions
        actions.importFetchedAccounts?.(data);

        if (Array.isArray(data)) {
          data.forEach((account) => {
            actions.mergeAccountMetaFromAccount?.(account);
          });
        }

        // 4. Notify userLists slice of success
        // Renamed to follow your unique-naming pattern
        actions.userListFetchBirthdaysSuccess?.(me, data);

        return data;
      } catch (err) {
        console.error('accountsSlice.fetchBirthdayReminders failed', err);
        return [];
      }
    },
 
  };
}

export default createAccountsSlice;
