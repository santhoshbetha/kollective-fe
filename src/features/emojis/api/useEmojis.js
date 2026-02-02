import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

//Create src/features/emojis/api/useEmojis.js. This replaces the fetchEmojis thunk and the entire emojiSlice state.
export const useEmojis = () => {
  return useQuery({
    queryKey: ['emojis', 'custom'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/custom_emojis');
      return data; // Returns Array of { shortcode, url, category, etc. }
    },
    // Emojis rarely change; cache them for a long time
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    // Categorize them using 'select' for the Emoji Picker UI
    select: (data) => {
      return data.reduce((acc, emoji) => {
        const category = emoji.category || 'Custom';
        if (!acc[category]) acc[category] = [];
        acc[category].push(emoji);
        return acc;
      }, {});
    },
  });
};
/*
const EmojiPicker = ({ onSelect }) => {
  const { data: categories, isLoading } = useEmojis();

  if (isLoading) return <Spinner />;

  return (
    <div className="emoji-picker-scroll">
      {Object.entries(categories).map(([name, emojis]) => (
        <div key={name} className="category-section">
          <h5>{name}</h5>
          <div className="grid">
            {emojis.map(emoji => (
              <img 
                key={emoji.shortcode}
                src={emoji.url} 
                onClick={() => onSelect(emoji)}
                title={emoji.shortcode}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

*/
//=============================================================================================
// / "Emoji Search" inside this picker

// src/features/emojis/api/useEmojis.js
export const useSearchableEmojis = (searchTerm = '') => {
  return useQuery({
    queryKey: ['emojis', 'custom', searchTerm],
    queryFn: () => api.get('/api/v1/custom_emojis').then(res => res.data),
    staleTime: 1000 * 60 * 60, // 1 hour
    select: (emojis) => {
      // 1. If no search term, return grouped categories (existing logic)
      if (!searchTerm) {
        return emojis.reduce((acc, emoji) => {
          const category = emoji.category || 'Custom';
          if (!acc[category]) acc[category] = [];
          acc[category].push(emoji);
          return acc;
        }, {});
      }

      // 2. If searching, return a flat filtered list for easy grid display
      const lowerTerm = searchTerm.toLowerCase();
      return emojis.filter(emoji => 
        emoji.shortcode.toLowerCase().includes(lowerTerm)
      );
    },
  });
};
/*
const EmojiPicker = () => {
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
          /* Render search results (flat list) *//*
          <div className="grid">
            {results.map(emoji => <EmojiItem key={emoji.id} emoji={emoji} />)}
          </div>
        ) : (
          /* Render categories (grouped object) *//*
          Object.entries(results).map(([cat, list]) => (
            <EmojiCategory key={cat} name={cat} list={list} />
          ))
        )}
      </div>
    </div>
  );
};

*/
