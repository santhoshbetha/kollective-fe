import clsx from 'clsx';
import PostContent from './status-content';
import LazyImage from '../../../components/LazyImage';

/**
 * ThreadStatus: Simplified for a standalone app.
 * Draws a vertical line (connector) between parent and child posts.
 */
const ThreadStatus = ({ status, isFirst, isLast, focusedStatusId}) => {
  const isFocused = status.id === focusedStatusId;
  if (!status) return null;

  return (
    <div className={clsx('relative flex gap-3', { 'pt-4': isFirst })}>
      {/* The Connector Line */}
      {!isLast && (
        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800 z-0" />
      )}

      <div className="flex gap-3 p-4 relative z-10">
        {/* Avatar with potential connector spacing */}
        <div className="flex flex-col items-center shrink-0">
          <LazyImage
            src={status.account.avatar} 
            className="w-12 h-12 rounded-full" 
            alt={status.account.display_name} 
            skeletonClass="w-12 h-12 rounded-full"
          />
        </div>

        {/* Content Area */}
        <div className={clsx("flex-1 min-w-0 pb-6", isFocused && "bg-blue-50/20 rounded-lg p-2")}>
          <div className="flex justify-between items-baseline mb-1">
            <span className="font-bold truncate">{status.account.display_name}</span>
            <span className="text-xs text-gray-500">
              {new Date(status.inserted_at).toLocaleDateString()}
            </span>
          </div>

          <PostContent status={status} />
          
          {/* Interaction Bar would go here */}
        </div>
      </div>
    </div>
  );
};

export default ThreadStatus;

/*
Key Minimizations

    1. Removed Immutable/Redux: Instead of checking ImmutableOrderedSet for reply counts, we simply pass
       isLast or isFirst props from the parent list.
    2. Removed Immutable/Redux: Instead of checking ImmutableOrderedSet for reply counts, we simply pass
       isLast or isFirst props from the parent list.
    3. Prop-driven Rendering: Since your Elixir backend now sends the full post object, you don't need a 
       PlaceholderStatus while waiting for separate Redux state slices to load.
    4. Flexbox Layout: Standard Tailwind Flex handles the RTL (Right-to-Left) and alignment naturally.
*/

/*
{posts.map((post, index) => (
  <ThreadStatus 
    key={post.id} 
    status={post} 
    isLast={index === posts.length - 1} 
  />
))}
*/

/*
Lazy Image on Video Page:
{status.video && (
  <LazyImage 
    src={status.video.thumbnail_url} 
    skeletonClass="aspect-video w-full rounded-xl"
    className="aspect-video w-full rounded-xl object-cover"
  />
)}
  3. Why this is the "Golden Path":

    No Layout Shift: Since the skeletonClass matches the final image dimensions exactly, 
    the TanStack Virtual scroller won't "jump" when images pop in.
    Perceived Speed: The user immediately sees a Pulse in the correct shape, which is 
    psychologically faster than a blank white box or a "broken image" icon while PostgreSQL and S3 respond.
    Low Complexity: Unlike heavy libraries (like react-lazy-load-image-component), this 
    uses native browser events and Tailwind for the animation, keeping your Standalone App lean.

   4. Pro-Tip for Elixir/S3:
  When your Phoenix Controller generates the JSON, you can include a blurhash or a 
  very tiny Base64 placeholder to use as the background-image for an even smoother "Unblur" effect.
*/

/*
In your
Threaded Social App, the isFirst prop is the secret to making the "Reply Chain"
look professional. While isLast tells the line where to stop, isFirst tells the CSS 
where the line should start (often directly under the avatar of the parent post).
*/
