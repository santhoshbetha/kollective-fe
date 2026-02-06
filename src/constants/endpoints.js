/**
 * Centralized API endpoints for the Soapbox feature set.
 * These are used by the useTimeline and useStatusActions hooks.
 */

export const API_ENDPOINTS = {
  // Timelines
  HOME_TIMELINE: '/api/v1/timelines/home',
  PUBLIC_TIMELINE: '/api/v1/timelines/public',
  TAG_TIMELINE: (tag) => `/api/v1/timelines/tag/${tag}`,

  // Discovery & Search
  EXPLORE_STATUSES: '/api/v1/trending/statuses',
  EXPLORE_ACCOUNTS: '/api/v1/trending/accounts',
  EXPLORE_TAGS: '/api/v1/trending/tags',
  SEARCH: '/api/v2/search',

  // Personal / Account
  NOTIFICATIONS: '/api/v1/notifications',
  BOOKMARKS: '/api/v1/bookmarks',
  FAVOURITES: '/api/v1/favourites',
  SCHEDULED_STATUSES: '/api/v1/scheduled_statuses',

  CONVERSATIONS: '/api/v1/conversations', // Direct Messages
  FOLLOW_REQUESTS: '/api/v1/follow_requests', // <--- Added

  // Relationship Management
  MUTES: '/api/v1/mutes',
  BLOCKS: '/api/v1/blocks',

  // Groups (Rebased/Soapbox Specific)
  GROUPS: '/api/v1/groups',
  GROUP_STATUSES: (id) => `/api/v1/groups/${id}/statuses`,
  GROUP_MEMBERS: (id) => `/api/v1/groups/${id}/members`,

  // Events
  EVENTS: '/api/v1/events',
  EVENT_STATUSES: (id) => `/api/v1/events/${id}/statuses`,
};
