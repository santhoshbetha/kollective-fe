// EventComments.tsx
/*
4. React Frontend: Handling Threads
In your TanStack Virtual list, you can indent replies or group them.
 A simple way to handle this in a standalone app is to filter the flat list of comments.
*/

const renderComment = (comment) => {
  const isReply = !!comment.parent_id;

  return (
    <div className={cn("flex gap-3 mb-4", isReply && "ml-10 border-l-2 pl-4")}>
      <Avatar>...</Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">{comment.user.username}</span>
          {isReply && <Badge variant="outline" className="text-[10px]">Reply</Badge>}
        </div>
        
        {/* Our Moderated Image Component from before */}
        {comment.image_url && <ModeratedImage comment={comment} />}
        
        <p className="text-sm">{comment.content}</p>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setReplyingTo(comment.id)}
          className="h-6 text-xs text-muted-foreground"
        >
          Reply
        </Button>
      </div>
    </div>
  );
};

/*
Why this is the "Golden Path":

    Moderation Everywhere: Every reply goes through the same Oban Moderation Worker we built, keeping the sub-threads safe.
    Scalability: By keeping the list "flat" in the database but using parent_id for UI indentation, your TanStack Virtualizer remains extremely fast.
    UX: The pending status in CommentJSON allows you to show a "Scanning..." state on the reply immediately after the user hits send.


*/

/*
Summary of the Flow:

    User clicks "Reply" on a photo.
    React sends parent_id + content over the WebSocket.
    Elixir saves the comment and triggers Oban to scan any images.
    React receives the new comment and indents it under the parent.
*/
