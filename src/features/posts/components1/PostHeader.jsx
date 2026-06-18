// React: PostHeader.js
/*
 you can now show the "Reach" of a post. 
 If a Scholar from another state posts in a user's Local tab, the UI should clarify that.
*/
// experts, target scope, locality badge
const PostHeader = ({ post }) => {
  const isExpert = post.user.type === 'scholar' || post.user.type === 'journalist';
  
  return (
    <div className="flex flex-col mb-2">
      <div className="flex items-center space-x-2">
        <span className="font-bold">@{post.user.nickname}</span>
        
        {/* Type Badge */}
        {isExpert && (
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
            {post.user.type.toUpperCase()}
          </span>
        )}

        {/* Scope Indicator */}
        <span className="text-xs text-gray-400 italic">
          Targeted to {post.target_scope}
        </span>
      </div>

      {/* Show Origin if it's different from the User's Home (for Experts) */}
      {post.locality_badge && (
        <div className="text-xs text-blue-600 mt-1">
          📍 {post.locality_badge.label}
        </div>
      )}
    </div>
  );
};

/*
4. Why this makes Discovery better

    Contextual Clarity: Users won't be confused when they see a post from a "Scholar" across the country in their Local tab.
    Social Proof: Seeing that a post has "Country" scope helps users understand why it has such a high score compared to a strictly "Local" post.
    Clean UI: Regular users only see the "Reach" toggle (Local/State/Country), keeping their posting experience simple and focused on their actual community.
*/