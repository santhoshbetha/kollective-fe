/**
 * Group normalizer:
 * Converts API groups into our internal format.
 */
import avatarMissing from "./../assets/images/avatar-missing.png";
import headerMissing from "./../assets/images/header-missing.png";
import { normalizeEmoji } from "./emoji";

// Plain-JS group normalizer — accepts Immutable-like or plain inputs
import { asPlain } from "../utils/immutableSafe";

const getDomainFromURL = (g) => {
  try {
    const url = g.url;
    return new URL(url).host;
  } catch {
    return "";
  }
};

export const guessFqn = (group) => {
  const acct = group && group.acct ? String(group.acct) : "";
  const [user, domain] = acct.split("@");
  if (domain) return acct;
  return [user, getDomainFromURL(group)].join("@");
};

const normalizeHistoryEntry = (h) => (h == null ? null : asPlain(h));

export const normalizeGroup = (groupInput) => {
  if (!groupInput) return null;
  const g = asPlain(groupInput) || {};

  const emojis = Array.isArray(g.emojis)
    ? g.emojis.map(normalizeEmoji).filter(Boolean)
    : [];

  const avatar = g.avatar || g.avatar_static || avatarMissing;
  const avatar_static = g.avatar_static || g.avatar || avatarMissing;

  const header = g.header || g.header_static || headerMissing;
  const header_static = g.header_static || g.header || headerMissing;

  const display_name =
    (g.display_name ?? "").trim().length === 0
      ? (g.username ?? "")
      : g.display_name;

  const fqn = g.fqn || guessFqn(g);

  const locked = !!(g.locked || g.group_visibility === "members_only");

  const note = g.note === "<p></p>" ? "" : (g.note ?? "");

  let history = null;
  if (Array.isArray(g.history))
    history = g.history.map(normalizeHistoryEntry).filter(Boolean);
  else if (g.history)
    history = [normalizeHistoryEntry(g.history)].filter(Boolean);

  const out = {
    avatar,
    avatar_static,
    created_at: g.created_at ?? "",
    deleted_at: g.deleted_at ?? null,
    display_name: display_name ?? "",
    domain: g.domain ?? getDomainFromURL(g),
    emojis,
    group_visibility: g.group_visibility ?? "",
    header,
    header_static,
    id: g.id ?? "",
    locked,
    membership_required: !!g.membership_required,
    members_count: Number(g.members_count || 0),
    owner: g.owner ? asPlain(g.owner) : (g.owner ?? { id: "" }),
    note,
    statuses_visibility: g.statuses_visibility ?? "public",
    slug: g.slug ?? "",
    tags: Array.isArray(g.tags) ? g.tags.slice() : g.tags ? [g.tags] : [],
    uri: g.uri ?? "",
    url: g.url ?? "",
    history,
    relationship: g.relationship ?? null,
    fqn,
  };

  try {
    return Object.freeze(out);
  } catch {
    return out;
  }
};
