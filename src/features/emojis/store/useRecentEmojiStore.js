import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useRecentEmojiStore = create()(
  persist(
    (set) => ({
      recentShortcodes: [],

      // Add a used emoji to the top of the list
      addRecent: (shortcode) => set((state) => {
        const filtered = state.recentShortcodes.filter(s => s !== shortcode);
        return {
          recentShortcodes: [shortcode, ...filtered].slice(0, 20) // Keep only 20
        };
      }),
    }),
    { name: 'kollective-recent-emojis' } // Persists in localStorage
  )
);

/*
const EmojiPicker = ({ onSelect }) => {
  const { data: categories } = useEmojis();
  const { recentShortcodes, addRecent } = useRecentEmojiStore();
  const emojiMap = useEmojiMap(); // The lookup hook we built

  const handleSelect = (emoji) => {
    addRecent(emoji.shortcode);
    onSelect(emoji);
  };

  return (
    <div className="emoji-picker">
      {/* 1. Show Recent Section First *//*}
      {recentShortcodes.length > 0 && (
        <section>
          <h5>Recently Used</h5>
          <div className="grid">
            {recentShortcodes.map(code => (
              <img 
                key={code} 
                src={emojiMap[`:${code}:`]} 
                onClick={() => handleSelect({ shortcode: code, url: emojiMap[`:${code}:`] })}
              />
            ))}
          </div>
        </section>
      )}

      {/* 2. Show Standard Categories *//*}
      {Object.entries(categories).map(([name, emojis]) => (
        <section key={name}>
          <h5>{name}</h5>
          {/* ... existing emoji rendering ... *//*}
        </section>
      ))}
    </div>
  );
};

*/
