POST:

Fallbck image handling:
 Handling Broken Links (Missing in R2)
If the database has a filename but the file was deleted from Cloudflare R2, the url method will still return a 
valid-looking link that leads to a 404. To handle this on the Frontend (React), you should use the onError attribute:
<img 
  src={post.media_url} 
  onError={(e) => { e.target.src = "/assets/fallback-image.png" }} 
  alt={post.content} 
/>

========================================================
Video or image check from backend post json
// React: Video Player
{item.is_video ? (
  <video 
    src={item.url} 
    poster={item.poster_url} 
    controls 
    preload="none" 
    className="post-video" 
  />
) : (
  <img src={item.url} alt="Post content" />
)}
============================================================
Comments iusage: frontend has everything it needs to render a professional comment thread.
const CommentItem = ({ comment }) => (
  <div className="comment-box">
    <div className="author-info">
      <img src={comment.author.avatar_url} alt={comment.author.username} />
      <strong>{comment.author.username}</strong>
      {comment.author.is_verified && <span className="badge">✓</span>}
    </div>
    
    <p>{comment.content}</p>
    
    <small>{new Date(comment.inserted_at).toLocaleString()}</small>
  </div>
);
===========================================================
Notifications handling:
import { Socket } from "phoenix";

const socket = new Socket("/socket", { params: { token: userToken } });
socket.connect();

const channel = socket.channel(`notifications:${userId}`, {});
channel.join();

channel.on("new_notification", (payload) => {
  console.log("New Notification received:", payload);
  // Update your React state to show the red dot or add to the list
  setNotifications(prev => [payload, ...prev]);
  setUnreadCount(count => count + 1);
});

// React: NotificationItem.js
const NotificationItem = ({ notification }) => (
  <div className={`item ${notification.is_read ? 'read' : 'unread'}`}>
    <Link to={notification.link}>
      <p>{notification.message}</p>
    </Link>
  </div>
);
================================================================================
================================================================================
// connect to the channel to show a toast or update a badge.
let channel = socket.channel(`notifications:${currentUserId}`, {})
channel.join()
  .receive("ok", resp => { console.log("Joined notifications") })

channel.on("new_notification", payload => {
  if (payload.type === "follow_request") {
    showToast(`${payload.actor_username} sent you a follow request!`);
    updateNotificationBadge();
  }
})

===================================================================