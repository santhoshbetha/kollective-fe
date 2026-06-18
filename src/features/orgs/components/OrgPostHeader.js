// React: PostHeader.js

/*
Organization POST header
In your React frontend, the post header should show the Organization 
as the primary entity, with a "By [Author Name]" secondary label. 
*/

const OrgPostHeader = ({ post }) => {
  if (post.organization) {
    return (
      <div className="flex items-center space-x-2">
        <span className="font-bold text-lg">{post.organization.name}</span>
        <span className="text-gray-400 text-sm">by @{post.user.nickname}</span>
        {post.organization.is_verified && <VerifiedIcon className="h-4 w-4 text-blue-500" />}
      </div>
    );
  }
  
  return <span className="font-bold">@{post.user.nickname}</span>;
};

/*
Why this is a Discovery Win:

    Trust & Authority: A post from "The New York Times" carries more weight in the Country Tab than a regular user, even if written by a specific journalist.
    Organization Discovery: Users can follow an entire organization to see posts from all its approved journalists in their Home Feed.
    Controlled Voice: The admin approval step ensures that only vetted individuals can speak on behalf of the group, preventing unauthorized "Voice" posts.
*/
