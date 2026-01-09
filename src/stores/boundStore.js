import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import soundsMiddleware from "./middleware/soundsMiddleware.js";
import errorsMiddleware from "./middleware/errorsMiddleware.js";
import { createStatusesSlice } from "./slices/statusesSlice.js";
import { createTimelinesSlice } from "./slices/timelinesSlice.js";
import { createComposeSlice } from "./slices/composeSlice.js";
import { createComposeEventSlice } from "./slices/composeEventSlice.js";
import { createGroupsSlice } from "./slices/groupsSlice.js";
import { createHistorySlice } from "./slices/historySlice.js";
import { createFollowedTagsSlice } from "./slices/followedTagsSlice.js";
import { createGroupMembershipsSlice } from "./slices/groupMembershipsSlice.js";
import { createGroupRelationshipsSlice } from "./slices/groupRelationshipsSlice.js";
import { createPendingStatusesSlice } from "./slices/pendingStatusesSlice.js";
import { createRelationshipsSlice } from "./slices/relationshipsSlice.js";
import { createUserListAdderSlice } from "./slices/userListsSlice.js";
import { createAccountsMetaSlice } from "./slices/accountsMetaSlice.js";
import { createChatsSlice } from "./slices/chatsSlice.js";
import { createChatMessagesSlice } from "./slices/chatMessagesSlice.js";
import { createChatMessageListsSlice } from "./slices/chatMessageListsSlice.js";
import { createContextsSlice } from "./slices/contextsSlice.js";
import { createNotificationsSlice } from "./slices/notificationsSlice.js";
import { createAliasesSlice } from "./slices/aliasesSlice.js";
import { createFiltersSlice } from "./slices/filtersSlice.js";
import { createListAdderSlice } from "./slices/listAdderSlice.js";
import { createListsSlice } from "./slices/listsSlice.js";
import { createLocationsSlice } from "./slices/locationsSlice.js";
import { createTagsSlice } from "./slices/tagsSlice.js";
import { createSuggestionsSlice } from "./slices/suggestionsSlice.js";
import { createstatusListsSlice } from "./slices/statusListsSlice.js";
import { createTrendsSlice } from "./slices/trendsSlice.js";
import { createTrendingStatusesSlice } from "./slices/trendingStatusesSlice.js";
import { createSidebarSlice } from "./slices/sidebarSlice.js";
import { createSettingsSlice } from "./slices/settingsSlice.js";
import { createModalSlice } from "./slices/modalSlice.js";
import { createConversationsSlice } from "./slices/conversationsSlice.js";
import { createRemoteTimelineSlice } from "./slices/remoteTimelineSlice.js";
import { createBackupsSlice } from "./slices/backupsSlice.js";
import { createBlocksSlice } from "./slices/blocksSlice.js";
import { createDirectorySlice } from "./slices/directorySlice.js";
import { createDomainBlocksSlice } from "./slices/domainBlocksSlice.js";
import { createInteractionsSlice } from "./slices/interactionsSlice.js";
import { createEmojiReactsSlice } from "./slices/emojiReactsSlice.js";
import { createEmojisSlice } from "./slices/emojisSlice.js";
import { createEventsSlice } from "./slices/eventsSlice.js";
import { createExportDataSlice } from "./slices/exportDataSlice.js";
import { createFamiliarFollowersSlice } from "./slices/familiarFollowersSlice.js";
import { createFavouritesSlice } from "./slices/favouritesSlice.js";
import { createImportDataSlice } from "./slices/importDataSlice.js";
import { createMarkersSlice } from "./slices/markersSlice.js";
import { createMediaSlice } from "./slices/mediaSlice.js";
import { createAdminSlice } from "./slices/adminSlice.js";
import { createAuthSlice } from "./slices/authSlice.js";
import { createMeSlice } from "./slices/meSlice.js";
import { createMutesSlice } from "./slices/mutesSlice.js";
import { createPollsSlice } from "./slices/pollsSlice.js";
import { createStatusHoverCardSlice } from "./slices/statusHoverCardSlice.js";
import { createProfileHoverCardSlice } from "./slices/profileHoverCardSlice.js";
import { createReportsSlice } from "./slices/reportsSlice.js";
import { createSearchSlice } from "./slices/searchSlice.js";
import { createSecuritySlice } from "./slices/securitySlice.js";
import { createScheduledStatusesSlice } from "./slices/scheduledStatusesSlice.js";
import { createPatronSlice } from "./slices/patronSlice.js";
import { createDropdownMenuSlice } from "./slices/dropdownMenuSlice.js";
import { createDomainListsSlice } from "./slices/domainListsSlice.js";
import { createModerationSlice } from "./slices/moderationSlice.js";
// apps slice optional — leave empty if module cannot be resolved

// Helper to create a scoped setter/getter for a slice key
const createScopedHelpers = (key, set, get) => {
  const scopedSet = (fn) => {
    set((state) => {
      // ensure slice object exists
      state[key] = state[key] || {};
      const sliceState = state[key];
      const res = typeof fn === "function" ? fn(sliceState) : fn;
      if (res !== undefined) state[key] = res;
      else state[key] = sliceState;
    });
  };
  const scopedGet = () => get()[key] || {};
  return [scopedSet, scopedGet];
};

const useBoundStore = create(
  errorsMiddleware(soundsMiddleware(immer((set, get) => {

    const [statusesSet, statusesGet] = createScopedHelpers(
      "statuses",
      set,
      get,
    );
    const [timelinesSet, timelinesGet] = createScopedHelpers(
      "timelines",
      set,
      get,
    );
    const [composeSet, composeGet] = createScopedHelpers("compose", set, get);
    const [composeEventSet, composeEventGet] = createScopedHelpers(
      "composeEvent",
      set,
      get,
    );
    const [groupsSet, groupsGet] = createScopedHelpers("groups", set, get);
    const [followedTagsSet, followedTagsGet] = createScopedHelpers(
      "followedTags",
      set,
      get,
    );
    const [groupMembershipsSet, groupMembershipsGet] = createScopedHelpers(
      "groupMemberships",
      set,
      get,
    );
    const [groupRelationshipsSet, groupRelationshipsGet] = createScopedHelpers(
      "groupRelationships",
      set,
      get,
    );
    const [historySet, historyGet] = createScopedHelpers("history", set, get);
    const [chatMessagesSet, chatMessagesGet] = createScopedHelpers(
      "chatMessages",
      set,
      get,
    );
    const [chatMessageListsSet, chatMessageListsGet] = createScopedHelpers(
      "chatMessageLists",
      set,
      get,
    );
    const [contextsSet, contextsGet] = createScopedHelpers(
      "contexts",
      set,
      get,
    );
    const [chatsSet, chatsGet] = createScopedHelpers("chats", set, get);
    const [notificationsSet, notificationsGet] = createScopedHelpers(
      "notifications",
      set,
      get,
    );
    const [aliasesSet, aliasesGet] = createScopedHelpers("aliases", set, get);
    const [filtersSet, filtersGet] = createScopedHelpers("filters", set, get);
    const [listsSet, listsGet] = createScopedHelpers("lists", set, get);
    const [locationsSet, locationsGet] = createScopedHelpers(
      "locations",
      set,
      get,
    );

    const [tagsSet, tagsGet] = createScopedHelpers("tags", set, get);
    const [suggestionsSet, suggestionsGet] = createScopedHelpers(
      "suggestions",
      set,
      get,
    );
    const [statusListsSet, statusListsGet] = createScopedHelpers(
      "statusLists",
      set,
      get,
    );
    const [pendingStatusesSet, pendingStatusesGet] = createScopedHelpers(
      "pendingStatuses",
      set,
      get,
    );
    const [relationshipsSet, relationshipsGet] = createScopedHelpers(
      "relationships",
      set,
      get,
    );
    const [userListsSet, userListsGet] = createScopedHelpers(
      "userLists",
      set,
      get,
    );
    const [accountsMetaSet, accountsMetaGet] = createScopedHelpers(
      "accountsMeta",
      set,
      get,
    );
    const [blocksSet, blocksGet] = createScopedHelpers("blocks", set, get);
    const [directorySet, directoryGet] = createScopedHelpers("directory", set, get);
    const [domainBlocksSet, domainBlocksGet] = createScopedHelpers(
      "domainBlocks",
      set,
      get,
    );
    const [trendsSet, trendsGet] = createScopedHelpers("trends", set, get);
    const [trendingStatusesSet, trendingStatusesGet] = createScopedHelpers(
      "trendingStatuses",
      set,
      get,
    );
    const [sidebarSet, sidebarGet] = createScopedHelpers("sidebar", set, get);
    const [settingsSet, settingsGet] = createScopedHelpers(
      "settings",
      set,
      get,
    );
    const [modalSet, modalGet] = createScopedHelpers("modal", set, get);
    const [conversationsSet, conversationsGet] = createScopedHelpers(
      "conversations",
      set,
      get,
    );
    const [remoteTimelineSet, remoteTimelineGet] = createScopedHelpers(
      "remoteTimeline",
      set,
      get,
    );
    const [backupsSet, backupsGet] = createScopedHelpers("backups", set, get);
    const [adminSet, adminGet] = createScopedHelpers("admin", set, get);
    const [authSet, authGet] = createScopedHelpers("auth", set, get);
    const [meSet, meGet] = createScopedHelpers("me", set, get);
    const [mutesSet, mutesGet] = createScopedHelpers("mutes", set, get);
    const [pollsSet, pollsGet] = createScopedHelpers("polls", set, get);
    const [statusHoverCardsSet, statusHoverCardsGet] = createScopedHelpers(
      "statusHoverCards",
      set,
      get,
    );
    const [profileHoverCardsSet, profileHoverCardsGet] = createScopedHelpers(
      "profileHoverCards",
      set,
      get,
    );
    const [reportsSet, reportsGet] = createScopedHelpers("reports", set, get);
    const [searchStoreSet, searchStoreGet] = createScopedHelpers(
      "search",
      set,
      get,
    );
    const [securityStoreSet, securityStoreGet] = createScopedHelpers(
      "security",
      set,
      get,
    );
    const [scheduledStatusesStoreSet, scheduledStatusesStoreGet] =
      createScopedHelpers("scheduledStatuses", set, get);
    const [patronStoreSet, patronStoreGet] = createScopedHelpers(
      "patron",
      set,
      get,
    );

    const [dropdownMenuStoreSet, dropdownMenuStoreGet] = createScopedHelpers(
      "dropdownMenu",
      set,
      get,
    );

    const [domainListsStoreSet, domainListsStoreGet] = createScopedHelpers(
      "domainLists",
      set,
      get,
    );
    const [emojiReactsSet, emojiReactsGet] = createScopedHelpers(
      "emojiReacts",
      set,
      get,
    );
    const [emojisSet, emojisGet] = createScopedHelpers("emojis", set, get);
    const [interactionsSet, interactionsGet] = createScopedHelpers(
      "interactions",
      set,
      get,
    );
    const [eventsSet, eventsGet] = createScopedHelpers("events", set, get);
    const [exportDataSet, exportDataGet] = createScopedHelpers(
      "exportData",
      set,
      get,
    );
    const [familiarFollowersSet, familiarFollowersGet] = createScopedHelpers(
      "familiarFollowers",
      set,
      get,
    );
    const [favouritesSet, favouritesGet] = createScopedHelpers(
      "favourites",
      set,
      get,
    );
    const [importDataSet, importDataGet] = createScopedHelpers(
      "importData",
      set,
      get,
    );
    const [markersSet, markersGet] = createScopedHelpers("markers", set, get);
    const [mediaSet, mediaGet] = createScopedHelpers("media", set, get);
    const [moderationSet, moderationGet] = createScopedHelpers(
      "moderation",
      set,
      get,
    );

    const statuses = createStatusesSlice(statusesSet, statusesGet, set, get);
    const timelines = createTimelinesSlice(
      timelinesSet,
      timelinesGet,
      set,
      get,
    );
    const compose = createComposeSlice(composeSet, composeGet, set, get);
    const composeEvent = createComposeEventSlice(
      composeEventSet,
      composeEventGet,
      set,
      get,
    );
    const groups = createGroupsSlice(groupsSet, groupsGet, set, get);
    const followedTags = createFollowedTagsSlice(
      followedTagsSet,
      followedTagsGet,
      set,
      get,
    );
    const groupMemberships = createGroupMembershipsSlice(
      groupMembershipsSet,
      groupMembershipsGet,
      set,
      get,
    );
    const groupRelationships = createGroupRelationshipsSlice(
      groupRelationshipsSet,
      groupRelationshipsGet,
      set,
      get,
    );
    const history = createHistorySlice(historySet, historyGet, set, get);
    const chats = createChatsSlice(chatsSet, chatsGet, set, get);
    const chatMessages = createChatMessagesSlice(
      chatMessagesSet,
      chatMessagesGet,
      set,
      get,
    );
    const chatMessageLists = createChatMessageListsSlice(
      chatMessageListsSet,
      chatMessageListsGet,
      set,
      get,
    );
    const contexts = createContextsSlice(contextsSet, contextsGet, set, get);
    const notifications = createNotificationsSlice(
      notificationsSet,
      notificationsGet,
      set,
      get,
    );
    const aliases = createAliasesSlice(aliasesSet, aliasesGet, set, get);
    const filters = createFiltersSlice(filtersSet, filtersGet, set, get);
    const listAdder = createListAdderSlice(listsSet, listsGet, set, get);
    const lists = createListsSlice(listsSet, listsGet, set, get);
    const locations = createLocationsSlice(locationsSet, locationsGet, set, get);


    const tags = createTagsSlice(tagsSet, tagsGet, set, get);
    const suggestions = createSuggestionsSlice(
      suggestionsSet,
      suggestionsGet,
      set,
      get,
    );
    const pendingStatuses = createPendingStatusesSlice(
      pendingStatusesSet,
      pendingStatusesGet,
      set,
      get,
    );
    const relationships = createRelationshipsSlice(
      relationshipsSet,
      relationshipsGet,
      set,
      get,
    );
    const userLists = createUserListAdderSlice(
      userListsSet,
      userListsGet,
      set,
      get,
    );
    const accountsMeta = createAccountsMetaSlice(
      accountsMetaSet,
      accountsMetaGet,
      set,
      get,
    );
    const blocks = createBlocksSlice(blocksSet, blocksGet, set, get);
    const directory = createDirectorySlice(directorySet, directoryGet, set, get);
    const domainBlocks = createDomainBlocksSlice(
      domainBlocksSet,
      domainBlocksGet,
      set,
      get,
    );
    const emojiReacts = createEmojiReactsSlice(
      emojiReactsSet,
      emojiReactsGet,
      set,
      get,
    );
    const emojis = createEmojisSlice(emojisSet, emojisGet, set, get);
    const interactions = createInteractionsSlice(
      interactionsSet,
      interactionsGet,
      set,
      get,
    );
    const events = createEventsSlice(eventsSet, eventsGet, set, get);
    const exportData = createExportDataSlice(
      exportDataSet,
      exportDataGet,
      set,
      get,
    );
    const familiarFollowers = createFamiliarFollowersSlice(
      familiarFollowersSet,
      familiarFollowersGet,
      set,
      get,
    );
    const favourites = createFavouritesSlice(
      favouritesSet,
      favouritesGet,
      set,
      get,
    );
    const importData = createImportDataSlice(importDataSet, importDataGet, set, get);
    const markers = createMarkersSlice(markersSet, markersGet, set, get);
    const media = createMediaSlice(mediaSet, mediaGet, set, get);
    const moderation = createModerationSlice(
      moderationSet,
      moderationGet,
      set,
      get,
    );
    const statusLists = createstatusListsSlice(
      statusListsSet,
      statusListsGet,
      set,
      get,
    );
    const trends = createTrendsSlice(trendsSet, trendsGet, set, get);
    const trendingStatuses = createTrendingStatusesSlice(
      trendingStatusesSet,
      trendingStatusesGet,
      set,
      get,
    );
    const sidebar = createSidebarSlice(sidebarSet, sidebarGet, set, get);
    const settings = createSettingsSlice(settingsSet, settingsGet, set, get);
    const modal = createModalSlice(modalSet, modalGet, set, get);
    const conversations = createConversationsSlice(
      conversationsSet,
      conversationsGet,
      set,
      get,
    );
    const remoteTimeline = createRemoteTimelineSlice(
      remoteTimelineSet,
      remoteTimelineGet,
      set,
      get,
    );
    const backups = createBackupsSlice(backupsSet, backupsGet, set, get);
    const admin = createAdminSlice(adminSet, adminGet, set, get);
    const auth = createAuthSlice(authSet, authGet, set, get);
    const me = createMeSlice(meSet, meGet, set, get);
    const mutes = createMutesSlice(mutesSet, mutesGet, set, get);
    const polls = createPollsSlice(pollsSet, pollsGet, set, get);
    const statusHoverCards = createStatusHoverCardSlice(
      statusHoverCardsSet,
      statusHoverCardsGet,
      set,
      get,
    );
    const profileHoverCards = createProfileHoverCardSlice(
      profileHoverCardsSet,
      profileHoverCardsGet,
      set,
      get,
    );
    const reports = createReportsSlice(reportsSet, reportsGet, set, get);
    const search = createSearchSlice(searchStoreSet, searchStoreGet, set, get);
    const security = createSecuritySlice(
      securityStoreSet,
      securityStoreGet,
      set,
      get,
    );
    const scheduledStatuses = createScheduledStatusesSlice(
      scheduledStatusesStoreSet,
      scheduledStatusesStoreGet,
      set,
      get,
    );
    const patron = createPatronSlice(patronStoreSet, patronStoreGet, set, get);
    const dropdownMenu = createDropdownMenuSlice(
      dropdownMenuStoreSet,
      dropdownMenuStoreGet,
      set,
      get,
    );

    const domainLists = createDomainListsSlice(
      domainListsStoreSet,
      domainListsStoreGet,
      set,
      get,
    );

    // apps slice not available in this build; provide empty placeholder
    const apps = {};

    return {
      statuses,
      timelines,
      compose,
      composeEvent,
      groups,
      history,
      chats,
      chatMessages,
      chatMessageLists,
      contexts,
      notifications,
      lists,
      listAdder,
      locations,
      aliases,
      filters,
      tags,
      suggestions,
      pendingStatuses,
      relationships,
      userLists,
      accountsMeta,
      blocks,
      directory,
      domainBlocks,
      emojiReacts,
      emojis,
      interactions,
      events,
      familiarFollowers,
      favourites,
      importData,
      markers,
      media,
      moderation,
      exportData,
      followedTags,
      groupMemberships,
      groupRelationships,
      statusLists,
      trends,
      trendingStatuses,
      sidebar,
      settings,
      modal,
      conversations,
      remoteTimeline,
      backups,
      admin,
      auth,
      me,
      mutes,
      polls,
      statusHoverCards,
      profileHoverCards,
      reports,
      search,
      security,
      scheduledStatuses,
      patron,
      dropdownMenu,
      domainLists,
      apps,
    };
  })))
);

export default useBoundStore;
