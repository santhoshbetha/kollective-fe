/*
Feed Filter:
*/
const fetchFeed = (filterType) => {
  const url = filterType === 'mentions' 
    ? '/api/posts?filter=mentions' 
    : filterType === 'voice' 
    ? '/api/posts?category=voice' 
    : '/api/posts';
    
  axios.get(url).then(res => setPosts(res.data.data));
};

return (
  <div className="flex gap-4 mb-6">
    <button onClick={() => fetchFeed('all')}>All Posts</button>
    <button onClick={() => fetchFeed('voice')}>Voice (Urgent)</button>
    <button onClick={() => fetchFeed('mentions')}>Mentions</button>
  </div>
);