// src/features/posts/components/ReactionPicker.jsx
import { useEmojis } from '@/features/emojis/api/useEmojis';
import { useRecentEmojiStore } from '@/features/emojis/store/useRecentEmojiStore';
import { useExclusiveReaction } from '../api/usePostActions';
import { useReactionPickerStore } from '../store/useReactionPickerStore';

//Reaction Picker
// /This component uses your Custom Emojis from TanStack and the Recently Used list from Zustand. It uses the useExclusiveReaction mutation we just built.
const ReactionPicker = () => {
  const { isOpen, anchorPost, closePicker } = useReactionPickerStore();
  const { data: categories } = useEmojis();
  const { recentShortcodes, addRecent } = useRecentEmojiStore();
  const { mutate: react } = useExclusiveReaction(anchorPost);

  if (!isOpen || !anchorPost) return null;

  const handleSelect = (emoji) => {
    // 1. Trigger the exclusive reaction (unreacts others + reacts new)
    react({ emoji: emoji.shortcode });
    // 2. Update recent emojis list
    addRecent(emoji.shortcode);
    // 3. UI feedback
    closePicker();
  };

  return (
    <div className="reaction-picker-overlay" onClick={closePicker}>
      <div className="reaction-menu" onClick={e => e.stopPropagation()}>
        {/* Quick-select recent emojis */}
        <div className="recent-section">
          {recentShortcodes.map(code => (
            <button key={code} onClick={() => handleSelect({ shortcode: code })}>
              {`:${code}:`}
            </button>
          ))}
        </div>
        
        {/* Full Emoji List */}
        <div className="emoji-grid">
           {/* Map your categories here... */}
        </div>
      </div>
    </div>
  );
};

export default ReactionPicker;

/*
const ReactionTrigger = ({ post }) => {
  const openPicker = useReactionPickerStore(s => s.openPicker);

  return (
    <button 
      className="btn-action" 
      onClick={(e) => openPicker(post, e.currentTarget)}
    >
      <EmojiIcon />
    </button>
  );
};
*/
