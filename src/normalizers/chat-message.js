import { normalizeAttachment } from "./attachment";
import { emojiReactionSchema } from "../schemas/emoji-reaction";
import { filteredArray } from "../schemas/utils.js";

export const ChatMessageRecord = {
  account_id: "",
  media_attachments: [],
  card: null,
  chat_id: "",
  content: "",
  created_at: "",
  emojis: [],
  expiration: null,
  emoji_reactions: null,
  id: "",
  unread: false,
  deleting: false,
  pending: false,
};

import { asPlain } from "../utils/immutableSafe";

/** Normalize media attachments: accept `media_attachments` array or single `attachment`. */
const buildMediaAttachments = (src) => {
  const attachments =
    src.media_attachments ?? (src.attachment ? [src.attachment] : []);
  const arr = Array.isArray(attachments) ? attachments : [];
  return arr.map((a) => normalizeAttachment(asPlain(a) || a));
};

/** Normalize emoji reactions using the provided schema; returns null on parse failure. */
const buildEmojiReactions = (src) => {
  const raw = src.emoji_reactions;
  const plain = asPlain(raw);
  if (!plain) return null;
  const arr = Array.isArray(plain) ? plain.map(asPlain) : [];
  try {
    return filteredArray(emojiReactionSchema).parse(arr);
  } catch {
    return null;
  }
};

/** Rewrite `<p></p>` to empty string. */
const fixContent = (content) => (content === "<p></p>" ? "" : content);

export const normalizeChatMessage = (chatMessage) => {
  const src = asPlain(chatMessage) || {};

  const media_attachments = buildMediaAttachments(src);
  const emoji_reactions = buildEmojiReactions(src);
  const content = fixContent(src.content ?? "");

  const normalized = {
    ...ChatMessageRecord,
    ...src,
    media_attachments,
    emoji_reactions,
    content,
    created_at: src.created_at ?? "",
    emojis: Array.isArray(src.emojis)
      ? src.emojis.map(asPlain)
      : (src.emojis ?? []),
  };

  return Object.freeze(normalized);
};
