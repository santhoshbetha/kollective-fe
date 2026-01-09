// Fallback emoji data stub.
// The project previously imported large JSON from `@emoji-mart/data` which
// isn't installed in this environment and caused the build to fail. Provide
// a small, safe stub so the app can build. Replace with the real dataset
// or install `@emoji-mart/data` when available.
import data from '@emoji-mart/data/sets/15/twitter.json';

const emojiData = data;
const { categories, emojis, aliases, sheet } = emojiData;

export { categories, emojis, aliases, sheet };

export default emojiData;
