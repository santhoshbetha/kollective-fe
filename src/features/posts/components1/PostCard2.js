/*

Image Pre-fetching
To implement
Image Pre-fetching, you can use a hover-triggered background task in React. While the user scrolls through their State tab seeing optimized 300x300 thumbnails, a "hover" over a specific post triggers the browser to speculatively download the high-resolution original in the background. 
1. The Pre-fetching Strategy
When a user’s mouse enters the post area, we create a non-rendered Image object in JavaScript. This forces the browser to fetch the asset and store it in its local cache. If the user eventually clicks to expand the image, it will load instantly from the cache rather than the server. 
2. React Implementation (PostCard.js)
Use the onMouseEnter event to trigger the pre-fetch. We include a small setTimeout (debounce) to avoid wasting bandwidth on users just quickly moving their mouse across the screen.

*/
import React, { useRef } from 'react';

const PostCard = ({ post }) => {
  const prefetchTimer = useRef(null);

  const handleMouseEnter = () => {
    // Wait 200ms of hover intent before prefetching to save bandwidth
    prefetchTimer.current = setTimeout(() => {
      const img = new Image();
      img.src = post.media.original_url; // This triggers the background fetch
      console.log(`Prefetching high-res for post ${post.id}`);
    }, 200);
  };

  const handleMouseLeave = () => {
    if (prefetchTimer.current) {
      clearTimeout(prefetchTimer.current);
    }
  };

  return (
    <div 
      className="post-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Show the optimized thumbnail initially */}
      <img src={post.media.thumbnail_url} alt="Thumbnail" loading="lazy" />
      
      {/* Clicking could open a lightbox using the pre-cached original_url */}
      <button onClick={() => openLightbox(post.media.original_url)}>
        View High-Res
      </button>
    </div>
  );
};

/*
3. Alternative: Browser Resource Hints
If you want the browser to handle this even more speculatively, you can dynamically inject a <link rel="prefetch"> tag into the document head. This is lower priority than the JavaScript Image object method and won't interfere with the main page performance.

const prefetchLink = document.createElement('link');
prefetchLink.rel = 'prefetch';
prefetchLink.as = 'image';
prefetchLink.href = post.media.original_url;
document.head.appendChild(prefetchLink);

*/

