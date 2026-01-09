// Slice factory for user lists (per-user saved lists, subscriptions, etc.)

// Pattern matches other slices: `createXxxSlice(set, get, rootSet, rootGet)`
export const ReactionRecord = {
  accounts: new Set(),
  count: 0,
  name: "",
  url: null,
};

const ParticipationRequestListRecord = {
  next: null,
  items: new Set(),
  isLoading: false,
};

export const ParticipationRequestRecord = {
  account: "",
  participation_message: null,
};

const initialState = {
  followers: new Map(),
  following: new Map(),
  reblogged_by: new Map(),
  favourited_by: new Map(),
  disliked_by: new Map(),
  reactions: new Map(),
  zapped_by: new Map(),
  follow_requests: {
    next: null,
    items: new Set(),
    isLoading: false,
  },
  blocks: {
    next: null,
    items: new Set(),
    isLoading: false,
  },
  mutes: {
    next: null,
    items: new Set(),
    isLoading: false,
  },
  directory: {
    next: null,
    items: new Set(),
    isLoading: true,
  },
  pinned: new Map(),
  birthday_reminders: new Map(),
  familiar_followers: new Map(),
  event_participations: new Map(),
  event_participation_requests: new Map(),
  membership_requests: new Map(),
  group_blocks: new Map(),
};

export const createUserListAdderSlice = (setScoped, getScoped, rootSet, rootGet) => {
  const set = setScoped;
  // get not used in this slice
  return ({
    ...initialState,

  fetchFollowersSuccess(id, accounts, next) {
    set((state) => {
      // 1. Create the new nested data structure (the 'ListRecord' equivalent)
      const newListData = {
        next: next !== undefined ? next : null, // Handle undefined case from optional param
        // Use a standard JS Set for ordered unique IDs
        items: new Set(accounts.map((item) => item.id)),
      };

      // 2. Update the state immutably using spread syntax:
      // This is the equivalent of state.setIn(['followers', action.id], newListData);
      return {
        followers: {
          ...state.followers, // Keep existing follower lists
          [id]: newListData, // Set/overwrite the specific account's list data
        },
      };
    });
  },

  expandfollowersSuccess(id, accounts, next) {
    set((state) => {
      // 1. Get the current nested list object
      const currentList = state.followers[id] || {
        items: new Set(),
        isLoading: false,
      };

      // 2. Calculate the new 'items' list/set immutably
      const newItemsToAdd = accounts.map((item) => item.id);

      // We assume 'items' is a Set (like ImmutableOrderedSet used in original code).
      // Convert current items to an Array, concat new items, and convert back to a Set to handle uniqueness/order.
      const updatedItemsSet = new Set([
        ...Array.from(currentList.items),
        ...newItemsToAdd,
      ]);

      // 3. Create the new nested list object (the 'map as List' equivalent) immutably
      const updatedListObject = {
        ...currentList, // Keep existing properties
        next: next,
        isLoading: false,
        items: updatedItemsSet, // Set the updated items set
      };

      // 4. Update the main 'followers' object and return the new top-level state
      // This is the equivalent of state.updateIn(['followers', accountId], ...)
      return {
        followers: {
          ...state.followers, // Keep other follower lists
          [id]: updatedListObject, // Overwrite this specific account's list
        },
      };
    });
  },

  fetchFollowingSuccess(id, accounts, next) {
    set((state) => {
      const newListData = {
        next: next !== undefined ? next : null,
        items: new Set(accounts.map((item) => item.id)),
      };
      return {
        following: {
          ...state.following,
          [id]: newListData,
        },
      };
    });
  },

  expandFollowingsuccess(id, accounts, next) {
    set((state) => {
      const currentList = state.following[id] || {
        items: new Set(),
        isLoading: false,
      };
      const newItemsToAdd = accounts.map((item) => item.id);
      const updatedItemsSet = new Set([
        ...Array.from(currentList.items),
        ...newItemsToAdd,
      ]);

      const updatedListObject = {
        ...currentList,
        next: next,
        isLoading: false,
        items: updatedItemsSet,
      };
      return {
        following: {
          ...state.following,
          [id]: updatedListObject,
        },
      };
    });
  },

  fetchReblogSuccess(id, accounts, next) {
    set((state) => {
      const newListData = {
        next: next !== undefined ? next : null,
        items: new Set(accounts.map((item) => item.id)),
      };
      return {
        reblogged_by: {
          ...state.reblogged_by,
          [id]: newListData,
        },
      };
    });
  },

  expandReblogSuccess(id, accounts, next) {
    set((state) => {
      const currentList = state.reblogged_by[id] || {
        items: new Set(),
        isLoading: false,
      };
      const newItemsToAdd = accounts.map((item) => item.id);
      const updatedItemsSet = new Set([
        ...Array.from(currentList.items),
        ...newItemsToAdd,
      ]);
      const updatedListObject = {
        ...currentList,
        next: next,
        isLoading: false,
        items: updatedItemsSet,
      };
      return {
        reblogged_by: {
          ...state.reblogged_by,
          [id]: updatedListObject,
        },
      };
    });
  },

  fetchFavouritesSuccess(id, accounts, next) {
    set((state) => {
      const newListData = {
        next: next !== undefined ? next : null,
        items: new Set(accounts.map((item) => item.id)),
      };
      return {
        favourited_by: {
          ...state.favourited_by,
          [id]: newListData,
        },
      };
    });
  },

  expandFavouritesSuccess(id, accounts, next) {
    set((state) => {
      const currentList = state.favourited_by[id] || {
        items: new Set(),
        isLoading: false,
      };
      const newItemsToAdd = accounts.map((item) => item.id);
      const updatedItemsSet = new Set([
        ...Array.from(currentList.items),
        ...newItemsToAdd,
      ]);
      const updatedListObject = {
        ...currentList,
        next: next,
        isLoading: false,
        items: updatedItemsSet,
      };
      return {
        favourited_by: {
          ...state.favourited_by,
          [id]: updatedListObject,
        },
      };
    });
  },

  fetchDislikesSuccess(id, accounts, next) {
    set((state) => {
      const newListData = {
        next: next !== undefined ? next : null,
        items: new Set(accounts.map((item) => item.id)),
      };
      return {
        disliked_by: {
          ...state.disliked_by,
          [id]: newListData,
        },
      };
    });
  },

  fetchReactionsSuccess(id, reactions) {
    set((state) => {
      // 1. Map the API entities to the desired nested structure (ReactionRecord equivalent)
      const processedReactionItems = reactions.map((apiReaction) => {
        // Separate 'accounts' array from the rest of the reaction properties
        const { accounts, ...reactionProps } = apiReaction;

        // Create the nested 'accounts' Set
        const accountIdsSet = new Set(accounts.map((account) => account.id));

        // Create the full 'ReactionRecord' equivalent JS object,
        // applying defaults where needed and mapping API data:
        const reactionRecord = {
          accounts: accountIdsSet,
          count: reactionProps.count || 0, // Use API value or default to 0
          name: reactionProps.name || "", // Use API value or default to ''
          url: reactionProps.url || null, // Use API value or default to null
          // ... any other API properties are ignored by this specific structure
        };

        return reactionRecord;
      });

      // 2. Wrap the processed items in the top-level list structure (ReactionListRecord equivalent)
      const newReactionList = {
        // Use a Set for the top-level items collection
        items: new Set(processedReactionItems),
      };

      return {
        reactions: {
          ...state.reactions,
          [id]: newReactionList,
        },
      };
    });
  },

  updateNotifications(notification) {
    set((state) => {
      if (notification.type != "follow_request") {
        return state; // No changes for other notification types
      }
      // 1. Get the current items Set
      const currentItemsSet = state.follow_requests.items;

      // 2. Get the new ID to add
      const newAccountId = notification.account.id;

      // 3. Create a *new* Set that includes both the new ID and all existing IDs.
      //    The JS Set constructor handles uniqueness automatically.
      //    By placing the new ID first, we achieve a 'prepend'/'union' behavior where
      //    new items appear at the beginning of the iteration order.
      const updatedItemsSet = new Set([
        newAccountId,
        ...Array.from(currentItemsSet),
      ]);

      // 4. Update the state immutably using spread syntax:
      // This is the equivalent of state.updateIn(['follow_requests', 'items'], ...)
      return {
        follow_requests: {
          ...state.follow_requests, // Keep other follow_requests properties
          items: updatedItemsSet, // Set the new items Set
        },
      };
    });
  },

  fetchFollowRequestsSuccess(accounts, next) {
    set((state) => {
      const newListData = {
        next: next !== undefined ? next : null,
        items: new Set(accounts.map((item) => item.id)),
      };
      return {
        follow_requests: newListData,
      };
    });
  },

  expandFollowRequestsSuccess(accounts, next) {
    set((state) => {
      const currentList = state.follow_requests || {
        items: new Set(),
        isLoading: false,
      };
      const newItemsToAdd = accounts.map((item) => item.id);
      const updatedItemsSet = new Set([
        ...Array.from(currentList.items),
        ...newItemsToAdd,
      ]);

      const updatedListObject = {
        ...currentList,
        next: next,
        isLoading: false,
        items: updatedItemsSet,
      };
      return {
        follow_requests: updatedListObject,
      };
    });
  },

  authorizeOrRejectFollowrequestSuccess(id) {
    set((state) => {
      const currentList = state.follow_requests || {
        items: new Set(),
        isLoading: false,
      };
      const updatedItemsSet = new Set([...Array.from(currentList.items)]);
      updatedItemsSet.delete(id);
      const updatedListObject = {
        ...currentList,
        items: updatedItemsSet,
      };
      return {
        follow_requests: updatedListObject,
      };
    });
  },

  fetchBlocksSuccess(accounts, next) {
    set((state) => {
      const newListData = {
        next: next !== undefined ? next : null,
        items: new Set(accounts.map((item) => item.id)),
      };
      return {
        blocks: newListData,
      };
    });
  },

  fetchDirectorySuccess(accounts, next) {
    set((state) => {
      const newListData = {
        next: next !== undefined ? next : null,
        items: new Set(accounts.map((item) => item.id)),
      };
      return {
        directory: newListData,
      };
    });
  },

  expandDirectorySuccess(accounts, next) {
    set((state) => {
      const currentList = state.directory || {
        items: new Set(),
        isLoading: false,
      };

      const newItemsToAdd = accounts.map((item) => item.id);

      const updatedItemsSet = new Set([
        ...Array.from(currentList.items),
        ...newItemsToAdd,
      ]);

      const updatedListObject = {
        ...currentList,
        next: next,
        isLoading: false,
        items: updatedItemsSet,
      };
      return {
        directory: updatedListObject,
      };
    });
  },

  fetchOrExpandDirectoryRequest() {
    set((state) => {
      const currentList = state.directory || {
        items: new Set(),
        isLoading: false,
      };
      const updatedListObject = {
        ...currentList,
        isLoading: true,
      };
      return {
        directory: updatedListObject,
      };
    });
  },

  fetchPinnedAccountsSuccess(id, accounts, next) {
    set((state) => {
      const newListData = {
        next: next !== undefined ? next : null,
        items: new Set(accounts.map((item) => item.id)),
      };
      return {
        pinned: {
          ...state.pinned,
          [id]: newListData,
        },
      };
    });
  },

  fetchBirthdayRemindersSuccess(id, accounts, next) {
    set((state) => {
      const newListData = {
        next: next !== undefined ? next : null,
        items: new Set(accounts.map((item) => item.id)),
      };
      return {
        birthday_reminders: {
          ...state.birthday_reminders,
          [id]: newListData,
        },
      };
    });
  },

  fetchFamiliarFollowersSuccess(id, accounts, next) {
    set((state) => {
      const newListData = {
        next: next !== undefined ? next : null,
        items: new Set(accounts.map((item) => item.id)),
      };
      return {
        familiar_followers: {
          ...state.familiar_followers,
          [id]: newListData,
        },
      };
    });
  },

  fetchEventParticipationsSuccess(id, accounts, next) {
    set((state) => {
      const newListData = {
        next: next !== undefined ? next : null,
        items: new Set(accounts.map((item) => item.id)),
      };
      return {
        event_participations: {
          ...state.event_participations,
          [id]: newListData,
        },
      };
    });
  },

  expandEventParticipationsSuccess(id, accounts, next) {
    set((state) => {
      const currentList = state.event_participations[id] || {
        items: new Set(),
        isLoading: false,
      };
      const newItemsToAdd = accounts.map((item) => item.id);

      const updatedItemsSet = new Set([
        ...Array.from(currentList.items),
        ...newItemsToAdd,
      ]);
      const updatedListObject = {
        ...currentList,
        next: next,
        isLoading: false,
        items: updatedItemsSet,
      };
      return {
        event_participations: {
          ...state.event_participations,
          [id]: updatedListObject,
        },
      };
    });
  },

  fetchEventParticipationRequestsSuccess(id, participations, next) {
    set((state) => {
      const newListData = {
        next: next !== undefined ? next : null,
        items: new Set(
          participations.map(({ account, participation_message }) =>
            ParticipationRequestRecord({
              account: account.id,
              participation_message: participation_message,
            }),
          ),
        ),
      };
      return {
        event_participation_requests: {
          ...state.event_participation_requests,
          [id]: ParticipationRequestListRecord(newListData),
        },
      };
    });
  },

  expandEventParticipationRequestsSuccess(id, participations, next) {
    set((state) => {
      const currentList = state.event_participation_requests[id] || {
        items: new Set(),
        isLoading: false,
      };
      const newItemsToAdd = participations.map(
        ({ account, participation_message }) =>
          ParticipationRequestRecord({
            account: account.id,
            participation_message: participation_message,
          }),
      );
      const updatedItemsSet = new Set([
        ...Array.from(currentList.items),
        ...newItemsToAdd,
      ]);
      const updatedListObject = {
        ...currentList,
        next: next,
        isLoading: false,
        items: updatedItemsSet,
      };
      return {
        event_participation_requests: {
          ...state.event_participation_requests,
          [id]: updatedListObject,
        },
      };
    });
  },

  authorizeOrRejectEventParticipationRequestSuccess(id, accountId) {
    set((state) => {
      const currentList = state.event_participation_requests[id] || {
        items: new Set(),
        isLoading: false,
      };
      const updatedItemsSet = new Set([...Array.from(currentList.items)]);
      updatedItemsSet.forEach((item) => {
        if (item.account === accountId) {
          updatedItemsSet.delete(item);
        }
      });
      const updatedListObject = {
        ...currentList,
        items: updatedItemsSet,
      };
      return {
        event_participation_requests: {
          ...state.event_participation_requests,
          [id]: updatedListObject,
        },
      };
    });
  },

  fetchGroupMembershipRequestsSuccess(id, accounts, next) {
    set((state) => {
      const newListData = {
        next: next !== undefined ? next : null,
        items: new Set(accounts.map((item) => item.id)),
      };
      return {
        membership_requests: {
          ...state.membership_requests,
          [id]: newListData,
        },
      };
    });
  },

  expandGroupMembershipRequestsSuccess(id, accounts, next) {
    set((state) => {
      const currentList = state.membership_requests[id] || {
        items: new Set(),
        isLoading: false,
      };
      const newItemsToAdd = accounts.map((item) => item.id);
      const updatedItemsSet = new Set([
        ...Array.from(currentList.items),
        ...newItemsToAdd,
      ]);
      const updatedListObject = {
        ...currentList,
        next: next,
        isLoading: false,
        items: updatedItemsSet,
      };
      return {
        membership_requests: {
          ...state.membership_requests,
          [id]: updatedListObject,
        },
      };
    });
  },

  fetchOrExpandGroupMembershipRequestsRequest(id) {
    set((state) => {
      const currentList = state.membership_requests[id] || {
        items: new Set(),
        isLoading: false,
      };
      const updatedListObject = {
        ...currentList,
        isLoading: true,
      };
      return {
        membership_requests: {
          ...state.membership_requests,
          [id]: updatedListObject,
        },
      };
    });
  },

  fetchOrExpandGroupMembershipRequestsFail(id) {
    set((state) => {
      const currentList = state.membership_requests[id] || {
        items: new Set(),
        isLoading: false,
      };
      const updatedListObject = {
        ...currentList,
        isLoading: false,
      };
      return {
        membership_requests: {
          ...state.membership_requests,
          [id]: updatedListObject,
        },
      };
    });
  },

  authorizeOrRejectGroupMembershipRequestSuccess(groupId, accountId) {
    set((state) => {
      const currentList = state.membership_requests[groupId] || {
        items: new Set(),
        isLoading: false,
      };
      const updatedItemsSet = new Set([...Array.from(currentList.items)]);
      updatedItemsSet.delete(accountId);
      const updatedListObject = {
        ...currentList,
        items: updatedItemsSet,
      };
      return {
        membership_requests: {
          ...state.membership_requests,
          [groupId]: updatedListObject,
        },
      };
    });
  },

  fetchGroupBlocksSuccess(id, accounts, next) {
    set((state) => {
      const newListData = {
        next: next !== undefined ? next : null,
        items: new Set(accounts.map((item) => item.id)),
      };
      return {
        group_blocks: {
          ...state.group_blocks,
          [id]: newListData,
        },
      };
    });
  },

  expandGroupBlocksSuccess(id, accounts, next) {
    set((state) => {
      const currentList = state.group_blocks[id] || {
        items: new Set(),
        isLoading: false,
      };
      const newItemsToAdd = accounts.map((item) => item.id);
      const updatedItemsSet = new Set([
        ...Array.from(currentList.items),
        ...newItemsToAdd,
      ]);
      const updatedListObject = {
        ...currentList,
        next: next,
        isLoading: false,
        items: updatedItemsSet,
      };
      return {
        group_blocks: {
          ...state.group_blocks,
          [id]: updatedListObject,
        },
      };
    });
  },

  fetchOrExpandGroupBlocksRequest(id) {
    set((state) => {
      const currentList = state.group_blocks[id] || {
        items: new Set(),
        isLoading: false,
      };
      const updatedListObject = {
        ...currentList,
        isLoading: true,
      };
      return {
        group_blocks: {
          ...state.group_blocks,
          [id]: updatedListObject,
        },
      };
    });
  },

  fetchOrExpandGroupBlocksFail(id) {
    set((state) => {
      const currentList = state.group_blocks[id] || {
        items: new Set(),
        isLoading: false,
      };
      const updatedListObject = {
        ...currentList,
        isLoading: false,
      };
      return {
        group_blocks: {
          ...state.group_blocks,
          [id]: updatedListObject,
        },
      };
    });
  },

  unblockGroupSuccess(groupId, accountId) {
    set((state) => {
      const currentList = state.group_blocks[groupId] || {
        items: new Set(),
        isLoading: false,
      };
      const updatedItemsSet = new Set([...Array.from(currentList.items)]);
      updatedItemsSet.delete(accountId);
      const updatedListObject = {
        ...currentList,
        items: updatedItemsSet,
      };
      return {
        group_blocks: {
          ...state.group_blocks,
          [groupId]: updatedListObject,
        },
      };
    });
  },
  });
};

export default createUserListAdderSlice;
