// Action-only importer slice. Exposes helpers to import entities
// into the store. This slice intentionally has no local state and
// delegates to the `entities` slice when present; otherwise it writes
// directly into `root` state.
import { accountSchema } from "../../schemas/account";
import { groupSchema } from "../../schemas/group";
import { filteredArray } from "../../schemas/utils";

export function createImporterSlice(setScoped, getScoped, rootSet, rootGet) {
  // Helper: delegate to entities slice action if available
  const callEntitiesImport = (entityType, entities, listKey, pos, newState, overwrite = false) => {
    const root = rootGet();
    if (root && root.entities && typeof root.entities.importEntities === 'function') {
      // entities slice exists as an object of actions
      try {
        // importEntities may expect (type, entities, listKey, pos, newState, overwrite)
        return root.entities.importEntities(entityType, entities, listKey, pos, newState, overwrite);
      } catch (e) {
        console.error('importerSlice: entities.importEntities threw', e);
      }
    }

    // Fallback: write into root state under `entities` key
    rootSet((state) => {
      state.entities = state.entities || {};
      state.entities[entityType] = state.entities[entityType] || { store: {}, lists: {} };
      const cache = state.entities[entityType];
      // Accept array or object -> coerce to array
      const arr = Array.isArray(entities) ? entities : entities && typeof entities === 'object' ? Object.values(entities) : [];
      arr.forEach((e) => {
        const id = e?.id ?? e?.uuid ?? e?.uid ?? null;
        if (!id) return;
        cache.store[id] = e;
      });
      if (typeof listKey === 'string') {
        cache.lists[listKey] = cache.lists[listKey] || { ids: new Set(), state: {} };
        const list = cache.lists[listKey];
        const ids = Array.isArray(arr) ? arr.map((x) => x.id).filter(Boolean) : [];
        if (overwrite) {
          list.ids = new Set(ids);
        } else {
          ids.forEach((id) => list.ids.add(id));
        }
        if (newState) list.state = newState;
      }
    });
  };

    const isBroken = (status) => {
        try {
            // Skip empty accounts
            // https://gitlab.com/soapbox-pub/soapbox/-/issues/424
            if (!status.account.id) 
                return true;
            // Skip broken reposts
            // https://gitlab.com/soapbox-pub/rebased/-/issues/28
            if (status.reblog && !status.reblog.account.id) 
                return true;
            return false;
        } catch {
            return true;
        }
    }

  return {
    importAccount (data) {
        const root = rootGet();
        root.relationships?.importAccount?.(data);
        const account = accountSchema.parse(data);
        return callEntitiesImport('accounts', [account]);
    },

    importAccounts (data) {
        const root = rootGet();
        root.relationships?.importAccounts?.(data);
        const accounts = Array.isArray(data) ? data.map(accountSchema.parse) : [];
        return callEntitiesImport('accounts', accounts);
    },

    importGroup(group) {
      return callEntitiesImport('groups', [group]);
    },

    importGroups(groups) {
      return callEntitiesImport('groups', groups);
    },

    importStatus(status, idempotencyKey) {
        const root = rootGet();
        //const settings = useStore(settingsSelector);
        const expandSpoilers = root.settings['expand_spoilers'] ?? true;
        root.statuses?.importStatus?.(status, expandSpoilers);
        root.scheduledStatuses?.importStatus?.(status);
        root.contexts.importStatus?.(status, idempotencyKey);
        return;
    },

    importPolls(polls) {
        const root = rootGet();
        root.polls?.importPolls?.(polls);
        return;
    },

    importFetchedAccounts(accounts, args) {
        const { should_refetch } = args;
        const normalAccounts = [];

        const processAccount = (account) => {
            if (!account.id) return;

            if (should_refetch) {
            account.should_refetch = true;
            }

            normalAccounts.push(account);

            if (account.moved) {
                processAccount(account.moved);
            }
        };

        accounts.forEach(processAccount);
        this.importAccounts(normalAccounts);
    },

    importFetchedAccount(account) {
        this.importFetchedAccounts([account]);
    },

    importFetchedGroups(groups) {
        const entities = filteredArray(groupSchema).parse(groups);
        this.importGroups(entities);
    },

    importFetchedGroup(group) {
        this.importFetchedGroups([group]);
    },

    importFetchedStatus(status, idempotencyKey) {
       
        if (isBroken(status)) {
            console.warn('importerSlice: skipping broken status', status.id);
            return;
        }

        if (status.reblog.id) {
            this.importFetchedStatus(status.reblog);
        }

        if (status.quote?.id) {
            this.importFetchedStatus(status.quote);
        }

        if (status.poll?.id) {
            this.importFetchedPoll(status.poll);
        }

        if (status.group?.id) {
           this.importFetchedGroup(status.group);
        }

        this.importFetchedAccount(status.account);
        this.importStatus(status, idempotencyKey);
    },

    importFetchedStatuses(statuses) {
        const accounts = [];
        const normalStatuses = [];
        const polls = [];

        function processStatus(status) {
            // Skip broken statuses
            if (isBroken(status)) return;

            normalStatuses.push(status);
            accounts.push(status.account);

            if (status.reblog?.id) {
                processStatus(status.reblog);
            }

            // Fedibird quotes
            if (status.quote?.id) {
                processStatus(status.quote);
            }

            if (status.pleroma?.quote?.id) {
                processStatus(status.pleroma.quote);
            }

            if (status.poll?.id) {
                polls.push(status.poll);
            }

            if (status.group?.id) {
                this.importFetchedGroup(status.group);
            }
        }

         statuses.forEach(processStatus);

         this.importPolls(polls);
         this.importFetchedAccounts(accounts);
         this.importStatuses(normalStatuses);
    },

    importFetchedPoll(poll) {
        this.importPolls([poll]);
    },

    importStatuses(statuses) {
        const root = rootGet(); 
        //const settings = useStore(settingsSelector);
        const expandSpoilers = root.settings['expand_spoilers'] ?? true;
        root.statuses?.importStatuses?.(statuses, expandSpoilers);
        root.scheduledStatuses?.importStatuses?.(statuses);
        root.contexts.importStatuses?.(statuses);
        return;
    },
  };
}

export default createImporterSlice;
