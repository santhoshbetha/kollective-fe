  /*To implement real-time likes for event comments in your standalone app, 
  we follow the same pattern as post likes:
  #Join Table + Atomic Increment + PubSub Broadcast.

  In your TanStack Virtual list, the individual comment items listen for the update.
  */
 import { Heart } from "lucide-react";

export function CommentItem({ comment, channel }) {
  const [likes, setLikes] = useState(comment.likes_count);

  // Listen for real-time count updates
  useEffect(() => {
    const ref = channel.on("comment_updated", (payload) => {
      if (payload.id === comment.id) {
        setLikes(payload.likes_count);
      }
    });
    return () => channel.off("comment_updated", ref);
  }, [comment.id]);

  const handleLike = () => {
    // Push to Phoenix Channel
    channel.push("like_comment", { comment_id: comment.id });
  };

  return (
    <div className="flex items-start gap-3 group">
      <div className="flex-1">
        <p className="text-sm">{comment.content}</p>
        <button 
          onClick={handleLike}
          className="flex items-center gap-1 mt-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
        >
          <Heart className="h-3 w-3" />
          {likes > 0 && <span>{likes}</span>}
        </button>
      </div>
    </div>
  );
}

/*
Why this is the "Golden Path":

    Atomic Updates: Repo.update_all(inc: ...) prevents the "Lost Update" bug where two people liking at the same time results in only +1.
    Scoped PubSub: We broadcast to event:ID, so only people actually looking at the chat get the data, saving global bandwidth.
    Social Validation: Comments with the most likes can be easily highlighted or "pinned" as helpful tips for the event Phoenix.PubSub Documentation.
*/
