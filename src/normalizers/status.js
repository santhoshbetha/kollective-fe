import { normalizeAttachment } from "./attachment.js";
// note: emoji reactions are parsed via schema, individual emoji normalizer not needed here
import { normalizeMention } from "./mention.js";
import {
  accountSchema,
  cardSchema,
  emojiReactionSchema,
  groupSchema,
  pollSchema,
  tombstoneSchema,
} from "../schemas/index";
import { filteredArray } from "../schemas/utils";

import { asPlain } from "../utils/immutableSafe";

export const EventRecord = {
  name: "",
  start_time: null,
  end_time: null,
  join_mode: null,
  participants_count: 0,
  location: null,
  join_state: null,
  banner: null,
  links: [],
};

export const StatusRecord = {
  account: null,
  application: null,
  approval_status: "approved",
  bookmarked: false,
  card: null,
  content: "",
  created_at: "",
  dislikes_count: 0,
  disliked: false,
  edited_at: null,
  emojis: [],
  favourited: false,
  favourites_count: 0,
  filtered: [],
  group: null,
  in_reply_to_account_id: null,
  in_reply_to_id: null,
  id: "",
  language: null,
  media_attachments: [],
  mentions: [],
  muted: false,
  pinned: false,
  pleroma: null,
  ditto: null,
  poll: null,
  quote: null,
  quotes_count: 0,
  reactions: null,
  reblog: null,
  reblogged: false,
  reblogs_count: 0,
  replies_count: 0,
  zaps_amount: 0,
  sensitive: false,
  spoiler_text: "",
  tags: [],
  tombstone: null,
  uri: "",
  url: "",
  visibility: "public",
  zapped: false,
  event: null,

  expectsCard: false,
  hidden: false,
  search_index: "",
  showFiltered: true,
  translation: null,
};

const normAttachments = (src) => {
  const arr = Array.isArray(src) ? src : src ? asPlain(src) : [];
  return arr.map((a) => normalizeAttachment(asPlain(a))).filter(Boolean);
};

const normMentions = (src) => {
  const arr = Array.isArray(src) ? src : src ? asPlain(src) : [];
  return arr.map((m) => normalizeMention(asPlain(m))).filter(Boolean);
};

const normPoll = (poll) => {
  const p = asPlain(poll);
  if (!p) return null;
  try {
    return pollSchema.parse(p);
  } catch (e) {
    void e;
    return null;
  }
};

const normTombstone = (t) => {
  const v = asPlain(t);
  if (!v) return null;
  try {
    return tombstoneSchema.parse(v);
  } catch (e) {
    void e;
    return null;
  }
};

const normCard = (c) => {
  const v = asPlain(c);
  if (!v) return null;
  try {
    return cardSchema.parse(v);
  } catch (e) {
    void e;
    return null;
  }
};

const fixMentionsOrder = (mentions, inReplyToAccountId) => {
  if (!Array.isArray(mentions)) return mentions;
  if (!inReplyToAccountId) return mentions;
  const idx = mentions.findIndex(
    (m) =>
      m &&
      (m.id === inReplyToAccountId ||
        (m.id && String(m.id) === String(inReplyToAccountId))),
  );
  if (idx > 0) {
    const copy = mentions.slice();
    const [m] = copy.splice(idx, 1);
    copy.unshift(m);
    return copy;
  }
  return mentions;
};

const addSelfMention = (mentions, account, inReplyToAccountId) => {
  const acct = asPlain(account) || {};
  const accountId = acct.id;
  if (!accountId) return mentions;
  const isSelfReply = String(accountId) === String(inReplyToAccountId);
  const hasSelfMention =
    Array.isArray(mentions) &&
    mentions.length > 0 &&
    String(mentions[0].id) === String(accountId);
  if (isSelfReply && !hasSelfMention) {
    const mention = normalizeMention(acct);
    return [mention].concat(Array.isArray(mentions) ? mentions : []);
  }
  return mentions;
};

const fixQuote = (status, pleroma) => {
  const p = asPlain(pleroma) || {};
  const quote = status.quote || p.quote || null;
  const quotes_count = status.quotes_count || p.quotes_count || 0;
  return { ...status, quote, quotes_count };
};

const fixSensitivity = (status) => {
  if (status && status.spoiler_text) return { ...status, sensitive: true };
  return status;
};

const normalizeEvent = (status) => {
  const p = asPlain(status.pleroma) || {};
  if (!p.event) return { status, event: null };

  const media = Array.isArray(status.media_attachments)
    ? status.media_attachments.slice()
    : Array.isArray(p.media_attachments)
      ? p.media_attachments.slice()
      : [];
  let banner = null;

  if (media.length > 0) {
    const first = media[0];
    if (first && first.description === "Banner" && first.type === "image") {
      banner = normalizeAttachment(asPlain(first));
      media.shift();
    }
  }

  const links = media.filter(
    (att) => att && att.pleroma && att.pleroma.mime_type === "text/html",
  );
  const mediaAttachments = media.filter(
    (att) => !(att && att.pleroma && att.pleroma.mime_type === "text/html"),
  );

  const event = { ...EventRecord, ...(asPlain(p.event) || {}), banner, links };

  return { status: { ...status, media_attachments: mediaAttachments }, event };
};

const normalizeEmojis = (status) => {
  const src =
    (status && status.pleroma && status.pleroma.emoji_reactions) ||
    status.reactions ||
    [];
  const arr = Array.isArray(src) ? src : asPlain(src) || [];
  try {
    const reactions = filteredArray(emojiReactionSchema).parse(asPlain(arr));
    return Array.isArray(reactions) ? reactions : [];
  } catch (e) {
    void e;
    return [];
  }
};

const fixContent = (status) => {
  if (status && status.content === "<p></p>") return { ...status, content: "" };
  return status;
};

const normalizeFilterResults = (filtered) => {
  const arr = Array.isArray(filtered)
    ? filtered
    : filtered
      ? asPlain(filtered)
      : [];
  return arr
    .map((fr) => (fr && fr.filter ? fr.filter.title : undefined))
    .filter(Boolean);
};

const normalizeDislikes = (status) => {
  if (status && status.friendica) {
    return {
      ...status,
      dislikes_count: status.friendica.dislikes_count || 0,
      disliked: !!status.friendica.disliked,
    };
  }
  return status;
};

const parseAccount = (account) => {
  const a = asPlain(account);
  if (!a) return null;
  try {
    return accountSchema.parse(a);
  } catch (e) {
    void e;
    return null;
  }
};

const parseGroup = (group) => {
  const g = asPlain(group);
  if (!g) return null;
  try {
    return groupSchema.parse(g);
  } catch (e) {
    void e;
    return null;
  }
};

export const normalizeStatus = (input) => {
  const src = asPlain(input) || {};

  const base = { ...StatusRecord, ...(src || {}) };

  // attachments
  const media_attachments = normAttachments(
    src.media_attachments || base.media_attachments,
  );

  // mentions
  let mentions = normMentions(src.mentions || base.mentions);
  mentions = fixMentionsOrder(
    mentions,
    src.in_reply_to_account_id || base.in_reply_to_account_id,
  );
  mentions = addSelfMention(
    mentions,
    src.account || base.account,
    src.in_reply_to_account_id || base.in_reply_to_account_id,
  );

  // emojis / reactions

  // poll, card, tombstone
  const poll = normPoll(src.poll || base.poll);
  const card = normCard(src.card || base.card);
  const tombstone = normTombstone(src.tombstone || base.tombstone);

  // event
  const ev = normalizeEvent({ ...base, ...src, media_attachments });

  // emojis/reactions normalized
  const reactions = normalizeEmojis({ ...base, ...src });

  // content fix
  let out = {
    ...base,
    ...src,
    media_attachments,
    mentions,
    emojis: reactions.length ? reactions : src.emojis || base.emojis,
  };

  out = fixQuote(out, src.pleroma || base.pleroma);
  out = fixSensitivity(out);
  out = fixContent(out);
  out.filtered = normalizeFilterResults(src.filtered || base.filtered);
  out = normalizeDislikes(out);
  out.tombstone = tombstone;
  out.poll = poll;
  out.card = card;
  out.account = parseAccount(src.account || base.account);
  out.group = parseGroup(src.group || base.group);
  out.event = ev.event || out.event;

  // Ensure arrays/defaults are plain
  out.media_attachments = Array.isArray(out.media_attachments)
    ? out.media_attachments
    : [];
  out.mentions = Array.isArray(out.mentions) ? out.mentions : [];
  out.tags = Array.isArray(out.tags) ? out.tags : [];

  return Object.freeze(out);
};

export default normalizeStatus;
