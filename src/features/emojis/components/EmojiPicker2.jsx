import { useState } from "react";
import { useSearchableEmojis } from "../api/useEmojis";

const EmojiPicker2 = () => {
  const [query, setQuery] = useState('');
  const { data: results, isLoading } = useSearchableEmojis(query);

  return (
    <div className="emoji-picker">
      <input 
        type="text" 
        placeholder="Search emojis..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)} 
      />

      <div className="emoji-list">
        {isLoading ? (
          <Spinner />
        ) : query ? (
          /* Render search results (flat list) */
          <div className="grid">
            {results.map(emoji => <EmojiItem key={emoji.id} emoji={emoji} />)}
          </div>
        ) : (
          /* Render categories (grouped object) */
          Object.entries(results).map(([cat, list]) => (
            <EmojiCategory key={cat} name={cat} list={list} />
          ))
        )}
      </div>
    </div>
  );
};

export default EmojiPicker2;