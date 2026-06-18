const handleSocialAction = async (type) => {
  // type is 'follow', 'mute', or 'block'
  await axios.post(`/api/relationships/toggle`, {
    target_id: post.user.id,
    type: type
  });
  
  // If it was a block or mute, remove the post from the current React list
  if (type === 'block' || type === 'mute') {
    setPosts(prev => prev.filter(p => p.user.id !== post.user.id));
  }
};

/*
Why this Unified Schema is powerful:

    DB Efficiency: One table (user_relationships) stores all social metadata.
    Safety: The validate_not_self in your changeset prevents users from blocking themselves, which could break their own feed logic.
    Scalability: Because you use UUIDs (binary_id) and have a unique index on [source_id, target_id], lookups are extremely fast even as the table grows.
    Privacy: By implementing filter_privacy in the base_query, you guarantee that a blocked user's content never accidentally leaks into the "Top" or "Voice" feeds.
*/