// Action-only importer slice. Exposes helpers to import entities
// into the store. This slice intentionally has no local state and
// delegates to the `entities` slice when present; otherwise it writes
// directly into `root` state.
import { accountSchema } from "../../schemas/account";
import { groupSchema } from "../../schemas/group";
import { filteredArray } from "../../schemas/utils";

export function createImporterSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();

  // Helper to trigger the core entity storage logic
  const callEntitiesImport = (type, entities, listKey, pos, newState, overwrite) => {
    // Calls the 'importEntities' action we refactored in the entities slice
    getActions().importEntities?.(type, entities, listKey, pos, newState, overwrite);
  };

  const isBroken = (status) => {
    if (!status?.account?.id) return true;
    if (status.reblog && !status.reblog.account?.id) return true;
    return false;
  };

  return {
    importAccount(data) {
      const actions = getActions();
      const account = accountSchema.parse(data);
      actions.importKollectiveAccount?.(data); // Notify relationships slice
      return callEntitiesImport('accounts', [account]);
    },

    importAccounts(data) {
      const actions = getActions();
      const accounts = (Array.isArray(data) ? data : []).map(a => accountSchema.parse(a));
      actions.importKollectiveAccounts?.(data);
      return callEntitiesImport('accounts', accounts);
    },

    importGroup(group) {
      const parsed = groupSchema.parse(group);
      return callEntitiesImport('groups', [parsed]);
    },

    importGroups(groups) {
      const parsed = (Array.isArray(groups) ? groups : []).map(g => groupSchema.parse(g));
      return callEntitiesImport('groups', parsed);
    },

    importStatus(status, idempotencyKey) {
      const state = rootGet();
      const actions = getActions();
      const expandSpoilers = state.settings?.expandSpoilers ?? true;

      // Notify relevant slices
      actions.StatusImport?.(status, expandSpoilers);
      actions.importScheduledStatus?.(status);
      actions.importContextStatus?.(status, idempotencyKey);
    },

    importStatuses(statuses) {
      const state = rootGet();
      const actions = getActions();
      const expandSpoilers = state.settings?.expandSpoilers ?? true;

      actions.StatusesImport?.(statuses, expandSpoilers);
      actions.importScheduledStatuses?.(statuses);
      actions.importContextStatuses?.(statuses);
    },

    importPolls(polls) {
      // 1. In a Bound Store, all actions are flattened onto the root
      const actions = rootGet();

      // 2. Delegate to the specific polls slice action
      // Using a unique name (e.g., 'importPollsData') prevents 
      // collisions with this orchestrator action.
      actions.importPollsData?.(polls);
    },

    importFetchedAccount(account) {
      const actions = getActions();
      actions.importFetchedAccounts([account]);
    },

    importFetchedAccounts(accounts, args = {}) {
      const actions = getActions();
      const normalAccounts = [];
      const processAccount = (account) => {
        if (!account?.id) return;
        if (args.should_refetch) account.should_refetch = true;

        normalAccounts.push(account);
        if (account.moved) processAccount(account.moved);
      };

      (accounts || []).forEach(processAccount);
      actions.importAccounts(normalAccounts);
    },

    importFetchedGroup(group) {
      if (!group) return;
      // Wrap single entity in an array for the bulk handler
      getActions().importFetchedGroups([group]);
    },

    importFetchedGroups(groups) {
      // 1. Validate and parse the incoming array using your Zod schema
      const entities = filteredArray(groupSchema).parse(groups || []);
      
      // 2. Route to the internal importGroups logic
      getActions().importGroups(entities);
    },

    importFetchedStatus(status, idempotencyKey) {
      if (isBroken(status)) return;

      const actions = getActions();

      // Recursive extraction for nested content
      if (status.reblog?.id) actions.importFetchedStatus(status.reblog);
      if (status.quote?.id) actions.importFetchedStatus(status.quote);
      
      if (status.poll?.id) actions.importFetchedPoll?.(status.poll);
      if (status.group?.id) actions.importGroup(status.group);

      actions.importFetchedAccount(status.account);
      actions.importStatus(status, idempotencyKey);
    },

    //san this events
    importFetchedStatuses(statuses) {
      const accounts = [];
      const normalStatuses = [];
      const polls = [];
      const actions = getActions();

      const processStatus = (status) => {
        if (isBroken(status)) return;

        normalStatuses.push(status);
        accounts.push(status.account);

        if (status.reblog?.id) processStatus(status.reblog);
        if (status.quote?.id) processStatus(status.quote);
        if (status.kollective?.quote?.id) processStatus(status.kollective.quote);
        if (status.poll?.id) polls.push(status.poll);
        if (status.group?.id) actions.importFetchedGroup(status.group);
      };

      (statuses || []).forEach(processStatus);

      actions.importPolls?.(polls);
      actions.importFetchedAccounts(accounts);
      actions.importStatuses(normalStatuses);
    },

    importFetchedPoll(poll) {
      if (!poll) return;
      // 3. Delegate to the root-level importPolls action
      getActions().importPolls?.([poll]);
    },

  };
}

export default createImporterSlice;
