export const useAddFilter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (phrase) => api.post('/api/v1/filters', { phrase, context: ['home', 'public'] }),
    onSuccess: () => {
      // This triggers all useTimeline hooks to re-filter their cached data!
      queryClient.invalidateQueries({ queryKey: ['filters'] });
    }
  });
};
/*
Why this is a "Clean" Migration:

    1. Referential Integrity: The select function is memoized by TanStack Query. 
    If the data hasn't changed and the filters haven't changed, the component won't re-render.
    2. No Component Bloat: Your StatusCard.js doesn't need to know about filters. 
    If a status is muted, it simply doesn't exist in the data array passed to the component.
    3. Cross-Timeline Consistency: Adding a filter once instantly cleans up your Home feed, Notifications, 
    and Public timeline simultaneously.
*/

//==================================================================================
//Mute Hashtag
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { toast } from '@/components/Toast';

export const useMuteHashtag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagName) => {
      // Create a filter that applies to 'home' and 'public' timelines
      return api.post('/api/v1/filters', {
        phrase: `#${tagName.replace('#', '')}`,
        context: ['home', 'public', 'notifications'],
        irreversible: true,
        whole_word: true,
      });
    },
    onSuccess: () => {
      // Invalidate both filters and timelines to hide the newly muted tag
      queryClient.invalidateQueries({ queryKey: ['filters'] });
      queryClient.invalidateQueries({ queryKey: ['statuses'] });
      toast.success("Hashtag muted and hidden from your feed.");
    },
  });
};
/*
const TagPreview = ({ tag }) => {
  const { mutate: muteTag, isPending } = useMuteHashtag();

  return (
    <div className="tag-preview-actions">
      {/* Existing Follow button... *//*}
      
      <button 
        className="btn-text btn-danger"
        onClick={() => muteTag(tag.name)}
        disabled={isPending}
      >
        {isPending ? 'Muting...' : 'Mute #Tag'}
      </button>
    </div>
  );
};

*/
//==================================================================================
//Filter Management

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useFilterActions = () => {
  const queryClient = useQueryClient();

  const deleteFilter = useMutation({
    mutationFn: (id) => api.delete(`/api/v1/filters/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filters'] });
      // Invalidate statuses to show posts that were previously hidden
      queryClient.invalidateQueries({ queryKey: ['statuses'] });
    }
  });

  return { deleteFilter };
};
/*
const FilterManagement = () => {
  const { data: filters, isLoading } = useFilters();
  const { deleteFilter } = useFilterActions();

  if (isLoading) return <div className="skeleton" />;

  return (
    <div className="filter-manager">
      <h3>Muted Keywords & Hashtags</h3>
      {filters?.map(filter => (
        <div key={filter.id} className="filter-card">
          <div>
            <strong>{filter.phrase}</strong>
            <small>Context: {filter.context.join(', ')}</small>
          </div>
          <button 
            onClick={() => deleteFilter.mutate(filter.id)}
            disabled={deleteFilter.isPending}
          >
            {deleteFilter.isPending ? 'Removing...' : 'Remove'}
          </button>
        </div>
      ))}
    </div>
  );
};
Source of Truth: By invalidating ['statuses'] upon deleting a filter, the TanStack Query Cache refetches your timeline. Posts from the unmuted hashtag will reappear instantly TanStack Query Invalidation.
Declarative UI: You don't need a FILTER_DELETE_SUCCESS action. The Mutation handles the lifecycle, and the UI reacts to the invalidated cache.
Persistence: Filters are stored on the server, so your Kollective-FE settings stay in sync across desktop and mobile.

*/

