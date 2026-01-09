/*
 * TODO: Consolate emoji object types
 *
 * There are five different emoji objects currently
 *  - emoji-mart's "onPickEmoji" handler
 *  - emoji-mart's custom emoji types
 *  - an Emoji type that is either NativeEmoji or CustomEmoji
 *  - a type inside redux's `store.custom_emoji` immutablejs
 *
 * there needs to be one type for the picker handler callback
 * and one type for the emoji-mart data
 * and one type that is used everywhere that the above two are converted into
 */

export function isCustomEmoji(emoji) {
  return emoji.imageUrl !== undefined;
}

export function isNativeEmoji(emoji) {
  return emoji.native !== undefined;
}

export const parseHTML = (str) => {
  const tokens = [];
  let buf = '';
  let stack = '';
  let open = false;

  for (const c of str) {
    if (c === '<') {
      if (open) {
        tokens.push({ text: true, data: stack });
        stack = '<';
      } else {
        tokens.push({ text: true, data: buf });
        stack = '<';
        open = true;
      }
    } else if (c === '>') {
      if (open) {
        open = false;
        tokens.push({ text: false, data: stack + '>' });
        stack = '';
        buf = '';
      } else {
        buf += '>';
      }

    } else {
      if (open) {
        stack += c;
      } else {
        buf += c;
      }
    }
  }

  if (open) {
    tokens.push({ text: true, data: buf + stack });
  } else if (buf !== '') {
    tokens.push({ text: true, data: buf });
  }

  return tokens;
};

export function buildCustomEmojis(customEmojis) {
  const emojis = [];

  customEmojis.forEach((emoji) => {
    const shortcode = emoji.shortcode;
    const url = emoji.url;
    const name = shortcode.replace(':', '');

    emojis.push({
      id: name,
      name,
      keywords: [name],
      skins: [{ src: url }],
    });
  });

  return emojis;
}
