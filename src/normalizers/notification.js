// https://docs.joinmastodon.org/entities/notification/
export const NotificationRecord = {
  account: null,
  chat_message: null, // kollective:chat_mention
  created_at: new Date(),
  emoji: null, // kollective:emoji_reaction
  emoji_url: null, // kollective:emoji_reaction
  id: "",
  name: "", // ditto:name_grant
  amount: 0, // ditto:zap
  message: "", // ditto:zap
  status: null,
  target: null, // move
  type: "",
  total_count: null, // grouped notifications
};

import { asPlain } from "../utils/immutableSafe";

export const normalizeNotification = (notification) => {
  const raw = asPlain(notification) || {};

  const typeRaw = raw.type || raw.kind || "";
  const type = typeRaw === "group_mention" ? "mention" : typeRaw;

  const normalized = {
    ...NotificationRecord,
    id: raw.id != null ? String(raw.id) : NotificationRecord.id,
    type,
    account: raw.account || raw.actor || NotificationRecord.account,
    chat_message:
      raw.chat_message || raw.chatMessage || NotificationRecord.chat_message,
    created_at:
      raw.created_at || raw.createdAt || NotificationRecord.created_at,
    emoji: raw.emoji || NotificationRecord.emoji,
    emoji_url: raw.emoji_url || raw.emojiUrl || NotificationRecord.emoji_url,
    name: raw.name || NotificationRecord.name,
    amount: raw.amount != null ? Number(raw.amount) : NotificationRecord.amount,
    message: raw.message || NotificationRecord.message,
    status: raw.status || NotificationRecord.status,
    target: raw.target || NotificationRecord.target,
    total_count:
      raw.total_count != null
        ? raw.total_count
        : raw.totalCount != null
          ? raw.totalCount
          : NotificationRecord.total_count,
  };

  return Object.freeze(normalized);
};

export default normalizeNotification;

