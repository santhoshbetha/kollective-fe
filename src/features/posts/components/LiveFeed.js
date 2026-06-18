import React, { useState, useEffect } from 'react';
import { Socket } from "phoenix";


/*
"New Post" detection (using PubSub) so that when a user
 is at the top of the feed, a button appears saying "Show 3 new posts" (similar to Twitter/X)

 3. React Frontend: The "Buffer" Logic
In React, we keep two states: posts (what the user sees) and newPostsBuffer (hidden posts waiting to be shown).

*/

const LiveFeed = ({ currentUser }) => {
  const [posts, setPosts] = useState([]);
  const [newPostsBuffer, setNewPostsBuffer] = useState([]);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    // 1. Connect to WebSocket
    const socket = new Socket("/socket", { params: { token: window.userToken } });
    socket.connect();
    const channel = socket.channel("feed:public", {});
    channel.join();

    // 2. Listen for new posts
    channel.on("new_post_available", (newPost) => {
      // Logic: If user is at the very top, maybe auto-inject? 
      // Usually, it's better to always buffer to avoid "jumping"
      setNewPostsBuffer(prev => [newPost, ...prev]);
    });

    // 3. Track scroll position to show/hide the button
    const handleScroll = () => setIsAtTop(window.scrollY < 100);
    window.addEventListener('scroll', handleScroll);

    return () => {
      channel.leave();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleShowNewPosts = () => {
    // Move buffer to the main feed and clear buffer
    setPosts(prev => [...newPostsBuffer, ...prev]);
    setNewPostsBuffer([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* The Floating Notification Button */}
      {newPostsBuffer.length > 0 && (
        <div className="sticky top-4 z-50 flex justify-center">
          <button 
            onClick={handleShowNewPosts}
            className="bg-blue-600 text-white px-6 py-2 rounded-full shadow-xl hover:bg-blue-700 transition-all transform hover:scale-105"
          >
            Show {newPostsBuffer.length} new posts
          </button>
        </div>
      )}

      <div className="space-y-4">
        {posts.map(post => <PostItem key={post.id} post={post} />)}
      </div>
    </div>
  );
};
