/*React FE handling of Elixir BE notifications (do using google AI suggestions)

To catch those Elixir/Phoenix broadcasts in a React frontend, we’ll use the official phoenix JS library.
This setup uses Tailwind CSS for layout and Shadcn/UI for the notification "Toast" and Popover.

 1. The Phoenix Socket Hook Create a custom hook to manage the connection. This listens for the "new_notification" 
 event we defined in the Elixir broadcast_notification function.
 
*/
// hooks/useNotifications.ts
import { useEffect, useState } from "react";
import { Socket } from "phoenix";
import { useToast } from "@/components/ui/use-toast"; // Shadcn Toast

export const useNotifications = (userId, userToken) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // 1. Connect to the Elixir Socket
    const socket = new Socket("/socket", { params: { token: userToken } });
    socket.connect();

    // 2. Join the private user channel
    const channel = socket.channel(`user_feed:${userId}`, {});

    channel.join()
      .receive("ok", () => console.log("Joined notifications channel"))
      .receive("error", (resp) => console.log("Unable to join", resp));

    // 3. Listen for the broadcast from Elixir
    channel.on("new_notification", (payload) => {
      setNotifications((prev) => [payload, ...prev]);

      // Trigger Shadcn Toast
      toast({
        title: "New Interaction",
        description: `${payload.actor_name} sent you a ${payload.type}!`,
      });
    });

    //Summary of the "DELETE" chain:
    //User clicks Delete → Controller calls Posts.delete_post → Transaction starts → SQL decrements 
    // the original post counter → SQL deletes the post record → Websocket tells all connected 
    // clients to hide that post ID.

    // In ActivityPub, "Tombstones" are used to tell other servers a post is gone. In your app,
    // a simple Broadcast + SQL Delete is enough to make the post vanish globally in milliseconds.
    channel.on("delete_post", (payload) => {
        setPosts((prev) => prev.filter(post => post.id !== payload.id));
    });

    channel.on("delete_activity_notifications", (payload) => {
        // Instantly remove any notification tied to that deleted post
        setNotifications((prev) => 
            prev.filter(n => n.activity_id !== payload.activity_id)
        );
    });

    //# "Starting Now" notification feature
    channel.on("new_notification", (n) => {
        if (n.type === "event_starting_now") {
            toast({
            title: "Event Starting! 🚀",
            description: `${n.data.event_name} is happening now (${n.data.local_time}).`,
            variant: "default",
            });
        }
    });

    // Pre-Event Summary" to the organizer
    // In your useNotifications hook, add a special UI case for the organizer. This is a great place to use 
    // a Shadcn Action Button to let them jump straight to the request management dashboard.
    channel.on("new_notification", (n) => {
        if (n.type === "organizer_summary") {
            toast({
            title: "Event Update 📊",
            description: n.data.message,
            action: (
                <Button variant="outline" onClick={() => navigate(`/events/${n.activity_id}/manage`)}>
                Review Requests
                </Button>
            ),
            });
        }
    });

    // Mentions in event comments feature
    channel.on("new_notification", (n) => {
        if (n.type === "event_comment_mention") {
            toast({
            title: "New Mention! 💬",
            description: n.data.message,
            action: (
                <Button variant="outline" onClick={() => navigate(`/events/${n.activity_id}`)}>
                View Chat
                </Button>
            ),
            });
        }
    });

    //broadcast_if_voice notification

    //const socket = new Socket("/socket", { params: { token: window.userToken } });
    //socket.connect();

    const channel2 = socket.channel("voice_alerts", {});

    channel2.join()
    .receive("ok", () => console.log("Listening for Voice alerts"))
    .receive("error", resp => { console.log("Unable to join", resp) });

    channel2.on("new_voice_alert", (post) => {
        // logic to show a Toast or Modal
        if (post.urgency_level >= 4) {
            showEmergencyModal(post); 
        } else {
            toast.info(`Urgent Voice: ${post.content}`);
        }
    });

    //# POST reaction broadcast
    const channel3 = socket.channel(`post_details:${post.id}`, {});

    channel3.on("reaction_updated", (payload) => {
        // 1. Update the counts in your state
        setPost({ ...post, emoji_reactions: payload.reactions });
        
        // 2. Optional: Trigger a "bounce" animation on the specific emoji
        if (payload.emoji === "🔥") {
            playFireAnimation();
        }
    });

    // Vote Broadcast
    channel.on("vote_updated", (payload) => {
    // 1. Update the local component state
    setPost(prev => ({
        ...prev,
        upvotes_count: payload.upvotes,
        downvotes_count: payload.downvotes,
        score: payload.score
    }));

    // 2. Visual feedback: Trigger a CSS class for a "green" or "red" flash
    triggerScoreFlash(payload.score > post.score ? "up" : "down");
    });

    // #"Like Notification"
    /*
    3. Why this is the "Golden Path"

    Contextual Redirection: By setting the activity_id to the Event ID, the user is taken back to the chat where the like happened, boosting engagement.
    Content Preview: Including a String.slice of the comment in the data map helps the user remember which "tip" was liked before they even click.
    Real-time Performance: Because Phoenix.PubSub handles the broadcast, the author receives the "Ping" in under 50ms.
    */
    /*
    Summary of the Flow:

    User A likes a comment in the "Hackathon" event.
    Elixir updates the likes_count in Postgres.
    Elixir inserts a comment_like notification for User B.
    User B's browser receives the WebSocket message.
    React shows: "Someone liked your tip: Check out the..."
    Pro-Tip: If you want to prevent notification spam, you can add a check to see if a notification for this specific comment_id was already sent in the last hour.
    */
    channel.on("new_notification", (n) => {
        if (n.type === "comment_like") {
            toast({
                title: "New Like! ❤️",
                description: n.data.message,
                action: (
                    <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/events/${n.activity_id}`)}
                    >
                    View
                    </Button>
                ),
            })
        }
    });

    // Mention Extraction notification:
    // Sidebar.js or NotificationIcon.js
    // layout or navigation bar in React should listen to this personal channel.
    /*
    Why this is a "Standalone" Winner:

    Engagement: Mentions are the #1 way to bring users back into your app.
    Metadata Storage: By saving the mentions list directly in the posts.mentions JSONB column, your React app can highlight @usernames in the text without re-parsing the string every time.
    Clean Flow: Using Ecto.Multi ensures that if a post fails to save, we don't accidentally send out ghost notifications.
    */
    const userChannel = socket.channel(`user_notifications:${currentUser.id}`, {});
        userChannel.join();

        userChannel.on("new_notification", (notif) => {
        // Update the 'unread count' in your Redux/Context state
        setUnreadCount(prev => prev + 1);
        
        // Play a subtle sound or show a toast
        toast.info(`You were mentioned in a post!`);
    });


    /*
    Threading & Engagement :
    When a user receives a reply notification via the user_notifications:ID channel, you can show a specific message
    */
    userChannel.on("new_notification", (notif) => {
        if (notif.type === "reply") {
            toast.success(`Someone replied to your post!`, {
            onClick: () => navigate(`/posts/${notif.post_id}`)
            });
        }
    });

    /*
        notification listener will now pick up the mention type automatically
    */
   userChannel.on("new_notification", (notif) => {
        if (notif.type === "mention") {
            // Show a specific mention UI/Toast
            toast.info(`@${notif.actor_username} mentioned you in a post!`, {
            icon: "📣",
            onClick: () => goToPost(notif.post_id)
            });
        }
    });

    //"Neighbors" count update in real-time when people leave or join, add a listener for presence_diff
    channel.on("presence_diff", diff => {
        // Use the Phoenix Presence JS helper to sync the state
        setNeighbors(Presence.syncDiff(neighbors, diff));
    });

    //# Automated notifications (e.g., via WebSockets) so the author knows their post was approved
    /*
    Summary of Benefits

    Reduced API Polling: The frontend doesn't need to keep asking "Is it approved yet?".
    Better UX: The "Pending Review" banner disappears the moment the Admin clicks approve.
    Scalability: Phoenix handles millions of these connections with minimal overhead.
    */
    let channel = socket.channel(`user:${userId}`, {})
        channel.join()

        channel.on("post_approved", payload => {
        console.log(`Post ${payload.post_id} is now public!`);
        // Update local state to remove "Pending" badge
    })


    // event Cancellation
    userChannel.on("new_notification", (notif) => {
    if (notif.type === "event_cancelled") {
        toast.error(`Event Cancelled: "${notif.data.event_title}" has been removed by moderators for safety.`, {
        duration: 10000, // Keep it visible longer
        icon: "🚫"
        });
    }
    });


    return () => {
      channel.leave();
      socket.disconnect();
    };
  }, [userId, userToken]);

  return { notifications };
};


/*
// Mentions in event comments feature:
Why this is the "Golden Path" for Standalone:

    Zero Latency: By processing mentions inside the handle_in block, the mentioned user receives the alert at the exact same millisecond the comment appears in the chat.
    Database Efficiency: You are reusing the same notifications table we optimized with PostgreSQL Indexes.
    Consistency: A mention in a comment looks and behaves exactly like a mention in a main timeline post, creating a unified user experience.

Summary of the Flow:

    User A types @alice check this out! in an event chat.
    Phoenix Channel receives the message, runs the regex, and identifies Alice.
    Elixir inserts a notification for Alice.
    Alice sees the red badge/toast instantly via her own Phoenix.Presence or Feed channel.
*/



