import axios from 'axios';

const API_URL = 'your-api-endpoint';

export const fetchPosts = async ({ pageParam = 0 }) => {
  const { data } = await axios.get(`${API_URL}/posts?offset=${pageParam}`);
  return data; // Should return { posts: [...], nextOffset: number }
};

export const createPost = async (newPost) => {
  const { data } = await axios.post(`${API_URL}/posts`, newPost);
  return data;
};

/*
usage: 
// BEFORE (Redux)
// const { items, loading } = useSelector(state => state.posts);
// useEffect(() => { dispatch(fetchPosts()) }, []);

// AFTER (TanStack Query)
const { postsQuery } = usePosts();
const { data, isLoading, fetchNextPage } = postsQuery;

if (isLoading) return <Spinner />;

return (
  <div>
    {data?.pages.map(page => 
      page.posts.map(post => <PostCard key={post.id} post={post} />)
    )}
  </div>
);
*/
