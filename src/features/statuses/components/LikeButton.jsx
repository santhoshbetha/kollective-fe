// src/features/statuses/components/LikeButton.jsx
// Quick Reactions
//This component replaces the standard Like button logic. It uses a setTimeout to detect the long-press.
const LikeButton = ({ status }) => {
  const { show, hide, activeStatusId, isVisible } = useQuickReactionStore();
  const { mutate: toggleLike } = useToggleFavourite();
  const timerRef = useRef(null);

  const handleStart = () => {
    timerRef.current = setTimeout(() => {
      show(status.id);
    }, 500); // 500ms threshold for long-press
  };

  const handleEnd = () => {
    clearTimeout(timerRef.current);
  };

  const handleClick = () => {
    if (!isVisible) {
      toggleLike({ id: status.id, isLiked: status.favourited });
    }
  };

  return (
    <div className="relative">
      <button
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        onClick={handleClick}
        className={status.favourited ? 'text-red-500' : ''}
      >
        {status.favourited ? <HeartFull /> : <HeartEmpty />}
      </button>

      {/* Floating Bar: Only visible on long-press */}
      {isVisible && activeStatusId === status.id && (
        <QuickReactionLoader onSelect={hide} status={status} />
      )}
    </div>
  );
};
/*
The Quick-Reaction Bar
This renders the top 5 emojis. Selecting one triggers the Exclusive Reaction mutation (removing the "Like" and adding the emoji).

const QuickReactionLoader = ({ status, onSelect }) => {
  const { mutate: react } = useExclusiveReaction(status);
  // Pull top 5 from our 'useRecentEmojiStore'
  const { recentShortcodes } = useRecentEmojiStore(); 
  const emojiMap = useEmojiMap();

  const handleQuickReact = (code) => {
    react({ emoji: code });
    onSelect();
  };

  return (
    <div className="absolute -top-12 left-0 flex bg-white shadow-xl rounded-full p-2 gap-2 animate-bounce-in">
      {recentShortcodes.slice(0, 5).map(code => (
        <button key={code} onClick={() => handleQuickReact(code)}>
          <img src={emojiMap[`:${code}:`]} className="w-6 h-6 hover:scale-125 transition" />
        </button>
      ))}
    </div>
  );
};

*/
