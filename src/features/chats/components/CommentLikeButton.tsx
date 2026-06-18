import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils"; // Shadcn utility
import { Button } from "@/components/ui/button";

/*
React code to show a "Heart" icon that changes color based on 
whether the currentUser has already liked the comment
*/

/*
To implement the "Heart" toggle with a real-time color change, we need to track if the
currentUser exists in the comment_likes join table.
*/

/*
1. The React Component (CommentLikeButton.tsx)
This component uses Optimistic UI: it turns red the moment you click, then syncs 
with the Phoenix Channel broadcast to ensure the final count is correct for everyone.

2. in event_channel.ex
*/

export function CommentLikeButton({ comment, currentUser, channel }) {
  // 1. Initial state from the comment data
  const [likesCount, setLikesCount] = useState(comment.likes_count || 0);
  const [isLiked, setIsLiked] = useState(comment.is_liked_by_me || false);

  useEffect(() => {
    // 2. Listen for real-time updates from other users
    const ref = channel.on("comment_updated", (payload: any) => {
      if (payload.id === comment.id) {
        setLikesCount(payload.likes_count);
      }
    });

    return () => channel.off("comment_updated", ref);
  }, [comment.id, channel]);

  const toggleLike = () => {
    // 3. Optimistic UI Update
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount((prev) => (newLikedState ? prev + 1 : prev - 1));

    // 4. Push to Phoenix Channel
    // We reuse the 'like_comment' logic we built for the backend
    channel.push("like_comment", { comment_id: comment.id });
  };

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleLike}
        className={cn(
          "h-8 w-8 rounded-full transition-all duration-300 hover:bg-red-50",
          isLiked ? "text-red-500 hover:text-red-600" : "text-slate-400 hover:text-slate-600"
        )}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-transform duration-300",
            isLiked ? "fill-current scale-110" : "fill-none scale-100"
          )}
        />
      </Button>
      
      <span className={cn(
        "text-xs font-medium transition-colors",
        isLiked ? "text-red-600" : "text-slate-500"
      )}>
        {likesCount > 0 ? likesCount : ""}
      </span>
    </div>
  );
}

/*
3. Why this is the "Golden Path":

    fill-current: Using this Tailwind class allows the heart to "fill up" with color only when liked, which is the standard social media behavior (Instagram/X style).
    scale-110: A slight pop animation makes the interaction feel tactile and responsive.
    Optimistic Logic: If the user clicks "Like," the heart turns red instantly. If the server fails (rare), the channel.on listener will eventually reset the count to the correct DB value.
    Tree-shaking: Using Lucide React ensures that only the Heart icon is bundled, keeping your Vite build small. 
*/

/*
Summary of the "Heart" Flow:

    User clicks the Heart.
    React instantly fills it with red and increments the number.
    Phoenix Channel receives the like_comment event.
    Postgres updates the likes_count atomically.
    PubSub broadcasts the new total to everyone else on the page.
*/