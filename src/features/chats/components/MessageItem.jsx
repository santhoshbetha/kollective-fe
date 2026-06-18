

/*
Read Receipts:
4. Why this is the "Golden Path" for Standalone:

    Minimal Database Noise: Instead of updating every message individually, Repo.update_all performs a single SQL command, which is massively more efficient.
    Real-time Feedback: The messages_read broadcast tells the sender's browser to flip the status from "Sent" to "Read" instantly via the Phoenix Channel.
    Contextual Logic: By marking messages read on join, the user never has to "manually" clear notifications—it just happens naturally as they navigate.

Summary of the Flow:

    User A sends a message.
    User B opens the chat window.
    Elixir sets read_at for User A's message.
    WebSocket tells User A: "User B just read everything up to 5:00 PM."
    React updates User A's screen to show the blue double-check.

*/
export function MessageItem({ message, isMe, lastReadAt }) {
  // A message is read if its own read_at exists OR 
  // if the recipient's "last_read_at" timestamp is later than this message
  const isRead = !!message.read_at || (lastReadAt && new Date(message.inserted_at) <= new Date(lastReadAt));

  return (
    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
      <div className={`p-3 rounded-2xl ${isMe ? "bg-blue-600 text-white" : "bg-slate-100"}`}>
        {message.content}
      </div>
      
      {isMe && (
        <span className="text-[10px] mt-1 text-muted-foreground uppercase font-bold tracking-wider">
          {isRead ? (
            <span className="text-blue-500 flex items-center gap-1">
              Read <CheckCheck className="h-3 w-3" />
            </span>
          ) : (
            "Sent"
          )}
        </span>
      )}
    </div>
  );
}
