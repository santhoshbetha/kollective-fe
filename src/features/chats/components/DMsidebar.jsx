// Inside your Sidebar.tsx or Layout.tsx
// #"Unread Badges" feature
const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  // Join the user's private notification channel
  const channel = socket.channel(`user_feed:${currentUser.id}`, {});
  channel.join();

  channel.on("unread_dm_count", (payload) => {
    setUnreadCount(payload.count);
    
    // Optional: Trigger a browser notification or sound
    if (payload.count > unreadCount) {
       new Audio('/sounds/pop.mp3').play();
    }
  });

  return () => channel.leave();
}, [currentUser.id]);

return (
  <div className="relative">
    <Mail className="h-6 w-6" />
    {unreadCount > 0 && (
      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white animate-in zoom-in">
        {unreadCount}
      </span>
    )}
  </div>
);

/*
4. Why this is the "Golden Path":

    Privacy Aware: The unread count is only sent to the user_feed:ID channel, which we secured earlier with token validation.
    Performance: Repo.aggregate(:count) on an indexed read_at column is extremely fast in PostgreSQL Ecto.Repo documentation.
    UX Context: When the user clicks into the chat, you call mark_as_read in Elixir, and then broadcast the new count (which will be lower), making the red dot disappear instantly.
*/

/*
Summary of the "Badge" Flow:

    User A sends a message to User B.
    Elixir saves it with read_at: nil.
    Elixir calculates User B's new total unread count.
    WebSocket pushes that number to User B's Sidebar.
    React shows the red dot with the number 1.
*/