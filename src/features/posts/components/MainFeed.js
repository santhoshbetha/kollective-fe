/*
we have Real-time Voice alerts, show me how to implement "New Post" badges (like "Show 5 new posts") so users can load newer content without losing their scroll position

To implement a "Show New Posts" badge similar to Twitter/X, we
use a Buffer Strategy. Instead of prepending new posts to your main feed automatically (which causes the "jumping scroll" problem), we store incoming posts in a temporary React state and show a floating button.

2. React Frontend: The "Buffer" Logic
In your React feed component, you maintain two separate lists: posts (the ones the user is currently reading) and newPostBuffer (the ones that just arrived via WebSocket).

*/
import React, { useState, useEffect } from 'react';
import { Socket } from "phoenix";

const MainFeed = ({ currentUser }) => {
  const [posts, setPosts] = useState([]); // Visible posts
  const [newPostBuffer, setNewPostBuffer] = useState([]); // Hidden posts
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    const socket = new Socket("/socket", { params: { token: window.userToken } });
    socket.connect();

    const channel = socket.channel("feed:public", {});
    channel.join();

    channel.on("new_post_available", (post) => {
      // 1. Add to buffer instead of the main list
      setNewPostBuffer(prev => [post, ...prev]);
      
      // 2. Show the "Show New Posts" badge
      setShowBadge(true);
    });

    return () => channel.leave();
  }, []);

  const handleShowNewPosts = () => {
    // Move all buffered posts to the top of the visible list
    setPosts(prev => [...newPostBuffer, ...prev]);
    
    // Clear the buffer and hide the badge
    setNewPostBuffer([]);
    setShowBadge(false);

    // Optional: Smooth scroll to top so they see the new content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Floating Badge (Twitter Style) */}
      {showBadge && (
        <div className="sticky top-4 z-50 flex justify-center w-full pointer-events-none">
          <button 
            onClick={handleShowNewPosts}
            className="pointer-events-auto bg-blue-600 text-white px-6 py-2 rounded-full shadow-2xl hover:bg-blue-700 transition-all transform hover:scale-105 animate-bounce font-bold"
          >
            Show {newPostBuffer.length} new posts
          </button>
        </div>
      )}

      <div className="feed-container space-y-4">
        {posts.map(post => (
          <PostItem key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

/*
3. Handling "Voice" Alerts differently
Since Voice posts are urgent, you might want them to pop up immediately even if the user is scrolling, or use a distinct color for the badge.
*/
channel.on("new_post_available", (post) => {
  if (post.category === 'voice') {
    // Maybe trigger a browser notification or a different colored toast
    toast.error(`Urgent Voice Alert: ${post.content}`);
  }
  setNewPostBuffer(prev => [post, ...prev]);
  setShowBadge(true);
});
/*
4. Why this works for your Standalone App

    Preserves Scroll Position: The user can finish reading a long post without the text suddenly jumping down 500 pixels because someone else posted a photo.
    Reduces Re-renders: React only re-renders the long list of posts when the user explicitly clicks the button.
    Real-Time UX: It makes the app feel "alive" without being annoying. Users see the count increment as they watch, creating a "Fear Of Missing Out" (FOMO) effect that increases engagement.
*/