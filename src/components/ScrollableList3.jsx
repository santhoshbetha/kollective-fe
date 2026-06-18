import React, { forwardRef, useMemo, useRef, useEffect } from 'react';
import { useWindowVirtualizer, useVirtualizer } from '@tanstack/react-virtual';
import ListItem from './ListItem';

/*
Heavy images or media support for items with varying content heights that might cause layout 
shifts as they load.

When handling heavy images in a virtualized list, the biggest challenge is layout shift: the virtualizer 
measures an item before its image has loaded, then the image "pops in," changing the item's height
and causing everything below it to jump. 

To solve this with TanStack Virtual, you need to combine explicit aspect ratios with manual 
re-measurements when images finish loading. 

1. Reserve the Box: If you have the image dimensions from your API, set a padding-top or 
   aspect-ratio on a container div wrapping the image. This forces the browser to reserve 
   space before the image downloads.
2. Manual Re-measurement: If image sizes are truly random, call virtualizer.measure() 
   inside the image's onLoad event. This forces the virtualizer to update the totalSize 
   and all subsequent item positions immediately.
3. Increase Overscan: For image-heavy lists, set overscan to a higher number (e.g., 10). 
   This renders more items off-screen, giving images extra time to load before the user scrolls to them. 

*/

const ScrollableList3 = forwardRef(({
  children,
  onLoadMore,
  hasMore,
  isLoading,
  useWindowScroll = true,
  scrollKey,
  prepend = null,
  alwaysPrepend,
  children,
  isLoading,
  emptyMessage,
  emptyMessageCard = true,
  showLoading,
  onLoadMore,
  className,
  listClassName,
  itemClassName,
  id,
  hasMore,
  placeholderComponent: Placeholder,
  placeholderCount = 0,
  useWindowScroll = true,
  style = {},
}, ref) => {
  const parentRef = useRef(null);
  const elements = React.Children.toArray(children);
  const data = useMemo(() => hasMore ? [...elements, '__loader__'] : elements, [elements, hasMore]);

  const virtualizer = (useWindowScroll ? useWindowVirtualizer : useVirtualizer)({
    count: data.length,
    getScrollElement: () => (useWindowScroll ? window : parentRef.current),
    estimateSize: () => 300, // Estimate on the larger side for images
    overscan: 5,
  });

  return (
    <div ref={!useWindowScroll ? parentRef : null} style={{ overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualItem.start}px)`,
              width: '100%',
            }}
          >
            <ListItem 
              content={data[virtualItem.index]} 
              // Pass the measure function to children
              onImageLoad={() => virtualizer.measure()} 
            />
          </div>
        ))}
      </div>
    </div>
  );
});

/*
 how to fetch image dimensions from your backend to set these aspect ratios dynamically

To fetch and apply image dimensions dynamically, your backend should include the original 
width and height in each item's JSON response. This allows the browser to calculate 
the aspect ratio and reserve space before the image downloads, preventing layout shifts 
in your virtualized list.

1. Expected Backend Response
Ensure your API returns dimension metadata for every image:

{
  "id": "item_1",
  "text": "Check out this photo!",
  "imageUrl": "https://example.com/image.jpg",
  "imageWidth": 1200,
  "imageHeight": 800
}

2. Implementation in ListItem

const ListItem = ({ content, onImageLoad }) => {
  if (content === '__loader__') return <LoadMore />;

  // Calculate aspect ratio string (e.g., "1200 / 800")
  const aspectRatio = `${content.imageWidth} / ${content.imageHeight}`;

  return (
    <div style={{ paddingBottom: '16px' }}>
      <div 
        style={{ 
          width: '100%', 
          aspectRatio: aspectRatio, // Reserves correct space immediately
          backgroundColor: '#f3f4f6', // Placeholder color while loading
          overflow: 'hidden'
        }}
      >
        <img 
          src={content.imageUrl} 
          onLoad={onImageLoad} // Still useful for triggering re-measure once sharp
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            display: 'block' 
          }} 
        />
      </div>
      <p style={{ marginTop: '8px' }}>{content.text}</p>
    </div>
  );
};

3. Why this works for virtualization

a. Zero Jitter: The Layout Instability API reports shifts when elements change position. 
   By providing the aspect-ratio upfront, the initial estimateSize of the virtualizer is 
   much closer to reality.
b. Browser Optimization: Modern browsers use width and height attributes to infer ratios even 
   before CSS is fully processed.
c. Reduced Logic: You don't need complex useEffect hooks to wait for every image; the DOM 
   is stable from the moment the virtual item is rendered. 

   If your backend cannot provide these dimensions, you can use a library like probe-image-size on
   your server to extract them without downloading the full image. 

*/

/*
To implement this on the backend, you can use the probe-image-size package.
 It is highly efficient because it extracts dimensions from the image's header 
 without downloading the entire file. 

 const express = require('express');
const probe = require('probe-image-size');
const app = express();

app.get('/api/posts', async (req, res) => {
  // Your raw data (usually from a database)
  const rawPosts = [
    { id: 1, text: "Check this out!", url: "https://example.com/photo1.jpg" },
    { id: 2, text: "Another one", url: "https://example.com/photo2.png" }
  ];

  try {
    // Process all posts to attach dimensions
    const postsWithDimensions = await Promise.all(
      rawPosts.map(async (post) => {
        try {
          // Probe the image to get width and height
          const result = await probe(post.url);
          
          return {
            ...post,
            imageWidth: result.width,
            imageHeight: result.height
          };
        } catch (err) {
          console.error(`Failed to probe image for post ${post.id}:`, err);
          // Return default dimensions or null to prevent app crash
          return { ...post, imageWidth: 100, imageHeight: 100 };
        }
      })
    );

    res.json(postsWithDimensions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch post dimensions" });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));

*/

/*
cache these dimensions in a database (like MongoDB or PostgreSQL) so your API stays fast

To keep your API fast, use the Cache-Aside Pattern. This ensures you only probe an image's 
dimensions once, then store the result in your primary database (MongoDB or PostgreSQL).

1. Database Schema Updates
Add width and height fields to your image or post model to store the metadata permanently.

MongoDB (Mongoose):
javascript
const PostSchema = new mongoose.Schema({
  text: String,
  imageUrl: String,
  imageWidth: Number,  // Cache width here
  imageHeight: Number  // Cache height here
});

PostgreSQL (SQL):
ALTER TABLE posts ADD COLUMN image_width INTEGER;
ALTER TABLE posts ADD COLUMN image_height INTEGER;

2. Implementation: The Cache-Aside Logic
In your Express route, check the database first. 
If dimensions are missing, probe the image and update the record immediately

app.get('/api/posts', async (req, res) => {
  const posts = await Post.find(); // Fetch posts from DB

  const enrichedPosts = await Promise.all(posts.map(async (post) => {
    // If dimensions are already cached, return the post immediately
    if (post.imageWidth && post.imageHeight) return post;

    try {
      // Dimension MISS: Probe and save to database (Cache-Aside)
      const result = await probe(post.imageUrl);
      
      post.imageWidth = result.width;
      post.imageHeight = result.height;
      await post.save(); // Cache permanently in MongoDB
      
      return post;
    } catch (err) {
      return { ...post.toObject(), imageWidth: 300, imageHeight: 200 }; // Fallback
    }
  }));

  res.json(enrichedPosts);
});


*/
