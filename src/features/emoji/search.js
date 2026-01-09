// @ts-ignore
import Index from '@akryum/flexsearch-es';
import { buildCustomEmojis } from './index.js';

// @ts-ignore Wrong default export.
const index = new Index({
  tokenize: 'full',
  optimize: true,
  context: true,
});

let data = {
  aliases: {},
  categories: [],
  emojis: {},
  sheet: { cols: 0, rows: 0 },
};

import('./data.js').then((mod) => {
  data = mod.default;

  const sortedEmojis = Object.entries(data.emojis).sort((a, b) => a[0].localeCompare(b[0]));
  for (const [key, emoji] of sortedEmojis) {
    index.add('n' + key, `${emoji.id} ${emoji.name} ${emoji.keywords.join(' ')}`);
  }
}).catch(console.warn);

export function addCustomToPool(customEmojis) {
  for (const key in index.register) {
    if (key[0] === 'c') {
      index.remove(key); // remove old custom emojis
    }
  }

  let i = 0;

  for (const emoji of customEmojis) {
    index.add('c' + i++, emoji.id);
  }
}

// we can share an index by prefixing custom emojis with 'c' and native with 'n'
const search = (
  str, { maxResults = 5 } = {},
  customEmojis,
) => {
  return index.search(str, maxResults)
    .flatMap((id) => {
      if (typeof id !== 'string') return;

      if (id[0] === 'c' && customEmojis) {
        const index = Number(id.slice(1));
        const custom = customEmojis[index];

        if (custom) {
          return {
            id: custom.shortcode,
            colons: ':' + custom.shortcode + ':',
            custom: true,
            imageUrl: custom.url,
          };
        }
      }

      const skins = data.emojis[id.slice(1)]?.skins;

      if (skins) {
        return {
          id: id.slice(1),
          colons: ':' + id.slice(1) + ':',
          unified: skins[0].unified,
          native: skins[0].native,
        };
      }
    }).filter(Boolean);
};

/** Import Mastodon custom emojis as emoji mart custom emojis. */
export function autosuggestPopulate(emojis) {
  addCustomToPool(buildCustomEmojis(emojis));
}

export default search;
