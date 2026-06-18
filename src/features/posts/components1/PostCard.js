// React: PostCard.js

/*
use the thumbnail_url for the main list. 
Only load the original_url if the user clicks to expand the image.
*/
// React: PostCard.js

/*
Implementing
Lazy Loading in your React feed ensures that images are only downloaded as they enter the user's viewport, significantly reducing the initial data load for mobile users in your local districts. 
1. Native Browser-Level Lazy Loading
The simplest way to implement lazy loading in React is by adding the loading="lazy" attribute to your <img> tags. This tells modern browsers to defer loading the image until the user scrolls near it. 
*/
const PostCard = ({ post }) => {
  return (
    <div className="feed-item">
      <img 
        src={post.media.thumbnail_url} 
        alt="Post media" 
        loading="lazy" // Native browser lazy loading
        width="300"    // Providing dimensions prevents layout shifts
        height="300"
        className="w-full h-auto rounded"
      />
      <p>{post.content}</p>
    </div>
  );
};
/*
3. Server Requirement: Install ImageMagick
Waffle requires ImageMagick to be installed on your server (or your Docker container) to perform these transformations. 

    Ubuntu/Debian: sudo apt-get install imagemagick
    Mac (Homebrew): brew install imagemagick
*/


//jsx
/*
2. Advanced Lazy Loading with Intersection Observer
For more control—such as showing a placeholder or a fade-in effect—use the Intersection Observer API via the react-intersection-observer library. 

    Trigger Once: Use the triggerOnce: true option so the observer stops monitoring the image after it has loaded.
    Root Margin: Set a rootMargin (e.g., 200px) to start loading the image slightly before it enters the viewport, so it’s ready by the time the user sees it. 
*/

import { useInView } from 'react-intersection-observer';

function LazyImage({ src, alt }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px', // Preload before it's visible
  });

  return (
    <div ref={ref} className="bg-gray-200 min-h-[300px] rounded">
      {inView ? (
        <img src={src} alt={alt} className="animate-fade-in" />
      ) : (
        <div className="shimmer-placeholder" /> // Show loading skeleton
      )}
    </div>
  );
}

/*
3. List Virtualization for High-Volume Feeds
If your local district feeds contain thousands of posts, simple lazy loading may not be enough. Virtualization (or windowing) renders only the items currently visible in the "window," unmounting off-screen elements to save memory. 

    React Virtuoso: Highly recommended for social feeds as it automatically handles items with varying heights (e.g., some posts have images, others only text).
    React Window: A lighter, faster alternative but requires more manual configuration for variable heights
*/

