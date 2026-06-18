// Load More ... logic

const fetchPosts = async () => {
  const url = nextMaxId ? `/api/posts?max_id=${nextMaxId}` : "/api/posts";
  const { data } = await axios.get(url);
  
  setPosts(prev => [...prev, ...data.data]);
  setNextMaxId(data.meta.next_max_id);
  setHasMore(data.meta.has_more);
};


const loadMore = async () => {
  let url = `/api/posts?max_id=${nextMaxId}`;
  
  if (currentSort === 'top') {
    url += `&sort=top&min_score=${nextMinScore}`;
  }

  const { data } = await axios.get(url);
  // append posts...
};

/*
GET /api/posts?category=voice&sort=top&max_ts=...&min_score=...

GET /api/posts?sort=top&min_score=50&max_ts=2023-10-01..

  const url = filterType === 'mentions' 
    ? '/api/posts?filter=mentions' 
    : filterType === 'voice' 
    ? '/api/posts?category=voice' 
    : '/api/posts';
*/