/* eslint sort-keys: "error" */
//import { custom } from 'soapbox/custom.ts';

/** Import custom overrides, if exists */
//const overrides = custom('features');
const overrides = {};//

/** Parse features for the given instance */
const getKollectiveFeatures = () => {
  return {
    /**
     * Can view and manage ActivityPub aliases through the API.
     * @see GET /api/pleroma/aliases
     * @see PATCH /api/v1/accounts/update_credentials
     */
    accountAliases: true,

    /**
     * The accounts API allows an acct instead of an ID.
     * @see GET /api/v1/accounts/:acct_or_id
     */
    accountByUsername: true,

    /**
     * Ability to create accounts.
     * @see POST /api/v1/accounts
     */
    accountCreation: true,

    /**
     * Ability to pin other accounts on one's profile.
     * @see POST /api/v1/accounts/:id/pin
     * @see POST /api/v1/accounts/:id/unpin
     * @see GET /api/v1/pleroma/accounts/:id/endorsements
     */
    accountEndorsements: true,

    /**
     * Ability to set one's location on their profile.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    accountLocation: true,

    /**
     * Look up an account by the acct.
     * @see GET /api/v1/accounts/lookup
     */
    accountLookup: true,

    /**
     * Move followers to a different ActivityPub account.
     * @see POST /api/pleroma/move_account
     */
    accountMoving: true,

    /**
     * Ability to subscribe to notifications every time an account posts.
     * @see POST /api/v1/accounts/:id/follow
     */
    accountNotifies: true,
    /**
     * Ability to subscribe to notifications every time an account posts.
     * @see POST /api/v1/pleroma/accounts/:id/subscribe
     * @see POST /api/v1/pleroma/accounts/:id/unsubscribe
     */
    accountSubscriptions: true,

    /**
     * Ability to set one's website on their profile.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    accountWebsite: true,

    /**
     * Ability to manage announcements by admins.
     * @see GET /api/v1/pleroma/admin/announcements
     * @see GET /api/v1/pleroma/admin/announcements/:id
     * @see POST /api/v1/pleroma/admin/announcements
     * @see PATCH /api/v1/pleroma/admin/announcements/:id
     * @see DELETE /api/v1/pleroma/admin/announcements/:id
     * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminannouncements}
     */
    adminAnnouncements: true,

    /**
     * An additional moderator interface is available on the domain.
     * @see /pleroma/admin
     */
    adminFE: true,

    /**
     * Ability to manage instance rules by admins.
     * @see GET /api/v1/pleroma/admin/rules
     * @see POST /api/v1/pleroma/admin/rules
     * @see PATCH /api/v1/pleroma/admin/rules/:id
     * @see DELETE /api/v1/pleroma/admin/rules/:id
     */
    adminRules: true,

    /**
     * Can display announcements set by admins.
     * @see GET /api/v1/announcements
     * @see POST /api/v1/announcements/:id/dismiss
     * @see {@link https://docs.joinmastodon.org/methods/announcements/}
     */
    announcements: true,

    /**
     * Can emoji react to announcements set by admins.
     * @see PUT /api/v1/announcements/:id/reactions/:name
     * @see DELETE /api/v1/announcements/:id/reactions/:name
     * @see {@link https://docs.joinmastodon.org/methods/announcements/}
     */
    announcementsReactions: true,

    /**
     * Pleroma backups.
     * @see GET /api/v1/pleroma/backups
     * @see POST /api/v1/pleroma/backups
     */
    backups: true,

    /**
     * Set your birthday and view upcoming birthdays.
     * @see GET /api/v1/pleroma/birthdays
     * @see POST /api/v1/accounts
     * @see PATCH /api/v1/accounts/update_credentials
     */
    birthdays: true,

    /** Whether people who blocked you are visible through the API. */
    blockersVisible: true,

    /**
     * Ability to block users.
     * @see POST /api/v1/accounts/:id/block
     * @see POST /api/v1/accounts/:id/unblock
     * @see GET /api/v1/blocks
     */
    blocks: true,

    /**
     * Can bookmark statuses.
     * @see POST /api/v1/statuses/:id/bookmark
     * @see POST /api/v1/statuses/:id/unbookmark
     * @see GET /api/v1/bookmarks
     */
    bookmarks: true,

    /**
     * Accounts can be marked as bots.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    bots: true,

    /**
     * Ability to accept a chat.
     * POST /api/v1/pleroma/chats/:id/accept
     */
    chatAcceptance: false,

    /**
     * Ability to add reactions to chat messages.
     */
    chatEmojiReactions: false,

    /**
     * Pleroma chats API.
     * @see {@link https://docs.pleroma.social/backend/development/API/chats/}
     */
    chats: true,

    /**
     * Ability to delete a chat.
     * @see DELETE /api/v1/pleroma/chats/:id
     */
    chatsDelete: true,

    /**
     * Ability to set disappearing messages on chats.
     * @see PATCH /api/v1/pleroma/chats/:id
     */
    chatsExpiration: false,

    /**
     * Whether chat messages can accept a `media_id` attachment.
     * @see POST /api/v1/pleroma/chats/:id/messages
     */
    chatsMedia: true,

    /**
     * Whether chat messages have read receipts.
     * @see GET /api/v1/pleroma/chats/:id/messages
     */
    chatsReadReceipts: false,

    /**
     * Ability to search among chats.
     * @see GET /api/v1/pleroma/chats
     */
    chatsSearch: false,

    /**
     * Paginated chats API.
     * @see GET /api/v2/pleroma/chats
     */
    chatsV2: true,

    /**
     * Ability to only chat with people that follow you.
     */
    chatsWithFollowers: false,

    /**
     * Mastodon's newer solution for direct messaging.
     * @see {@link https://docs.joinmastodon.org/methods/conversations/}
     */
    conversations: true,

    /**
     * Ability to add non-standard reactions to a status.
     */
    customEmojiReacts: true,
    /**
     * Legacy DMs timeline where messages are displayed chronologically without groupings.
     * @see GET /api/v1/timelines/direct
     */
    directTimeline: true,

    /**
     * @see POST /api/friendica/statuses/:id/dislike
     * @see POST /api/friendica/statuses/:id/undislike
     * @see GET  /api/friendica/statuses/:id/disliked_by
     */
    dislikes: false,

    /**
     * Ability to block users by domain.
     * @see GET /api/v1/domain_blocks
     * @see POST /api/v1/domain_blocks
     * @see DELETE /api/v1/domain_blocks
     */
    domainBlocks: true,
    /**
     * Allow to register on a given domain
     * @see GET /api/v1/pleroma/admin/domains
     * @see POST /api/v1/pleroma/admin/domains
     * @see PATCH /api/v1/pleroma/admin/domains/:id
     * @see DELETE /api/v1/pleroma/admin/domains/:id
     */
    domains: false, //TODO check later

    /**
     * Ability to edit profile information.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    editProfile: true,

    /**
     * Ability to edit published posts.
     * @see PUT /api/v1/statuses/:id
     */
    editStatuses: true,

    /**
     * Soapbox email list.
     * @see POST /api/v1/accounts
     * @see PATCH /api/v1/accounts/update_credentials
     * @see GET /api/v1/pleroma/admin/email_list/subscribers.csv
     * @see GET /api/v1/pleroma/admin/email_list/unsubscribers.csv
     * @see GET /api/v1/pleroma/admin/email_list/combined.csv
     */
    emailList: true,

    /**
     * Ability to embed posts on external sites.
     * @see GET /api/oembed
     */
    embeds: false,

    /**
     * Ability to add emoji reactions to a status.
     * @see PUT /api/v1/pleroma/statuses/:id/reactions/:emoji
     * @see GET /api/v1/pleroma/statuses/:id/reactions/:emoji?
     * @see DELETE /api/v1/pleroma/statuses/:id/reactions/:emoji
     */
    emojiReacts:true,

    /**
     * The backend allows only non-RGI ("Recommended for General Interchange") emoji reactions.
     * @see PUT /api/v1/pleroma/statuses/:id/reactions/:emoji
     */
    emojiReactsNonRGI: true,

    /**
     * Ability to create and perform actions on events.
     * @see POST /api/v1/pleroma/events
     * @see GET /api/v1/pleroma/events/joined_events
     * @see PUT /api/v1/pleroma/events/:id
     * @see GET /api/v1/pleroma/events/:id/participations
     * @see GET /api/v1/pleroma/events/:id/participation_requests
     * @see POST /api/v1/pleroma/events/:id/participation_requests/:participant_id/authorize
     * @see POST /api/v1/pleroma/events/:id/participation_requests/:participant_id/reject
     * @see POST /api/v1/pleroma/events/:id/join
     * @see POST /api/v1/pleroma/events/:id/leave
     * @see GET /api/v1/pleroma/events/:id/ics
     * @see GET /api/v1/pleroma/search/location
     */
    events: true,

    /**
     * Ability to address recipients of a status explicitly (with `to`).
     * @see POST /api/v1/statuses
     */
    explicitAddressing: true,

    /** Whether to allow exporting follows/blocks/mutes to CSV by paginating the API. */
    exportData: true,

    /** Whether the accounts who favourited or emoji-reacted to a status can be viewed through the API. */
    exposableReactions: true,

    /**
     * Can see accounts' followers you know
     * @see GET /api/v1/accounts/familiar_followers
     */
    familiarFollowers: true,

    /** Whether the instance federates. */
    federating: false,

    /**
     * Can edit and manage timeline filters (aka "muted words").
     * @see {@link https://docs.joinmastodon.org/methods/filters/#v1}
     */
    filters: true,

    /** Whether filters can automatically expires. */
    filtersExpiration: true,

    /**
     * Can edit and manage timeline filters (aka "muted words").
     * @see {@link https://docs.joinmastodon.org/methods/filters/}
     */
    filtersV2: true,

    /**
     * Allows setting the focal point of a media attachment.
     * @see {@link https://docs.joinmastodon.org/methods/media/}
     */
    focalPoint: true,

    /**
     * Ability to follow hashtags.
     * @see POST /api/v1/tags/:name/follow
     * @see POST /api/v1/tags/:name/unfollow
     */
    followHashtags: true,

    /**
     * Ability to lock accounts and manually approve followers.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    followRequests: true,
    /**
     * Ability to list followed hashtags.
     * @see GET /api/v1/followed_tags
     */
    followedHashtagsList: true,

    /**
     * Whether client settings can be retrieved from the API.
     * @see GET /api/pleroma/frontend_configurations
     */
    frontendConfigurations: true,

    /**
     * Groups.
     * @see POST /api/v1/groups
     * @see GET /api/v1/groups
     * @see GET /api/v1/groups/:id
     * @see POST /api/v1/groups/:id/join
     * @see POST /api/v1/groups/:id/leave
     * @see GET /api/v1/groups/:id/memberships
     * @see PUT /api/v1/groups/:group_id
     * @see DELETE /api/v1/groups/:group_id
     * @see GET /api/v1/groups/:group_id/membership_requests
     * @see POST /api/v1/groups/:group_id/membership_requests/:account_id/authorize
     * @see POST /api/v1/groups/:group_id/membership_requests/:account_id/reject
     * @see DELETE /api/v1/groups/:group_id/statuses/:id
     * @see POST /api/v1/groups/:group_id/kick?account_ids[]=…
     * @see GET /api/v1/groups/:group_id/blocks
     * @see POST /api/v1/groups/:group_id/blocks?account_ids[]=…
     * @see DELETE /api/v1/groups/:group_id/blocks?account_ids[]=…
     * @see POST /api/v1/groups/:group_id/promote?role=new_role&account_ids[]=…
     * @see POST /api/v1/groups/:group_id/demote?role=new_role&account_ids[]=…
     * @see GET /api/v1/admin/groups
     * @see GET /api/v1/admin/groups/:group_id
     * @see POST /api/v1/admin/groups/:group_id/suspend
     * @see POST /api/v1/admin/groups/:group_id/unsuspend
     * @see DELETE /api/v1/admin/groups/:group_id
     */
    groups: false,

    /**
     * Cap # of Group Admins to 5
     */
    groupsAdminMax: false,

    /**
     * Can see trending/suggested Groups.
     */
    groupsDiscovery: false,

    /**
     * Can kick user from Group.
     */
    groupsKick: false,

    /**
     * Can mute a Group.
     */
    groupsMuting: false,

    /**
     * Can query pending Group requests.
    */
    groupsPending: false,

    /**
    * Can promote members to Admins.
    */
    groupsPromoteToAdmin: true,

    /**
     * Can search my own groups.
     */
    groupsSearch: false,

    /**
     * Can see topics for Groups.
     */
    groupsTags: false,

    /**
     * Can validate group names.
     */
    groupsValidation: false,

    /**
     * Can hide follows/followers lists and counts.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    hideNetwork: true,

    /**
     * Pleroma import API.
     * @see POST /api/pleroma/follow_import
     * @see POST /api/pleroma/blocks_import
     * @see POST /api/pleroma/mutes_import
     */
    import: true,

    /**
     * Pleroma import endpoints.
     * @see POST /api/pleroma/follow_import
     * @see POST /api/pleroma/blocks_import
     * @see POST /api/pleroma/mutes_import
     */
    importData: true,

    /**
     * Mastodon server information API v2.
     * @see GET /api/v2/instance
     * @see {@link https://docs.joinmastodon.org/methods/instance/#v2}
    */
    instanceV2: true,

    /**
     * Ability to set one's lightning address on their profile.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    lightning: false,

    /**
     * Can create, view, and manage lists.
     * @see {@link https://docs.joinmastodon.org/methods/lists/}
     * @see GET /api/v1/timelines/list/:list_id
     */
    lists: true,    

    /**
     * Can sign in using username instead of e-mail address.
     */
    logInWithUsername: true,

    /**
     * Can perform moderation actions with account and reports.
     * @see {@link https://docs.joinmastodon.org/methods/admin/}
     * @see GET /api/v1/admin/reports
     * @see POST /api/v1/admin/reports/:report_id/resolve
     * @see POST /api/v1/admin/reports/:report_id/reopen
     * @see POST /api/v1/admin/accounts/:account_id/action
     * @see POST /api/v1/admin/accounts/:account_id/approve
     */
    mastodonAdmin: true,

    /**
     * Can upload media attachments to statuses.
     * @see POST /api/v1/media
     * @see POST /api/v1/statuses
     */
    media: true,

    /**
     * Supports V2 media uploads.
     * @see POST /api/v2/media
     */
    mediaV2: false,
    /**
     * Ability to hide notifications from people you don't follow.
     * @see PUT /api/pleroma/notification_settings
     */
    muteStrangers: true,

    /**
     * Ability to specify how long the account mute should last.
     * @see PUT /api/v1/accounts/:id/mute
     */
    mutesDuration: true,

    /**
     * Add private notes to accounts.
     * @see POST /api/v1/accounts/:id/note
     * @see GET /api/v1/accounts/relationships
     */
    notes: true,

    /**
     * Allows specifying notification types to include, rather than to exclude.
     * @see GET /api/v1/notifications
     */
    notificationsIncludeTypes: true,

    /**
     * Supports pagination in threads.
     * @see GET /api/v1/statuses/:id/context/ancestors
     * @see GET /api/v1/statuses/:id/context/descendants
     */
    paginatedContext: false,

    /**
     * Displays a form to follow a user when logged out.
     * @see POST /main/ostatus
     */
    pleromaRemoteFollow: true,

    /**
     * Can add polls to statuses.
     * @see POST /api/v1/statuses
     */
    polls: true,

    /**
     * Can set privacy scopes on statuses.
     * @see POST /api/v1/statuses
     */
    privacyScopes: true,

    /**
     * A directory of discoverable profiles from the instance.
     * @see {@link https://docs.joinmastodon.org/methods/directory/}
     */
    profileDirectory: false,

    /**
     * Ability to set custom profile fields.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    profileFields: true,

    /**
     * Can display a timeline of all known public statuses.
     * Local and Fediverse timelines both use this feature.
     * @see GET /api/v1/timelines/public
     */
    publicTimeline: true,

    /** Ability to filter the public timeline by language. */
    publicTimelineLanguage: false,

    /**
     * Ability to quote posts in statuses.
     * @see POST /api/v1/statuses
     */
    quotePosts: true,

    /**
     * Interact with statuses from another instance while logged-out.
     * @see POST /api/v1/pleroma/remote_interaction
     */
    remoteInteractions: true,

    /**
     * Ability to remove an account from your followers.
     * @see POST /api/v1/accounts/:id/remove_from_followers
     */
    removeFromFollowers: true,

    /**
     * Ability to report chat messages.
     * @see POST /api/v1/reports
     */
    reportChats: false,

    /**
     * Ability to select more than one status when reporting.
     * @see POST /api/v1/reports
     */
    reportMultipleStatuses: true,

    /**
     * Can request a password reset email through the API.
     * @see POST /auth/password
     */
    resetPassword: true,

    /** Admin can revoke the user's identity (without deleting their account). */
    revokeName: false,

    /**
     * Ability to post statuses in Markdown, BBCode, and HTML.
     * @see POST /api/v1/statuses
     */
    richText: true,
    /**
     * Ability to follow account feeds using RSS.
     */
    rssFeeds: true,
    /**
     * Can schedule statuses to be posted at a later time.
     * @see POST /api/v1/statuses
     * @see {@link https://docs.joinmastodon.org/methods/scheduled_statuses/}
     */
    scheduledStatuses: true,

    /**
     * Ability to search statuses from the given account.
     * @see {@link https://docs.joinmastodon.org/methods/search/}
     * @see POST /api/v2/search
     */
    searchFromAccount: true,

    /**
     * Ability to manage account security settings.
     * @see POST /api/pleroma/change_password
     * @see POST /api/pleroma/change_email
     * @see POST /api/pleroma/delete_account
     */
    security: true,

    /**
     * Ability to manage account sessions.
     * @see GET /api/oauth_tokens.json
     * @see DELETE /api/oauth_tokens/:id
     */
    sessions: true,

    /**
     * Can store client settings in the database.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    settingsStore: true,

    /**
     * Can set content warnings on statuses.
     * @see POST /api/v1/statuses
     */
    spoilers: true,

    /**
     * Can view user streaks.
     * @see GET /api/v1/accounts/verify_credentials
     */
    streak: false,

    /**
     * Can display suggested accounts.
     * @see {@link https://docs.joinmastodon.org/methods/suggestions/}
     */
    suggestions: false,

    suggestionsLocal: false,

    /**
     * Supports V2 suggested accounts.
     * @see GET /api/v2/suggestions
     */
    suggestionsV2: false,

    /**
     * Can translate statuses.
     * @see POST /api/v1/statuses/:id/translate
     */
    translations: true,

    /**
     * Trending statuses.
     * @see GET /api/v1/trends/statuses
     */
    trendingStatuses: false,

    /**
     * Can display trending hashtags.
     * @see GET /api/v1/trends
     */
    trends: false,

    /**
     * Whether the backend allows adding users you don't follow to lists.
     * @see POST /api/v1/lists/:id/accounts
     */
    unrestrictedLists: true,
  };
};

export const getFeatures = () => {
  const features = getKollectiveFeatures();
  return Object.assign(features, overrides);
};
