import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPosts, createPost } from './postApi';
import { useStatusImporter } from '../hooks/useStatusImporter';

export const usePosts = () => {
  const queryClient = useQueryClient();
  const { importFetchedStatuses } = useStatusImporter();

  const postsQuery = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: async ({ pageParam }) => {
      const data = await fetchPosts({ pageParam });
      // This is where you side-load accounts/polls like we discussed
      importFetchedStatuses(data.posts); 
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
