import DOMPurify from 'dompurify';
import { usePost } from '../api/usePost';

export const PostItem2 = ({ id, conversationId, isHighlighted }) => {
  const { data: post, isLoading } = usePost(id, conversationId);

  if (isLoading) return <div className="skeleton">...</div>;
  if (!post) return null;

  // Sanitize the HTML string to remove potential XSS vulnerabilities
  const sanitizedContent = DOMPurify.sanitize(post.content);

  return (
    <article className={`post-item ${isHighlighted ? 'active' : ''}`}>
      {/* The line will be anchored to this wrapper */}
      <div className="post-item-line-container">
        <header>
          <img src={post.account.avatar} className="avatar" />
          <strong>{post.account.display_name}</strong>
        </header>
        <div className="content" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
      </div>
    </article>
  );
};

/* CSS
/* Container for each post */
//.post-item {
//  position: relative;
//  padding: 12px 16px;
//}

/* The vertical line */
//.post-item::before {
//  content: "";
//  position: absolute;
  /* Align horizontally with the center of the avatar */
//  left: 32px; 
// top: 50px; /* Start below the avatar */
//  bottom: 0; /* Run to the bottom of the item */
//  width: 2px;
//  background-color: #e1e8ed; /* Light gray line */
//  z-index: 1;
//}

/* Remove the line for the very last item in a thread */
 //.post-item:last-child::before {
 //  display: none;
 //}

/* Optional: Highlighted state for the main post */
//.post-item.active {
//  background-color: rgba(29, 155, 240, 0.05);
//}

//.avatar {
//  width: 40px;
//  height: 40px;
//  border-radius: 50%;
//  position: relative;
//  z-index: 2; /* Keep avatar above the line */
//}
