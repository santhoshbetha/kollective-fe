// Slice factory for user lists (per-user saved lists, subscriptions, etc.)

// Pattern matches other slices: `createXxxSlice(set, get, rootSet, rootGet)`

const ParticipationRequestListRecord = {
  next: null,
  items: new Set(),
  isLoading: false,
};

export const ParticipationRequestRecord = {
  account: "",
  participation_message: null,
};

export const ReactionRecord = { accounts: new Set(), count: 0, name: "", url: null };
const ListRecord = () => ({ next: null, items: new Set(), isLoading: false });

const initialState = {
  followers: {}, following: {}, reblogged_by: {}, favourited_by: {},
  disliked_by: {}, reactions: {}, zapped_by: {}, pinned: {},
  birthday_reminders: {}, familiar_followers: {}, event_participations: {},
  event_participation_requests: {}, membership_requests: {}, group_blocks: {},
  follow_requests: ListRecord(),
  blocks: ListRecord(),
  mutes: ListRecord(),
  directory: { ...ListRecord(), isLoading: true },
};

export const createUserListAdderSlice = (setScoped, getScoped, rootSet, rootGet) => {

  // Helper: ensures a nested list exists and updates it
  const updateNestedList = (state, group, id, accounts, next, isExpand = false) => {
    if (!state[group][id]) state[group][id] = ListRecord();
    const list = state[group][id];

    if (!isExpand) list.items.clear();
    accounts.forEach(acc => list.items.add(acc.id));
    
    list.next = next ?? null;
    list.isLoading = false;
  };

  const setNestedLoading = (state, group, id, isLoading) => {
    if (!state[group][id]) state[group][id] = ListRecord();
    state[group][id].isLoading = isLoading;
  };

  return ({
    ...initialState,

    fetchFollowersSuccess: (id, accs, next) => 
      setScoped(s => updateNestedList(s, 'followers', id, accs, next)),

    expandFollowersSuccess: (id, accs, next) => 
      setScoped(s => updateNestedList(s, 'followers', id, accs, next, true)),

    fetchFollowingSuccess: (id, accs, next) => 
      setScoped(s => updateNestedList(s, 'following', id, accs, next)),
    expandFollowingSuccess: (id, accs, next) => 
      setScoped(s => updateNestedList(s, 'following', id, accs, next, true)),

    /* --- Interactions (Reblogs, Favs, Dislikes) --- */
    fetchReblogSuccess: (id, accs, next) => 
      setScoped(s => updateNestedList(s, 'reblogged_by', id, accs, next)),

    expandReblogSuccess: (id, accs, next) => 
      setScoped(s => updateNestedList(s, 'reblogged_by', id, accs, next, true)),

    fetchFavouritesSuccess: (id, accs, next) => 
      setScoped(s => updateNestedList(s, 'favourited_by', id, accs, next)),

    expandFavouritesSuccess: (id, accs, next) => 
      setScoped(s => updateNestedList(s, 'favourited_by', id, accs, next, true)),

    fetchDislikesSuccess: (id, accs, next) => 
      setScoped(s => updateNestedList(s, 'disliked_by', id, accs, next)),

    /* --- Specialized Lists (Reactions) --- */
    fetchReactionsSuccess(id, reactions) {
      setScoped((state) => {
        const processed = (reactions || []).map((api) => ({
          ...ReactionRecord,
          ...api,
          accounts: new Set(api.accounts?.map(a => a.id) || []),
        }));

        state.reactions[id] = { items: new Set(processed) };
      });
    },

    updateFollowRequestNotifications(notification) {
      if (notification.type !== "follow_request") return;

      setScoped((state) => {
        const id = notification.account.id;
        // Prepend logic: Convert to array to put new ID first, then back to Set
        state.follow_requests.items = new Set([
          id,
          ...Array.from(state.follow_requests.items)
        ]);
      });
    },

    fetchFollowRequestsSuccess(accounts, next) {
      setScoped((state) => {
        state.follow_requests.next = next ?? null;
        state.follow_requests.isLoading = false;
        state.follow_requests.items = new Set(accounts.map(a => a.id));
      });
    },

    expandFollowRequestsSuccess(accounts, next) {
      setScoped((state) => {
        state.follow_requests.next = next ?? null;
        state.follow_requests.isLoading = false;
        
        // Immer handles Set mutations beautifully
        accounts.forEach(a => state.follow_requests.items.add(a.id));
      });
    },

    authorizeOrRejectFollowrequestSuccess(id) {
      setScoped((state) => {
        // Direct deletion on the draft Set
        state.follow_requests.items.delete(id);
      });
    },

    fetchBlocksSuccess(accounts, next) {
      setScoped((state) => {
        state.blocks.next = next ?? null;
        state.blocks.items = new Set(accounts.map(a => a.id));
        state.blocks.isLoading = false;
      });
    },

    fetchDirectorySuccess(accounts, next) {
      setScoped((state) => {
        state.directory.next = next ?? null;
        state.directory.items = new Set(accounts.map(a => a.id));
        state.directory.isLoading = false;
        state.directory.loaded = true;
      });
    },

    expandDirectorySuccess(accounts, next) {
      setScoped((state) => {
        state.directory.next = next ?? null;
        state.directory.isLoading = false;
        
        // Direct Set mutation in the draft
        accounts.forEach(a => state.directory.items.add(a.id));
      });
    },

    fetchOrExpandDirectoryRequest() {
      setScoped((state) => {
        state.directory.isLoading = true;
      });
    },

    /* --- Standard Nested Account Lists --- */
    fetchPinnedAccountsSuccess: (id, accs, next) => 
      setScoped(s => updateNestedList(s, 'pinned', id, accs, next)),

    fetchBirthdayRemindersSuccess: (id, accs, next) => 
      setScoped(s => updateNestedList(s, 'birthday_reminders', id, accs, next)),

    fetchFamiliarFollowersSuccess: (id, accs, next) => 
      setScoped(s => updateNestedList(s, 'familiar_followers', id, accs, next)),

    fetchEventParticipationsSuccess: (id, accs, next) => 
      setScoped(s => updateNestedList(s, 'event_participations', id, accs, next)),

    expandEventParticipationsSuccess: (id, accs, next) => 
      setScoped(s => updateNestedList(s, 'event_participations', id, accs, next, true)),

    /* --- Event Participation Requests --- */
    fetchEventParticipationRequestsSuccess(id, participations, next) {
      setScoped((state) => {
        const items = (participations || []).map(({ account, participation_message }) => ({
          account: account.id,
          participation_message
        }));

        state.event_participation_requests[id] = {
          next: next ?? null,
          isLoading: false,
          items: new Set(items),
        };
      });
    },

    expandEventParticipationRequestsSuccess(id, participations, next) {
      setScoped((state) => {
        const list = state.event_participation_requests[id] || { items: new Set() };
        
        participations.forEach(({ account, participation_message }) => {
          list.items.add({ account: account.id, participation_message });
        });

        list.next = next ?? null;
        list.isLoading = false;
      });
    },

    authorizeOrRejectEventParticipationRequestSuccess(id, accountId) {
      setScoped((state) => {
        const list = state.event_participation_requests[id];
        if (!list) return;

        // Immer allows direct iteration and deletion on the Set draft
        for (const item of list.items) {
          if (item.account === accountId) {
            list.items.delete(item);
          }
        }
      });
    },

    /* --- Membership Requests --- */
    fetchGroupMembershipRequestsSuccess: (id, accs, next) => 
      setScoped(s => updateNestedList(s, 'membership_requests', id, accs, next)),

    expandGroupMembershipRequestsSuccess: (id, accs, next) => 
      setScoped(s => updateNestedList(s, 'membership_requests', id, accs, next, true)),

    fetchOrExpandGroupMembershipRequestsRequest: (id) => 
      setScoped(s => setNestedLoading(s, 'membership_requests', id, true)),

    fetchOrExpandGroupMembershipRequestsFail: (id) => 
      setScoped(s => setNestedLoading(s, 'membership_requests', id, false)),

    authorizeOrRejectGroupMembershipRequestSuccess(groupId, accountId) {
      setScoped((state) => {
        state.membership_requests[groupId]?.items?.delete(accountId);
      });
    },

    /* --- Group Blocks --- */
    fetchGroupBlocksSuccess: (id, accs, next) => 
      setScoped(s => updateNestedList(s, 'group_blocks', id, accs, next)),

    expandGroupBlocksSuccess: (id, accs, next) => 
      setScoped(s => updateNestedList(s, 'group_blocks', id, accs, next, true)),

    fetchOrExpandGroupBlocksRequest: (id) => 
      setScoped(s => setNestedLoading(s, 'group_blocks', id, true)),

    fetchOrExpandGroupBlocksFail: (id) => 
      setScoped(s => setNestedLoading(s, 'group_blocks', id, false)),

    unblockGroupSuccess(groupId, accountId) {
      setScoped((state) => {
        state.group_blocks[groupId]?.items?.delete(accountId);
      });
    },

  });
};

export default createUserListAdderSlice;
