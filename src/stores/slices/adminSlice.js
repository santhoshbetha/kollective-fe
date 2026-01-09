import normalizeAdminReport from "../../normalizers/admin-report";
import normalizeAdminAccount from "../../normalizers/admin-account";
import { normalizeId } from "../../utils/normalizers";
import { asPlain } from "../../utils/immutableSafe";
import { accountIdsToAccts } from "../../selectors";

const normalizeConfig = (config) => {
  const src = asPlain(config) || {};
  return Object.freeze({ ...src });
};

const normalizeConfigs = (configs) => {
  const arr = Array.isArray(configs) ? configs : configs ? asPlain(configs) : [];
  return arr.map((c) => normalizeConfig(c));
};

const getIdFrom = (v) => {
  const src = asPlain(v);
  if (src == null) return null;
  if (typeof src === 'string' || typeof src === 'number') return String(src);
  if (typeof src === 'object') {
    if ('id' in src && src.id != null) return String(src.id);
  }
  return null;
};

const minifyReport = (report) => {
  const r = asPlain(report) || {};
  const account = normalizeId(getIdFrom(r.account));
  const target_account = normalizeId(getIdFrom(r.target_account));
  const action_taken_by_account = normalizeId(
    getIdFrom(r.action_taken_by_account),
  );
  const assigned_account = normalizeId(getIdFrom(r.assigned_account));
  const statuses = Array.isArray(r.statuses)
    ? r.statuses.map((s) => normalizeId(getIdFrom(s)))
    : [];

  return {
    account,
    target_account,
    action_taken_by_account,
    assigned_account,
    statuses,
  };
};

const fixReport = (report) => {
  const normalized = normalizeAdminReport(report);
  const mins = minifyReport(normalized);
  return Object.freeze({ ...normalized, ...mins });
};

const minifyUser = (user) => {
  const u = asPlain(user) || {};
  const account = normalizeId(getIdFrom(u.account));
  return { account };
};

const fixUser = (user) => {
  const normalized = normalizeAdminAccount(user);
  const mins = minifyUser(normalized);
  return Object.freeze({ ...normalized, ...mins });
};

const initialState = {
  reports: new Map(),
  openReports: new Set(),
  users: new Map(),
  latestUsers: new Set(),
  awaitingApproval: new Set(),
  configs: [],
  needsReboot: false,
}

export function createAdminSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    ...initialState,

    fetchOrUpdateAdminConfigsSuccess(configs) {
      setScoped((state) => {
        state.configs = normalizeConfigs(configs);
      });
    },

    fetchAdminReportsSuccess(reports) {
      setScoped((state) => {
          // 1. Create mutable drafts of the nested state areas we need to update
        const reportsDraft = { ...state.reports };
        // Create a *new* Set instance to maintain immutability for 'openReports'
        const openReportsDraft = new Set(state.openReports);

        // 2. Iterate over the input data and perform all mutations on the drafts
        //(This is the core equivalent of `state.withMutations(state => ...)` )
        reports.forEach(report => {
          const normalizedReport = fixReport(report);
          
          // Add ID to openReports Set if no action was taken
          if (!normalizedReport.action_taken) {
            openReportsDraft.add(report.id);
          } else {
            // Ensure it's removed if action_taken became true during normalization
            openReportsDraft.delete(report.id);
          }

          // Set the full report record in the reports map (equivalent to state.setIn(['reports', report.id], ...))
          reportsDraft[report.id] = normalizedReport;
        });

        // 3. Return the new state with the updated drafts
        return {
          reports: reportsDraft,
          openReports: openReportsDraft,
        };
      });
    },

    patchAdminReportsRequestOrSuccess(reports) {
      setScoped((state) => {
        // 1. Create a *new* Set instance from the current state data.
        // This is our mutable 'draft' within the function scope.
        const openReportsDraft = new Set(state.openReports);

        // 2. Iterate over the input data and perform all mutations on the draft object.
        //    (This is the core equivalent of `state.withMutations(state => ...)` )
        reports.forEach(report => {
          switch (report.state) {
            case 'open':
              // Add the ID to the Set (Set.add() is idempotent, handles existing IDs safely)
              openReportsDraft.add(report.id);
              break;
            default:
              // For any other state (closed, resolved, etc.), delete the ID from the Set
              openReportsDraft.delete(report.id);
          }
        });

        // 3. Return the *final* mutated draft as the new state value for that key.
        return {
          openReports: openReportsDraft,
        };
      });
    },

    fetchAdminUsersSuccess(accounts, filters, page) {
      setScoped((state) => {
        // 1. Create a mutable draft of the 'users' map to operate on locally.
        const usersMapDraft = { ...state.users };

        // 2. Implement the logic from 'maybeImportUnapproved' and 'maybeImportLatest' 
        //    by updating the state slice variables using standard JS Set operations:
        if (filters.pending) {
          // Update awaitingApproval immutably via a new Set instance
          const newIds = accounts.map(account => account.id);
          state.awaitingApproval = new Set([...Array.from(state.awaitingApproval), ...newIds]);
        }
      
        if (page === 1 && !filters.pending) {
          // Update latestUsers immutably via a new Set instance
          const newIds = accounts.map(account => account.id);
          state.latestUsers = new Set(newIds);
        }

        // 3. Iterate over the users and normalize/set them in the 'users' map draft
        accounts.forEach(account => {
          const normalizedUser = fixUser(account);
          usersMapDraft[account.id] = normalizedUser;
        });

        // 4. Return the new state object with all updated slices.
        return {
          users: usersMapDraft,
          // awaitingApproval and latestUsers are already updated as they are direct 
          // properties of the 'state' object provided to the set() updater function.
        };
      });
    },

    deleteOrRejectAdminUserRequestOrSuccess(accountId) {
      setScoped((state) => {
        // 1. Create a new Set instance (equivalent to orderedSet.delete() returning a new set reference)
        const updatedAwaitingApproval = new Set(state.awaitingApproval);
        updatedAwaitingApproval.delete(accountId);

        // 2. Create a new 'users' object without the specified accountId
        // This is the equivalent of state.deleteIn(['users', accountId]);
        const updatedUsersMap = { ...state.users };
        delete updatedUsersMap[accountId]; // Safely mutate the local draft copy

        // 3. Return the new state object with all updated slices.
        return {
          awaitingApproval: updatedAwaitingApproval,
          users: updatedUsersMap,
        };
      });
    },

    approveAdminUsersRequest(accountId) {
      setScoped((state) => {
        // 1. Create a new Set instance (equivalent to orderedSet.add() returning a new set reference)
        const updatedAwaitingApproval = new Set(state.awaitingApproval);
        updatedAwaitingApproval.delete(accountId);

        // 2. Return the new state object with all updated slices.
        return {
          awaitingApproval: updatedAwaitingApproval,
        };
      });
    },

    approveAdminUserSuccess(user) {
      setScoped((state) => {
        // 1. Create a new Set instance (equivalent to orderedSet.delete() returning a new set reference)
        const updatedAwaitingApproval = new Set(state.awaitingApproval);
        updatedAwaitingApproval.delete(user.id);

        // 2. Normalize the user and set in the 'users' map
        const normalizedUser = fixUser(user);
        const updatedUsersMap = { ...state.users };
        updatedUsersMap[user.id] = normalizedUser;  
        // 3. Return the new state object with all updated slices.
        return {
          awaitingApproval: updatedAwaitingApproval,
          users: updatedUsersMap,
        };
      });
    },

    async fetchReports(params) {
      try {
        const response = await fetch('/api/v1/admin/reports?' + new URLSearchParams(params), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`Error fetching reports: ${response.statusText}`);
        }
        const reports = await response.json();
        const root = rootGet();
        reports.forEach(report => {
          root.importer?.importFetchedAccount?.(report.account.account || []);
          root.importer?.importFetchedAccount?.(report.target_account.account || []);
          this.fetchOrUpdateAdminConfigsSuccess(report.configs || []);
        });
        this.fetchAdminReportsSuccess(reports);
      } catch (error) {
        console.error('Error fetching reports:', error);    
      }
    },

    async patchReports(ids, reportState) { //TODO recheck later
      const reports = ids.map((id) => ({ id, state: reportState }));

      const results = [];
      for (const { id, state } of reports) {
        // map desired state -> API action
        const action = state === 'resolved' ? 'resolve' : 'reopen';
        try {
          const response = await fetch(`/api/v1/admin/reports/${id}/${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state }),
          });
          if (!response.ok) {
            throw new Error(`Error patching report ${id}: ${response.statusText}`);
          }
          const json = await response.json();
          if (json) results.push(json);
        } catch (error) {
          console.error(`Error patching report ${id}:`, error);
        }
      }

      // Notify the slice of the patch results so local state can update.
      if (results.length > 0) {
        try {
          this.patchAdminReportsRequestOrSuccess(results);
        } catch (err) {
          // non-fatal: keep going but log so we can diagnose
          console.error('patchReports: failed to notify local slice', err);
        }
      }

      return results;
    },

    closeReports(ids) {
      return this.patchReports(ids, 'resolved');
    },

    async fetchUsers(filters, page = 1, query, pageSize = 50, url) {
      const params = { page, limit: pageSize, ...filters };
      if (query) params.q = query;

      const root = rootGet();
      const fetchUrl = url || '/api/v1/admin/accounts?' + new URLSearchParams(params);

      try {
        const response = await fetch(fetchUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`Error fetching users: ${response.statusText}`);

        const payload = await response.json();
        const accounts = Array.isArray(payload)
          ? payload.map((item) => (item && item.account ? item.account : item))
          : [];

        const link = response.headers.get('link') || response.headers.get('Link');
        let next = null;
        if (link) {
          const m = link.match(/<([^>]+)>\s*;\s*rel="?next"?/i);
          if (m) next = m[1];
        }
        if (!next && payload && typeof payload.next === 'string') next = payload.next;

        // Import accounts and prefetch relationships if available
        root.importer?.importFetchedAccounts?.(accounts);
        if (root.accounts && typeof root.accounts.fetchRelationships === 'function') {
          // fire-and-forget but await to ensure relationships are prefetched when callers rely on it
          await root.accounts.fetchRelationships(accounts.map((a) => a.id));
        }

        // Notify slice with the plain account objects, filters, and page
        this.fetchAdminUsersSuccess(accounts, filters, page);

        return { accounts, next };
      } catch (error) {
        console.error('Error fetching users:', error);
        return { accounts: [], next: null };
      }
    },

    revokeName(accountId, reportId) {
      fetch(`/api/v1/admin/accounts/${accountId}/revoke_name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({  
          type: 'revoke_name',
          report_id: reportId 
        }),
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error revoking name: ${response.statusText}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error('Error revoking name:', error);
        throw error;
      });
    },

    deactivateUsers(accountIds, reportId) {
      return Promise.all(accountIds.map((accountId) => {
        return fetch(`/api/v1/admin/accounts/${accountId}/action`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({  
            type: 'disable',
            report_id: reportId 
          }),
        })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Error deactivating account ${accountId}: ${response.statusText}`);
          }
          return response.json();
        })
        .catch((error) => {
          console.error(`Error deactivating account ${accountId}:`, error);
          throw error;
        });
      }));
    },
    
    async deleteUser(accountId) {
      const root = rootGet();
      const nicknames = accountIdsToAccts(root, [accountId]);

      this.approveAdminUserSuccess(accountId);

      try {
        await fetch(`/api/v1/admin/accounts/${accountId}/approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nicknames }),
        }).then(response => {
          if (!response.ok) {
            throw new Error(`Error approving user: ${response.statusText}`);
          }
          return response.json();
        }).then(({ nicknames }) => {
           this.deleteOrRejectAdminUserRequestOrSucces(nicknames, accountId)
        });
        // Additional logic if needed
      } catch (error) {
        console.error('Error approving user:', error);
        throw error;
      }
    },

    approveUser(accountId) {
      this.approveAdminUsersRequest(accountId);

      fetch(`/api/v1/admin/accounts/${accountId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error approving user: ${response.statusText}`);
        }
        return response.json();
      })
      .then(({ user }) => {
        this.approveAdminUsersSuccess(user, accountId);
      })
      .catch((error) => {
        console.error('Error approving user:', error);
        throw error;
      });
    },

    async rejectUser(accountId) {
      this.deleteOrRejectAdminUserRequestOrSuccess(accountId);

      fetch(`/api/v1/admin/accounts/${accountId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error rejecting user: ${response.statusText}`);
        }
        return response.json();
      })
      .then(({ user }) => {
        this.deleteOrRejectAdminUserRequestOrSuccess(user, accountId);
      })
      .catch((error) => {
        console.error('Error rejecting user:', error);
        throw error;
      });
    },

    async deleteStatus(id) {
      fetch(`/api/v1/admin/statuses/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error deleting status: ${response.statusText}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error('Error deleting status:', error);
        throw error;
      });   
    },

    async toggleStatusVisibility(id, sensitive) {
      fetch(`/api/v1/admin/statuses/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sensitive: !sensitive }),
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error toggling status visibility: ${response.statusText}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error('Error toggling status visibility:', error);
        throw error;
      });   
    },

    tagUsers(accountIds, tags) {
      const root = rootGet();
      const nicknames = accountIdsToAccts(root, accountIds);

      fetch(`/api/v1/admin/users/tag`, {
        method: 'POST',     
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({  
          nicknames,
          tags 
        }),
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error tagging users: ${response.statusText}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error('Error tagging users:', error);
        throw error;
      }); 
    },

    untagUsers(accountIds, tags) {
      const root = rootGet();
      const nicknames = accountIdsToAccts(root, accountIds);

      // Legacy: allow removing legacy 'donor' tags.
      if (tags.includes('badge:donor')) {
        tags = [...tags, 'donor'];
      }

      fetch(`/api/v1/admin/users/untag`, {
        method: 'POST',     
        headers: {      
          'Content-Type': 'application/json', 
        },    
        body: JSON.stringify({  
          nicknames,  
          tags
        }),
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error untagging users: ${response.statusText}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error('Error untagging users:', error);
        throw error;
      });
    },

    setTags(accountId, oldTags, newTags) {
      const oldBadges = oldTags.filter(tag => tag.startsWith('badge:'));
      const newBadges = newTags.filter(tag => tag.startsWith('badge:'));

      this.setTags(accountId, oldBadges, newBadges);
    },

    addPermission(accountIds, permissionGroup) {
      const root = rootGet();
      const nicknames = accountIdsToAccts(root, accountIds);
      return (async () => {
        try {
          const response = await fetch(`/api/v1/admin/users/permission_group/${permissionGroup}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nicknames }),
          });
          if (!response.ok) throw new Error(`Error adding permission group: ${response.statusText}`);
          return await response.json();
        } catch (error) {
          console.error('Error adding permission group:', error);
          return null;
        }
      })();
    },

    removePermission(accountIds, permissionGroup) {
      const root = rootGet();
      const nicknames = accountIdsToAccts(root, accountIds);
      return (async () => {
        try {
          const response = await fetch(`/api/v1/admin/users/permission_group/${permissionGroup}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nicknames }),
          });
          if (!response.ok) throw new Error(`Error removing permission group: ${response.statusText}`);
          return await response.json();
        } catch (error) {
          console.error('Error removing permission group:', error);
          return null;
        }
      })();
    },

    async promoteToAdmin(accountId) {
      try {
        const [addResult, removeResult] = await Promise.all([
          this.addPermission([accountId], 'admin'),
          this.removePermission([accountId], 'moderator'),
        ]);
        return { added: addResult, removed: removeResult };
      } catch (err) {
        console.error('promoteToAdmin failed', err);
        return null;
      }
    },

    async promoteToModerator(accountId) {
      try {
        const [addResult, removeResult] = await Promise.all([
          this.addPermission([accountId], 'moderator'),
          this.removePermission([accountId], 'admin'),
        ]);
        return { added: addResult, removed: removeResult };
      } catch (err) {
        console.error('promoteToModerator failed', err);
        return null;
      }
    },

    async demoteToUser(accountId) {
      try {
        const [removeAdminResult, removeModResult] = await Promise.all([
          this.removePermission([accountId], 'admin'),
          this.removePermission([accountId], 'moderator'),
        ]);
        return { removedAdmin: removeAdminResult, removedModerator: removeModResult };
      } catch (err) {
        console.error('demoteToUser failed', err);
        return null;
      }
    },

    setRole(accountId, role) {
      switch (role) {
        case 'admin':
          return this.promoteToAdmin(accountId);
        case 'moderator':
          return this.promoteToModerator(accountId);
        case 'user':
          return this.demoteToUser(accountId);
        default:
          console.error('setRole: unknown role', role);
          return null;
      }
    },  

    










  }
}

export default createAdminSlice;
