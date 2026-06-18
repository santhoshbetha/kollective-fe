/*
Post Muting" logic so users can hide specific accounts or keywords from appearing in their filtered lists?
*/

const addMutedKeyword = async (keyword) => {
  // Update the user's settings in the DB
  const { data } = await axios.put('/api/settings', {
    user: { muted_keywords: [...currentUser.muted_keywords, keyword] }
  });
  
  // Refresh the local user state
  updateCurrentUser(data.user);
  
  // Instantly filter out posts in the current React state
  setPosts(prev => prev.filter(p => !p.content.toLowerCase().includes(keyword.toLowerCase())));
};


/*
Why this is essential for a standalone app:

    Safety: Blocking/Muting is a core requirement for modern social apps to prevent harassment.
    Performance: By filtering in the base_query, Postgres handles the exclusion via indexes, meaning the user's feed stays fast.
    Real-time Polish: By filtering in the Channel, a user who just muted "politics" won't see a "Show 1 new post" badge for a political post.
*/