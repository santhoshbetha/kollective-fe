/**
 * Status edit normalizer
 */
import DOMPurify from "isomorphic-dompurify";

import { normalizeAttachment } from "./attachment";
import { normalizeEmoji } from "./emoji";
import { pollSchema } from "../schemas/poll";
import { stripCompatibilityFeatures } from "../utils/html";

export const StatusEditRecord = {
  account: null,
  content: "",
  created_at: new Date(),
  emojis: [],
  favourited: false,
  media_attachments: [],
  poll: null,
  sensitive: false,
  spoiler_text: "",
};
// Helper to accept Immutable-like inputs (objects with `toJS`) or plain JS
import { asPlain } from "../utils/immutableSafe";

export const normalizeStatusEdit = (input) => {
  const src = asPlain(input) || {};

  const media_attachments = (src.media_attachments || []).map((a) => {
    const pa = asPlain(a) || a;
    return normalizeAttachment(pa);
  });

  const emojis = (src.emojis || []).map((e) => {
    const pe = asPlain(e) || e;
    return normalizeEmoji(pe);
  });

  let poll = null;
  try {
    if (src.poll) {
      const p = asPlain(src.poll) || src.poll;
      poll = pollSchema.parse(p);
    }
  } catch {
    poll = null;
  }

  const content = DOMPurify.sanitize(
    stripCompatibilityFeatures(src.content || ""),
    { ADD_ATTR: ["target"] },
  );

  const normalized = {
    ...StatusEditRecord,
    ...src,
    content,
    media_attachments,
    emojis,
    poll,
    created_at: src.created_at ? new Date(src.created_at) : new Date(),
    favourited: !!src.favourited,
    sensitive: !!src.sensitive,
    spoiler_text: src.spoiler_text || "",
    account: asPlain(src.account) || src.account,
  };

  return Object.freeze(normalized);
};
