const NOTIFICATION_TYPES = [
  "follow",
  "follow_request",
  "mention",
  "reblog",
  "favourite",
  "group_favourite",
  "group_reblog",
  "poll",
  "status",
  "move",
  "pleroma:chat_mention",
  "pleroma:emoji_reaction",
  "user_approved",
  "update",
  "pleroma:event_reminder",
  "pleroma:participation_request",
  "pleroma:participation_accepted",
  "ditto:name_grant",
  "ditto:zap",
];

/** Notification types to exclude from the "All" filter by default. */
const EXCLUDE_TYPES = [
  "pleroma:chat_mention",
  "chat", // TruthSocial
];

/** Ensure the Notification is a valid, known type. */
const validType = (type) => NOTIFICATION_TYPES.includes(type);

/** Given an active filter (string or array), return the list of types to
 * exclude for servers that expect `exclude_types` instead of `types`.
 */
const excludeTypesFromFilter = (activeFilter) => {
  if (!activeFilter) return EXCLUDE_TYPES;
  const selected = Array.isArray(activeFilter) ? activeFilter : [activeFilter];
  return NOTIFICATION_TYPES.filter((t) => !selected.includes(t));
};

export { NOTIFICATION_TYPES, EXCLUDE_TYPES, validType, excludeTypesFromFilter };
