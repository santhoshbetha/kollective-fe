import DOMPurify from "isomorphic-dompurify";
import z from "zod";

const avatarMissing = "";
const headerMissing = "";

import { customEmojiSchema } from "./custom-emoji.js";
import { groupRelationshipSchema } from "./group-relationship.js";
import { groupTagSchema } from "./group-tag.js";
import { filteredArray } from "./utils.js";

const groupSchema = z
  .object({
    avatar: z.string().catch(avatarMissing),
    avatar_static: z.string().catch(""),
    created_at: z.string().datetime().catch(new Date().toUTCString()),
    deleted_at: z.string().datetime().or(z.null()).catch(null),
    display_name: z.string().catch(""),
    domain: z.string().catch(""),
    emojis: filteredArray(customEmojiSchema),
    group_visibility: z.string().catch(""),
    header: z.string().catch(headerMissing),
    header_static: z.string().catch(""),
    id: z.coerce.string(),
    locked: z.boolean().catch(false),
    membership_required: z.boolean().catch(false),
    members_count: z.number().catch(0),
    owner: z.object({ id: z.string() }),
    note: z
      .string()
      .transform((note) => (note === "<p></p>" ? "" : note))
      .catch(""),
    relationship: groupRelationshipSchema.nullable().catch(null),
    slug: z.string().catch(""),
    source: z.object({ note: z.string() }).optional(),
    statuses_visibility: z.string().catch("public"),
    tags: z.array(groupTagSchema).catch([]),
    uri: z.string().catch(""),
    url: z.string().catch(""),
  })
  .transform((group) => {
    group.avatar_static = group.avatar_static || group.avatar;
    group.header_static = group.header_static || group.header;
    group.locked = group.locked || group.group_visibility === "members_only";

    return {
      ...group,
      note: DOMPurify.sanitize(group.note, { USE_PROFILES: { html: true } }),
    };
  });

export { groupSchema };
