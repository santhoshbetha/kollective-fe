import React, { useEffect, useState } from 'react';

const PostMedia = ({ post }) => {
  const [currentPost, setCurrentPost] = useState(post);

  useEffect(() => {
    // Join the specific post channel
    const channel = socket.channel(`post_details:${post.id}`, {});
    channel.join();

    // Listen for the "Video Ready" broadcast from Elixir
    channel.on("video_ready", (payload) => {
      // payload will be the updated post data from PostJSON.data
      setCurrentPost(payload.data);
    });

    return () => channel.leave();
  }, [post.id]);

  if (currentPost.processing_status === 'processing') {
    return <div className="animate-pulse bg-gray-200 h-64 flex items-center justify-center">Transcoding Video...</div>;
  }

  if (currentPost.media_url && currentPost.media_type === 'video') {
    return <video src={currentPost.media_url} controls className="w-full rounded-lg" />;
  }

  if (currentPost.media_url) {
    return <img src={currentPost.media_url} alt="Post content" className="w-full rounded-lg" />;
  }
  
  // Video thumbnail
  {currentPost.media_type === 'video' && (
    <video 
        src={currentPost.media_url.original} 
        poster={currentPost.media_url.thumbnail} // <--- The extracted frame
        controls 
        className="w-full rounded-lg" 
    />
  )}

  return null;
};
