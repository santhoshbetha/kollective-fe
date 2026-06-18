/*
User Profile logic with binary_id (UUIDs), you need to fetch the user profile, aggregate their social statistics (post count,
 followers, following), and fetch their specific post feed using the Timestamp-based pagination we built
*/

// ProfileView.js
const fetchProfilePosts = async () => {
  const url = nextMaxTs 
    ? `/api/profiles/${username}/posts?max_ts=${nextMaxTs}` 
    : `/api/profiles/${username}/posts`;
    
  const { data } = await axios.get(url);
  setPosts(prev => [...prev, ...data.posts]);
  setNextMaxTs(data.meta.next_max_ts);
};

/*
Why this is optimal for UUIDs:

    UUID Versatility: The Ecto.UUID.cast/1 check allows your profile links to work with both IDs (/u/550e...) and usernames (/u/alice).
    Decoupled Stats: By preloading stats in a separate private helper, you keep your User schema clean while providing the rich data React needs for the "Follower Count" display.
    Consistency: The post feed uses the exact same Timestamp Pagination and Hydration logic as the main feed, ensuring "Likes" and "Reblogs" show correctly for the viewing user.
*/