import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPosts, createPost } from './postApi';
import { usePostImporter } from './usePostImporter';

export const usePosts = () => {
  const queryClient = useQueryClient();
  const { importFetchedPosts } = usePostImporter();

  const postsQuery = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: async ({ pageParam }) => {
      const data = await fetchPosts({ pageParam });
      // This is where you side-load accounts/polls like we discussed
      importFetchedPosts(data.posts); 
      return data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });

  const postMutation = useMutation({
    mutationFn: createPost,
    onSuccess: (newPost) => {
      // Automatically refresh the feed when a new post is made
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  return { postsQuery, postMutation };
};
