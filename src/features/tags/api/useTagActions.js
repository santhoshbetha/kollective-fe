import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useToggleTagFollow = (name) => {
  const queryClient = useQueryClient();

  return useMutation({
    // REPLACES: followHashtag & unfollowHashtag
    mutationFn: (isFollowing) => {
      const action = isFollowing ? 'unfollow' : 'follow';
      return api.post(`/api/v1/tags/${name}/${action}`).then(res => res.data);
    },
    
    onMutate: async (isFollowing) => {
      await queryClient.cancelQueries({ queryKey: ['tags', 'detail', name] });
      const previous = queryClient.getQueryData(['tags', 'detail', name]);

      // Optimistically flip the following state
      queryClient.setQueryData(['tags', 'detail', name], (old) => ({
        ...old,
        following: !isFollowing
      }));

      return { previous };
    },
    
    onError: (err, variables, context) => {
      queryClient.setQueryData(['tags', 'detail', name], context.previous);
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tags', 'detail', name] });
      queryClient.invalidateQueries({ queryKey: ['tags', 'followed'] });
    }
  });
};

/*
const TagHeader = ({ name }) => {
  const { data: tag, isLoading } = useTag(name);
  const { mutate: toggleFollow, isPending } = useToggleTagFollow(name);

  if (isLoading) return <Skeleton />;

  return (
    <div className="tag-header">
      <h1>#{tag.name}</h1>
      <button 
        onClick={() => toggleFollow(tag.following)}
        disabled={isPending}
      >
        {tag.following ? 'Unfollow' : 'Follow'}
      </button>
    </div>
  );
};

*/
