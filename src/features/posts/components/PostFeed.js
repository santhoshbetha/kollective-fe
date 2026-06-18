/*
Live Feed
3. React Frontend: The "Show New Posts" Logic
We don't want to just inject posts at the top while the user
 is reading (it makes the screen jump). Instead, we store "Incoming" posts in a separate buffer and show a button.
*/
// PostFeed.js
import React, { useState, useEffect } from 'react';
import { Socket } from "phoenix";

const PostFeed = ({ currentUser }) => {
  const [posts, setPosts] = useState([]); // Currently visible posts
  const [newPostBuffer, setNewPostBuffer] = useState([]); // Hidden "waiting" posts

  useEffect(() => {
    const socket = new Socket("/socket", { params: { token: window.userToken } });
    socket.connect();

    const channel = socket.channel("feed:public", {});
    channel.join();

    // Listen for new posts coming from Elixir
    channel.on("new_post_available", (payload) => {
      // Don't add to main list yet, put it in the buffer
      setNewPostBuffer(prev => [payload.post, ...prev]);
    });

    return () => channel.leave();
  }, []);

  const showNewPosts = () => {
    // Move everything from buffer to the top of the main feed
    setPosts(prev => [...newPostBuffer, ...prev]);
    setNewPostBuffer([]); // Clear the buffer
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {/* The "Twitter-style" New Posts Button */}
      {newPostBuffer.length > 0 && (
        <button 
          onClick={showNewPosts}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg z-50 animate-bounce"
        >
          Show {newPostBuffer.length} new posts
        </button>
      )}

      <div className="feed-list">
        {posts.map(post => <PostItem key={post.id} post={post} />)}
      </div>
    </div>
  );
};

/*
4. Why this works for a Standalone App:

    User Control: The "Show New Posts" button prevents the "jumping scroll" problem that ruins social UX.
    Buffer Strategy: By keeping newPostBuffer separate, React doesn't have to re-render the entire feed every time someone in the world makes a post.
    Real-time: The WebSocket keeps a persistent connection, so the button appears the exact millisecond the post hits the database.

5. Advanced: Scoping the Live Feed
If a user is looking at the "Voice" filter, they only want to see the button for new Voice posts. You can change your channel to:
channel.on("new_post_available", (payload) => { if(payload.post.category === currentFilter) ... }).
*/

/*
Post Reporting
*/
// PostFeed.js inside useEffect
channel.on("post_deleted", (payload) => {
  // payload is just the post_id
  setPosts(prev => prev.filter(p => p.id !== payload.post_id));
  setNewPostsBuffer(prev => prev.filter(p => p.id !== payload.post_id));
});

/*
Summary of the Admin Flow:

    React: Admin clicks "Delete Post & Resolve".
    Controller: Calls Posts.resolve_report(report, :resolved, true).
    Context: Updates the report, kills the post.
    PubSub: Broadcasts post_deleted to all users and report_resolved to other admins.
    React (All Users): The post vanishes from everyone's screen instantly.
*/

//=========================================

/*
Admin Kill Switch
Global Kill Switch
Your React feed components need to listen for this post_deleted event and immediately filter their local state.
*/
// PostFeed.js (Works for Home, Discovery, and Search)
useEffect(() => {
  const channel = socket.channel(currentTopic, {});
  channel.join();

  channel.on("post_deleted", ({ post_id }) => {
    // 1. Remove from the visible feed
    setPosts(prev => prev.filter(p => p.id !== post_id));
    
    // 2. Remove from the "New Post" buffer if it's there
    setNewPostsBuffer(prev => prev.filter(p => p.id !== post_id));
    
    // 3. Optional: show a subtle toast if the user was looking at it
    // toast.info("A post was removed for violating community guidelines.");
  });

  return () => channel.leave();
}, [currentTopic]);

/*Admin Kill Switch
4. The Admin "Trigger" (The Button)
On your Admin Dashboard, the "Delete" button hits your AdminController, which triggers the chain.
*/
const handleKillSwitch = async (postId) => {
  if (window.confirm("Are you sure? This will remove the post for EVERYONE instantly.")) {
    await axios.delete(`/api/admin/posts/${postId}`);
    // The WebSocket handles the UI update automatically!
  }
};


/*
Why this is a "Standalone" Power Move:

    Zero Latency: Harmful content (especially urgent Voice posts) is removed in milliseconds.
    Consistency: Because you broadcast to both feed:public and discovery_updates, it doesn't matter which tab a user is on—the post disappears.
    Auditability: By wrapping it in a Repo.transaction, you ensure the post is truly gone from the DB before the "Kill" signal is sent.

*/

//===================================
/*
    # "Post Rejected" logic
    # Admin Rejection Logic
React Frontend (The "Vanishing" Effect)
In your React feed components, add a listener for the remove_post event.
*/
// PostFeed.js
channel.on("remove_post", ({ post_id, reason }) => {
  // 1. Filter out of visible posts
  setPosts(prev => prev.filter(p => p.id !== post_id));
  
  // 2. Filter out of the "New Post" buffer
  setNewPostsBuffer(prev => prev.filter(p => p.id !== post_id));

  // 3. Optional: If it was a 'Voice' post the user was interacting with
  toast.error(`A post was removed: ${reason}`);
});
/*
Why this is critical for the "Voice" System:

    Speed: Because Voice posts are urgent and high-visibility, a rejection must be instant. The WebSocket push ensures it disappears from a user's screen even if they haven't refreshed.
    Transparency: By creating a Notification for the author, you reduce support tickets by explaining why their post was hidden (e.g., "Violates Safety Policy").
    Data Preservation: Unlike a hard delete, keeping the post with a :rejected status allows admins to review the content later or restore it if the rejection was a mistake.
*/

//==================================

/*
Restore Post
*/
channel.on("restore_post", ({ post }) => {
  setPosts(prev => {
    // 1. Add the post back to the list
    const newList = [...prev, post];
    
    // 2. Re-sort by inserted_at so it appears in the right place
    return newList.sort((a, b) => 
      new Date(b.inserted_at) - new Date(a.inserted_at)
    );
  });
  
  toast.success("A previously removed post has been restored.");
});

/*
4. Why this works for a Standalone App:

    Minimal Disruption: By sorting in React after the restoration, the post "pops" back into its original position, so the user's scroll location stays relatively stable.
    Author Closure: The appeal_approved broadcast ensures the user gets a "win" notification, which builds trust in your moderation system.
    Database Purity: By clearing out the rejection_reason and rejected_at, the post is treated as a fresh, clean entry again.

Summary of the Moderation Loop

    Report: User flags a post
    Post is auto-hidden for them.
    Reject: Admin kills it
    Post vanishes for everyone.
    Appeal: Author explains why they're right
    Admin gets a live alert.
    Restore: Admin clicks "Approve"
    Post reappears for everyone.
*/