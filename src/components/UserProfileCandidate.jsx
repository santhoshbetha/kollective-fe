
// /#Profile Pages with Verification for candidate
// Use the is_verified_candidate flag to render a "Blue Check" or a specific "Official" badge.
// React: UserProfile.js
const ProfileHeader = ({ user }) => {
  return (
    <div className="p-6 bg-white border-b">
      <div className="flex items-center space-x-3">
        <h1 className="text-2xl font-bold">@{user.nickname}</h1>
        
        {user.verified.is_verified_candidate && (
          <div className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
            <CheckBadgeIcon className="h-4 w-4 mr-1" />
            {user.verified.title || "Verified Representative"}
          </div>
        )}
      </div>
      
      <p className="mt-2 text-gray-600">{user.bio}</p>
      
      <div className="mt-4 flex space-x-4 text-sm text-gray-500">
        <span><strong>{user.counts.followers}</strong> Followers</span>
        <span><strong>{user.counts.following}</strong> Following</span>
      </div>
    </div>
  );
};

/*
Why this is the "Discovery" final touch:

    Trust Hierarchy: When a user sees a Voice post about a local issue, seeing that the author is a "Verified Representative" in their Federal District gives the post massive authority.
    Official Engagement: Representatives can use the @Mentions and Hashtags we built to directly engage with the concerns of their constituents.
    Local Accountability: Users can easily find and follow the "Verified" accounts representing their specific city and districts.
*/
