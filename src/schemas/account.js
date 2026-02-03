import DOMPurify from "isomorphic-dompurify";
import z from "zod";

const avatarMissing = "";
const headerMissing = "";

import { customEmojiSchema } from "./custom-emoji.js";
import { coerceObject, contentSchema, filteredArray } from "./utils.js";

const birthdaySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const hexSchema = z.string().regex(/^#[a-f0-9]{6}$/i);

const fieldSchema = z.object({
  name: z.string(),
  value: z.string(),
  verified_at: z.string().datetime().nullable().catch(null),
});

const roleSchema = z.object({
  id: z.string().catch(""),
  name: z.string().catch(""),
  color: hexSchema.catch(""),
  highlighted: z.boolean().catch(true),
});

const baseAccountSchema = z.object({
  acct: z.string().catch(""),
  avatar: z.string().catch(avatarMissing),
  avatar_static: z.string().url().optional().catch(undefined),
  bot: z.boolean().catch(false),
  created_at: z.string().datetime().catch(() => new Date().toISOString()),
  discoverable: z.boolean().catch(false),
  display_name: z.string().catch(""),
  domain: z.string().optional().catch(undefined),
  emojis: filteredArray(customEmojiSchema),
  fields: filteredArray(fieldSchema),
  followers_count: z.number().catch(0),
  following_count: z.number().catch(0),
  fqn: z.string().optional().catch(undefined),
  header: z.string().url().catch(headerMissing),
  header_static: z.string().url().optional().catch(undefined),
  id: z.string(),
  last_status_at: z.string().datetime().optional().catch(undefined),
  local: z.boolean().catch(false),
  location: z.string().optional().catch(undefined),
  locked: z.boolean().catch(false),
  moved: z.literal(null).catch(null),
  mute_expires_at: z.union([z.string(), z.null()]).catch(null),
  note: contentSchema,
  other_settings: z
    .object({
      birthday: birthdaySchema.nullish().catch(undefined),
      location: z.string().optional().catch(undefined),
    })
    .optional()
    .catch(undefined),
  kollective: coerceObject({
    accepts_chat_messages: z.boolean().catch(false),
    accepts_email_list: z.boolean().catch(false),
    also_known_as: z.array(z.string().url()).catch([]),
    ap_id: z.string().url().optional().catch(undefined),
    birthday: birthdaySchema.nullish().catch(undefined),
    deactivated: z.boolean().catch(false),
    favicon: z.string().url().optional().catch(undefined),
    hide_favorites: z.boolean().catch(false),
    hide_followers: z.boolean().catch(false),
    hide_followers_count: z.boolean().catch(false),
    hide_follows: z.boolean().catch(false),
    hide_follows_count: z.boolean().catch(false),
    is_admin: z.boolean().catch(false),
    is_local: z.boolean().optional().catch(undefined),
    is_moderator: z.boolean().catch(false),
    is_suggested: z.boolean().catch(false),
    location: z.string().optional().catch(undefined),
    notification_settings: coerceObject({
      block_from_strangers: z.boolean().catch(false),
    }),
    tags: z.array(z.string()).catch([]),
  }),
  roles: filteredArray(roleSchema),
  source: z
    .object({
      approved: z.boolean().catch(true),
      chats_onboarded: z.boolean().catch(true),
      fields: filteredArray(fieldSchema),
      note: z.string().catch(""),
      kollective: z.object({
          discoverable: z.boolean().catch(true),
        })
        .optional()
        .catch(undefined),
      sms_verified: z.boolean().catch(false),
    })
    .optional()
    .catch(undefined),
  statuses_count: z.number().catch(0),
  suspended: z.boolean().catch(false),
  uri: z.string().url().catch(""),
  url: z.string().url(),
  username: z.string().catch(""),
  verified: z.boolean().catch(false),
  website: z.string().catch(""),
});

const getDomain = (url) => {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
};

const filterBadges = (tags) =>
  tags
    ?.filter((tag) => tag.startsWith("badge:"))
    .map((tag) =>
      roleSchema.parse({ id: tag, name: tag.replace(/^badge:/, "") }),
    );

// 2. Fix the Transform Function
const transformAccount = (data) => {
  // Destructure 'kollective' (the actual key) and others
  const { kollective, other_settings, ...account } = data;

  const displayName = account.display_name.trim().length === 0
      ? account.username
      : account.display_name;
      
  const domain = account.domain ?? getDomain(account.url || account.uri);

  // 3. Create a safe version of kollective without mutating the original
  const safeKollective = kollective ? {
    ...kollective,
    birthday: kollective.birthday || other_settings?.birthday
  } : undefined;

  return {
    ...account,
    kollective: safeKollective, // Use the updated object
    admin: safeKollective?.is_admin || false,
    avatar_static: account.avatar_static || account.avatar,
    // Fix: Reference 'safeKollective' instead of 'kollective:'
    discoverable: account.discoverable || account.source?.kollective?.discoverable || false,
    display_name: displayName,
    domain,
    fqn: account.fqn || (account.acct.includes("@") ? account.acct : `${account.acct}@${domain}`),
    header_static: account.header_static || account.header,
    moderator: safeKollective?.is_moderator || false,
    local: safeKollective?.is_local !== undefined 
        ? safeKollective.is_local 
        : !account.acct.includes("@"),
    location: account.location || safeKollective?.location || other_settings?.location || "",
    note: DOMPurify.sanitize(account.note, { USE_PROFILES: { html: true } }),
    roles: account.roles.length ? account.roles : filterBadges(safeKollective?.tags),
    staff: safeKollective?.is_admin || safeKollective?.is_moderator || false,
    suspended: account.suspended || safeKollective?.deactivated || false,
    verified: account.verified || safeKollective?.tags?.includes("verified") || false,
  };
};

const accountSchema = baseAccountSchema
  .extend({
    moved: baseAccountSchema.transform(transformAccount).nullable().catch(null),
  })
  .transform(transformAccount);

export { accountSchema };

