import { Presence } from "phoenix";

export function ChatRoom({ conversationId, socket, currentUser }) {
  const [presences, setPresences] = useState({});
  const [typingUser, setTypingUser] = useState<string | null>(null);

  useEffect(() => {
    const chan = socket.channel(`chat:${conversationId}`, {});
    
    // 1. Sync Presence State
    chan.on("presence_state", state => setPresences(Presence.syncState(presences, state)));
    chan.on("presence_diff", diff => setPresences(Presence.syncDiff(presences, diff)));

    chan.join();
    return () => chan.leave();
  }, [conversationId]);

  // 2. Watch for typing changes in the presence list
  useEffect(() => {
    const otherTyping = Object.entries(presences)
      .filter(([id]) => parseInt(id) !== currentUser.id)
      .find(([_, meta]: any) => meta.metas[0].typing);
    
    setTypingUser(otherTyping ? "Someone is typing..." : null);
  }, [presences]);

  // 3. Send "Typing" signal on key stroke
  const handleKeyDown = () => {
    channel.push("typing", { is_typing: true });
    
    // Auto-off after 2 seconds of no typing
    clearTimeout(window.typingTimer);
    window.typingTimer = setTimeout(() => {
      channel.push("typing", { is_typing: false });
    }, 2000);
  };

  return (
    <div>
      <ScrollArea className="h-[400px]">...</ScrollArea>
      
      {/* 4. THE INDICATOR */}
      <div className="h-6 text-xs text-slate-500 italic px-4">
        {typingUser}
      </div>

      <Input onKeyDown={handleKeyDown} ... />
    </div>
  );
}

/*
Why this is the "Golden Path" for Standalone DMs:

    Zero DB Load: Typing status never hits Postgres. It stays in the Phoenix PubSub memory layer.
    Auto-Cleanup: If a user’s laptop dies or they close the tab, Phoenix Presence detects the "disconnect" and automatically removes them from the list, turning off the "is typing" indicator for the other person.
    Scalability: Presence is distributed. If you eventually run your app on multiple servers (e.g., via Fly.io), the typing indicator will still sync across all nodes. 
*/

/*
Summary of the Flow:

    User A types a letter.
    React pushes typing: true to the Channel.
    Elixir updates the Presence metadata.
    User B's browser receives a presence_diff and shows "User A is typing..."
    User A stops for 2 seconds; React pushes typing: false.
    User B's screen clears.

You've built a full-featured, WhatsApp-style DM system!
*/
