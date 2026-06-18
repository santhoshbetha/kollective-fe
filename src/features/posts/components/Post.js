// is_mention
//Post component can change its style dynamically based on is_mention flag

const Post = ({ post }) => {
  // If the user was mentioned, give the post a subtle background color
  const highlightClass = post.is_mention 
    ? "bg-blue-50 border-l-4 border-blue-500" 
    : "bg-white";

  return (
    <div className={`p-4 mb-4 rounded-lg shadow-sm ${highlightClass}`}>
      {post.is_mention && (
        <span className="text-xs font-bold text-blue-600 uppercase">
          Tagged for you
        </span>
      )}
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      
      {/* Render the mentions as clickable chips at the bottom */}
      <div className="flex gap-1 mt-2">
        {post.mentions?.map(m => (
          <Link key={m.id} to={`/profiles/${m.username}`} className="text-xs text-gray-500">
            @{m.username}
          </Link>
        ))}
      </div>
    </div>
  );
};
/*
is_mention:
 Why this works for a Standalone App:

    Zero Parsing: React doesn't have to scan the text for @ symbols. It just checks a boolean.
    Privacy/Utility: Only the user who was actually mentioned sees the is_mention: true flag (thanks to the current_user check in the JSON view).
    Visual Hierarchy: In a fast-moving "Voice" or "Local" feed, highlighting mentions ensures users don't miss conversations they are part of.
*/

