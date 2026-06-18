/*

Implementing
Skeleton Screens in your React feed provides immediate visual feedback that content is loading, which reduces perceived latency for users in your local districts.
1. The Strategy: Matching the "Post" Shape
A skeleton screen must mimic the exact layout of your PostCard component—including the avatar, the username, and the 300x300 image block—to prevent "Layout Shift" when the real data arrives.
2. React Skeleton Component (SkeletonPost.js)
Use Tailwind CSS's animate-pulse class to create the subtle "breathing" effect common in apps like Facebook or LinkedIn.

*/

// React: SkeletonPost.js
const SkeletonPost = () => {
  return (
    <div className="max-w-2xl mx-auto p-4 bg-white border border-gray-100 rounded-lg mb-4 animate-pulse">
      {/* Header: Avatar and Nickname */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="h-10 w-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
      </div>

      {/* Content lines */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>

      {/* 300x300 Media Block */}
      <div className="aspect-square w-full bg-gray-200 rounded-lg mb-4" />

      {/* Bottom buttons (Upvote, Reply) */}
      <div className="flex space-x-4">
        <div className="h-8 bg-gray-100 rounded w-16" />
        <div className="h-8 bg-gray-100 rounded w-16" />
      </div>
    </div>
  );
};

/*
3. Implementing in the Feed Controller
When your React app is fetching a new tab (e.g., State or Country), render a list of 3-5 skeletons until the API response returns.
*/
// React: Feed.js
const [loading, setLoading] = useState(true);
const [posts, setPosts] = useState([]);

return (
  <div className="feed-container">
    {loading ? (
      // Show 5 skeletons while fetching
      [...Array(5)].map((_, i) => <SkeletonPost key={i} />)
    ) : (
      posts.map(post => <PostCard key={post.id} post={post} />)
    )}
  </div>
);

/*
4. Integration with Lazy Loading
Combine this with your LazyImage component from the previous step. While the thumbnail_url is downloading from your Phoenix server, the shimmer-placeholder can be the skeleton's media block.
*/

/* Add to app.css for a moving shimmer effect */
.shimmer-placeholder {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}