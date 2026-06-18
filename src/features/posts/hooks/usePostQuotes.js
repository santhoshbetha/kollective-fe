import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { usePostImporter } from './usePostImporter';
import { extractMaxIdFromLink } from '@/utils/api-helpers';

export const usePostQuotes = (postId) => {
  const { importPostEntities } = usePostImporter();

  return useInfiniteQuery({
    // Unique key partitions quotes by postId
    queryKey: [posts', 'quotes', postId],
    queryFn: async ({ pageParam }) => {
      const response = await api.get(`/api/v1/kollective/posts/${postId}/quotes`, {
        params: { max_id: pageParam, limit: 20 }
      });

      const data = response.data;

      // SIDE-LOADING: Seed the global post cache
      // Replaces: dispatch(importFetchedPosts(data))
      importPostEntities(data);

      return {
        items: data,
        nextMaxId: extractMaxIdFromLink(response.headers.get('Link')),
      };
    },
    initialPageParam: null,
    // REPLACES: expandPostQuotes "next" logic
    getNextPageParam: (lastPage) => lastPage.nextMaxId ?? undefined,
    enabled: !!postId,
    staleTime: 1000 * 60 * 5, // Quotes are stable for 5 mins
  });
};
/*
const PostQuotesList = ({ postId }) => {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading 
  } = usePostQuotes(postId);

  if (isLoading) return <Spinner />;

  return (
    <div className="quotes-list">
      {data?.pages.map((page) => 
        page.items.map((post) => (
          <PostCard key={post.id} post={post} />
        ))
      )}

      {hasNextPage && (
        <button 
          onClick={() => fetchNextPage()} 
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading more quotes...' : 'Load More'}
        </button>
      )}
    </div>
  );
};

*/
