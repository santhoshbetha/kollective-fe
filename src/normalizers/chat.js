export const ChatRecord = {
  account: null,
  id: "",
  unread: 0,
  last_message: "",
  updated_at: "",
};

export const normalizeChat = (chat) => {
  // Defensive: accept null/undefined and non-object inputs
  if (!chat || typeof chat !== "object") {
    try {
      return Object.freeze({ ...ChatRecord });
    } catch {
      return { ...ChatRecord };
    }
  }

  // Normalize common field names and copy account object shallowly
  const account =
    chat.account && typeof chat.account === "object"
      ? { ...chat.account }
      : (chat.account ?? null);

  const out = {
    account,
    id: chat.id ?? chat._id ?? ChatRecord.id,
    unread:
      typeof chat.unread === "number"
        ? chat.unread
        : chat.unread
          ? Number(chat.unread)
          : ChatRecord.unread,
    last_message:
      chat.last_message ?? chat.lastMessage ?? ChatRecord.last_message,
    updated_at: chat.updated_at ?? chat.updatedAt ?? ChatRecord.updated_at,
  };

  try {
    return Object.freeze(out);
  } catch {
    return out;
  }
};
