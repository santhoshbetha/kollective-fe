import { Link } from 'react-router-dom';

/** Simple formatter for numbers like 1.2k */
const formatCount = (num) => {
  return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num;
};

const InteractionCounter = ({ count, label, to, onClick }) => {
  if (!count || count <= 0) return null;

  const content = (
    <div className="flex gap-1 items-center text-sm group">
      <span className="font-bold text-gray-900 dark:text-gray-100">{formatCount(count)}</span>
      <span className="text-gray-500 group-hover:underline">{label}</span>
    </div>
  );

  if (to) return <Link to={to}>{content}</Link>;
  
  return (
    <button onClick={onClick} className="focus:outline-none">
      {content}
    </button>
  );
};

const StatusInteractionBar = ({ status }) => {
  if (!status?.account) return null;

  // In a standalone app, you can replace these with simple alerts or your own Modal trigger
  const handleOpenList = (type) => {
    console.log(`Opening list for ${type} on status ${status.id}`);
  };

  return (
    <div className="flex gap-4 items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
      <InteractionCounter 
        count={status.reblogs_count} 
        label="Reposts" 
        onClick={() => handleOpenList('reblogs')} 
      />
      
      <InteractionCounter 
        count={status.quotes_count} 
        label="Quotes" 
        to={`/@${status.account.acct}/posts/${status.id}/quotes`} 
      />

      <InteractionCounter 
        count={status.favourites_count} 
        label="Likes" 
        onClick={() => handleOpenList('favourites')} 
      />

      {status.dislikes_count > 0 && (
        <InteractionCounter 
          count={status.dislikes_count} 
          label="Dislikes" 
          onClick={() => handleOpenList('dislikes')} 
        />
      )}
    </div>
  );
};

export default StatusInteractionBar;

/*
Removed Modal Boilerplate: Stripped out the 5+ separate modal handlers. In a standalone app, 
you usually have one ListModal that takes a type and an id.
Removed react-intl: Pluralization logic (Repost vs Reposts) is handled by the simplicity of the label 
or can be added back with a simple ternary if needed.
Removed Zap/Nostr Logic: Zaps are specific to decentralized protocols. Standard apps usually stick to 
Likes/Reposts.
Flexbox over HStack: Replaced the custom HStack with standard Tailwind Flex classes.
Direct Data Access: Swapped .getIn() (Immutable.js) for standard Optional Chaining (status?.account),
which is faster in modern JS.
*/

/*
To keep these counters accurate without heavy COUNT(*) queries every time a feed loads, you should use Counter Columns in your posts table.

Use PostgreSQL Triggers to increment/decrement reblogs_count or favourites_count whenever a row is added to a likes or reposts table.
*/

/*
To keep your
PostgreSQL interaction counts (likes, reposts, etc.) accurate without running heavy COUNT(*) queries every time a feed loads, you 
should use counter columns in your posts table updated by triggers.

1. Database Schema Update
First, ensure your posts table has the necessary columns to store these counts.

ALTER TABLE posts 
ADD COLUMN favourites_count INT DEFAULT 0,
ADD COLUMN reblogs_count INT DEFAULT 0;

2. The Trigger Function
Create a single function that handles both incrementing (on new interaction) and 
decrementing (on removal). This logic uses the TG_OP variable to detect the action.

CREATE OR REPLACE FUNCTION update_post_interactions()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- When a new like/repost is added
        UPDATE posts 
        SET favourites_count = favourites_count + 1 
        WHERE id = NEW.status_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        -- When a like/repost is removed
        UPDATE posts 
        SET favourites_count = GREATEST(0, favourites_count - 1) 
        WHERE id = OLD.status_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

Note: Use GREATEST(0, ...) to prevent negative counts in case of data inconsistencies.

3. Attach Triggers to Tables
Apply this function to your interaction tables (e.g., favourites).
You would create a similar trigger for your reblogs table.

CREATE TRIGGER trg_update_fav_count
AFTER INSERT OR DELETE ON favourites
FOR EACH ROW
EXECUTE FUNCTION update_post_interactions();

hy this is essential for your app:

    Performance: A SELECT favourites_count is instantaneous, whereas COUNT(*) on a table with millions of rows requires a full index or 
    heap scan because of PostgreSQL's MVCC architecture.
    Scalability: This moves the "work" to the moment of interaction rather than the moment of viewing. 
    Since users view feeds much more often than they click "Like," this is a massive net win for your database efficiency.
*/


/*
Pro-Tip: The "Favourited" Boolean
In your React StatusInteractionBar, you need to know if the current user has liked the post. 
In Elixir, you can calculate this efficiently during your main Feed Query using a left_join:

def list_posts(current_user_id) do
  from p in Post,
    left_join: f in Favourite, on: f.status_id == p.id and f.user_id == ^current_user_id,
    select_merge: %{favourited: not is_nil(f.id)}
end

This prevents you from having to do a separate 
"Did I like this?" check for every single post in the user's timeline.

*/
