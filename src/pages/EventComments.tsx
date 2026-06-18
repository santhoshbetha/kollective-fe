//"Event Comments" (continution fronm elixir BE)

/*
In a standalone app,
Event Comments transform a simple invitation into an interactive sub-community. Since you 
are not federating, you can skip ActivityPub objects and use a high-performance Internal
Feed powered by Phoenix Channels.

Why this is the "Golden Path":

    Performance: channel.push is faster than a standard POST request because the WebSocket connection is already open.
    Encapsulation: The comments only exist within the context of the event topic (event:ID), so users on other event pages aren't burdened by the data.
    UX: The animate-in Tailwind class makes new comments "pop" into the feed smoothly, mimicking a high-end social app.
*/


import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function EventComments({ eventId, socket }) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [channel, setChannel] = useState<any>(null);
  const [error, setError] = useState(null);

  //"Event Comments"
  useEffect(() => {
    // 1. Initialize the channel with the specific topic
    const channel = socket.channel(`event:${eventId}`, {});

    // 2. THE JOIN METHOD GOES HERE
    channel.join()
      .receive("ok", ({ comments }) => {
        // This is where you receive the initial 20-30 comments from Elixir
        setComments(comments);
      })
      .receive("error", (resp) => {
        // This catches the "This is a private event" error from your Elixir code
        setError(resp.reason);
      });

    // 3. Listen for new comments in real-time
    channel.on("new_comment", (payload) => {
      setComments((prev) => [...prev, payload]);
    });

    // 4. CLEANUP: Leave the channel when the component unmounts
    return () => {
      channel.leave();
    };
  }, [eventId, socket]); // Re-run if the eventId changes

  useEffect(() => {
    const chan = socket.channel(`event:${eventId}`, {});
    chan.join().receive("ok", ({ comments }) => setComments(comments));

    // Listen for new comments from other users
    chan.on("new_comment", (comment) => {
      setComments((prev) => [...prev, comment]);
    });

    setChannel(chan);
    return () => chan.leave();
  }, [eventId]);



  const handleSubmit = () => {
    if (!newComment.trim()) return;
    channel.push("post_comment", { content: newComment });
    setNewComment("");
  };

   if (error) return <div className="text-red-500 p-4 border rounded">{error}</div>;

  return (
    <div className="flex flex-col h-[500px] border rounded-lg bg-slate-50/50">
      <ScrollArea className="flex-1 p-4">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3 mb-6 animate-in fade-in slide-in-from-bottom-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={c.user?.avatar_url} />
              <AvatarFallback>{c.username?.[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{c.username}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(c.inserted_at).toLocaleTimeString()}</span>
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-none border shadow-sm text-sm">
                {c.content}
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
      
      <div className="p-4 bg-white border-t flex gap-2">
        <Textarea 
          placeholder="Write an update or ask a question..." 
          value={newComment} 
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[40px] resize-none border-none shadow-none focus-visible:ring-0"
        />
        <Button size="icon" onClick={handleSubmit} disabled={!newComment.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}


/*
Why this is the "Golden Path":

    Automatic Reconnection: If the user’s internet drops and comes back, phoenix.js will automatically re-run the join() logic for you.
    Memory Management: The return () => channel.leave() is crucial. Without it, the browser keeps a "ghost" connection open every time the user clicks a different event, eventually crashing the app.
    Scoped Error Handling: By putting it here, you can show a "Private Event" error message right inside the comment box while still letting the user see the event title and map.

Summary of the Flow:

    User opens /events/123.
    React mounts EventComments, triggering useEffect.
    Socket sends a "Join" request to Elixir.
    Elixir runs the merged join/3 security check.
    Elixir returns {:ok, %{comments: [...]}}.
    React receives the ok, sets the state, and the user sees the chat history instantly.

*/

//Commnet Load more feature (check later to merge with above)
export function EventComments({ eventId, socket }) {
  const [comments, setComments] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = () => {
    // Get the ID of the very first (oldest) comment in our current list
    const oldestId = comments[0]?.id;
    if (!oldestId) return;

    channel.push("load_more", { last_id: oldestId })
      .receive("ok", ({ comments: olderComments }) => {
        if (olderComments.length < 30) setHasMore(false);
        
        // PREPEND older comments to the top of the list
        setComments((prev) => [...olderComments, ...prev]);
      });
  };

  return (
    <ScrollArea className="h-[500px]">
      {hasMore && (
        <Button onClick={loadMore} variant="ghost" className="w-full text-xs">
          Load older messages...
        </Button>
      )}
      {comments.map(c => <CommentItem key={c.id} data={c} />)}
    </ScrollArea>
  );
}

/*
Why this is the "Golden Path":

    Performance: where c.id < ^last_id uses the primary key index, making it nearly instant regardless of how many millions of comments you have.
    Consistency: If 10 new comments are posted while you are reading, your "Load More" query still knows exactly where it left off based on the ID.
    Smooth UX: Prepending the data while maintaining the scroll position (using a library like react-virtuoso or manual scroll adjustment) makes the app feel professional. 
*/

/* Conflick Check
useEffect(() => {
  const channel = socket.channel(`event:${eventId}`, {});

  channel.join()
    .receive("ok", ({ comments }) => {
      // This is the data from our Elixir merge!
      setComments(comments);
      scrollToBottom();
    })
    .receive("error", (resp) => {
      // Shows "This is a private event."
      toast({ variant: "destructive", title: "Access Denied", description: resp.reason });
    });

  return () => channel.leave();
}, [eventId]);


*/

//Delete Comment Feature
// 1. Inside your useEffect
channel.on("comment_deleted", (payload) => {
  setComments((prev) => prev.filter((c) => c.id !== payload.id));
});

// 2. Inside your CommentItem component
const canDelete = currentUser.id === comment.user_id || currentUser.id === eventCreatorId;

return (
  <div className="group relative flex gap-3 p-2 hover:bg-slate-100 rounded-lg transition-colors">
    <Avatar className="h-8 w-8">...</Avatar>
    <div className="flex-1">
      <p className="text-sm font-bold">{comment.username}</p>
      <div className="text-sm">{comment.content}</div>
    </div>
    
    {canDelete && (
      <Button 
        variant="ghost" 
        size="icon" 
        className="opacity-0 group-hover:opacity-100 h-6 w-6 text-red-500"
        onClick={() => channel.push("delete_comment", { comment_id: comment.id })}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    )}
  </div>
);
/*
Why this is the "Golden Path":

    Security: Even if a user "hacks" their CSS to show the delete button, the Elixir Backend re-verifies ownership before the SQL DELETE runs.
    Real-time Moderation: If an organizer deletes a spam comment, it disappears from every attendee's screen in milliseconds without them needing to refresh.
    Visual Feedback: The group-hover:opacity-100 Tailwind class keeps the UI clean, only showing moderation tools when the mouse is over the comment.
*/
