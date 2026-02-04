import { useEmojis } from '../api/useEmojis';
import { useEmojiMap } from '../hooks/useEmojiMap';
import { useRecentEmojiStore } from '../store/useRecentEmojiStore';

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
      {/* 1. Show Recent Section First */}
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

      {/* 2. Show Standard Categories */}
      {Object.entries(categories).map(([name, /*emojis*/]) => (
        <section key={name}>
          <h5>{name}</h5>
          {/* ... existing emoji rendering ... */}
        </section>
      ))}
    </div>
  );
};

export default EmojiPicker;