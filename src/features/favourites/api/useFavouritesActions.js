import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../../../api/client";

export const useBulkUnfavourite = () => {
  const queryClient = useQueryClient();
  const cacheKey = ['statuses', 'timeline', 'favourites', 'mine'];

  return useMutation({
    // 1. Fire all requests in parallel
    mutationFn: (ids) => 
      Promise.all(ids.map(id => api.post(`/api/v1/statuses/${id}/unfavourite`))),

    // 2. Optimistic Scrub
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: cacheKey });
      const previous = queryClient.getQueryData(cacheKey);

      // Instantly remove all selected IDs from the timeline
      queryClient.setQueryData(cacheKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            items: page.items.filter(status => !ids.includes(status.id))
          }))
        };
      });

      return { previous };
    },

    onSuccess: () => {
      toast.success("Posts removed from favourites");
    },
    
    onError: (err, ids, context) => {
      queryClient.setQueryData(cacheKey, context.previous);
      toast.error("Failed to update some posts.");
    }
  });
};

/*
const FavouritesTimeline = () => {
  const { isSelectionMode, selectedIds, toggleSelectionMode } = useSelectionStore();
  const { mutate: bulkUnfav, isPending } = useBulkUnfavourite();
  const { data } = useFavourites();

  return (
    <div>
      <div className="toolbar">
        <button onClick={toggleSelectionMode}>
          {isSelectionMode ? 'Cancel' : 'Bulk Edit'}
        </button>
        {isSelectionMode && (
          <button 
            disabled={selectedIds.length === 0 || isPending}
            onClick={() => bulkUnfav(selectedIds)}
          >
            Unfavourite ({selectedIds.length})
          </button>
        )}
      </div>

      <div className="timeline">
        {data?.pages.map(page => 
          page.items.map(status => (
            <StatusCard 
              key={status.id} 
              status={status} 
              isSelectable={isSelectionMode}
              isSelected={selectedIds.includes(status.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

*/

