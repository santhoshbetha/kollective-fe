// https://docs.joinmastodon.org/entities/emoji/
export const EmojiRecord = {
  category: "",
  shortcode: "",
  static_url: "",
  url: "",
  visible_in_picker: true,
};

import { asPlain } from "../utils/immutableSafe";

export const normalizeEmoji = (emojiInput) => {
  if (!emojiInput) return null;
  const e = asPlain(emojiInput) || {};

  const category = e.category ?? e.cat ?? "";
  const shortcode = e.shortcode ?? e.name ?? "";
  const static_url = e.static_url ?? e.staticUrl ?? e.url ?? "";
  const url = e.url ?? e.url_static ?? static_url ?? "";
  const visible_in_picker = e.visible_in_picker ?? e.visibleInPicker ?? true;

  const out = {
    category: String(category || ""),
    shortcode: String(shortcode || ""),
    static_url: String(static_url || ""),
    url: String(url || ""),
    visible_in_picker: !!visible_in_picker,
  };

  try {
    return Object.freeze(out);
  } catch {
    return out;
  }
};
