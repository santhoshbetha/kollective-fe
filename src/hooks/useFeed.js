// src/hooks/useFeed.js
import { useEffect, useState } from 'react';
import { Presence } from 'phoenix';
import { useSocket } from '../contexts/socket-context';

export const useFeed = (streamType) => {
  const socket = useSocket();
  const [posts, setPosts] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});

  useEffect(() => {
    if (!socket) return;

    // 1. Join the channel (matching our Elixir channel "stream:*")
    const channel = socket.channel(`stream:${streamType}`, {});
    const presence = new Presence(channel);

    // 2. Handle Presence updates (Online Status)
    presence.onSync(() => {
      setOnlineUsers(presence.list());
    });

    // 3. Handle incoming posts
    channel.on("new_item", (payload) => {
      setPosts(prev => [payload.item, ...prev]);
    });

    channel.join()
      .receive("ok", () => console.log("Joined successfully"))
      .receive("error", resp => console.error("Unable to join", resp));

    return () => channel.leave();
  }, [socket, streamType]);

  return { posts, onlineUsers };
};

/*
 const { posts, onlineUsers } = useFeed("public:local");
  <div className="flex">
      <main className="flex-1">
        <h1>Local Timeline</h1>
        {posts.map(post => (
          <div key={post.id} className="post-card">
            <strong>{post.author}</strong>: {post.content}
          </div>
        ))}
      </main>

      <aside className="w-64 border-l">
        <h2>Online Now ({Object.keys(onlineUsers).length})</h2>
        {Object.entries(onlineUsers).map(([id, info]) => (
          <div key={id} className="user-badge">
            ● {info.metas[0].username}
          </div>
        ))}
      </aside>
    </div>
*/
