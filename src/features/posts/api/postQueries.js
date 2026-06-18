import { queryOptions } from '@tanstack/react-query';
import api from '../../../api/clientN';
import { fetchPost } from './posts';
import { postKeys } from '../../../queries/keys';

export const postQueries = {
  // Single post detail
  detail: (postId) => queryOptions({
    // We keep the key simple here; specific overrides happen in the hook
    queryKey: postKeys.detail(postId),
    queryFn: () => fetchPost(postId),
    staleTime: 1000 * 60 * 5,
    enabled: !!postId,
  }),
  
  // Timeline lists (home, public, local)
  timeline: (type, params = {}) => queryOptions({
    queryKey: postKeys.list(type, params),
    queryFn: () => api.get(`/api/v1/timelines/${type}`, { params }).then(res => res.data),
  }),

  // Kollective-specific post context (replies/thread)
  context: (id) => queryOptions({
    queryKey: postKeys.context(id),
    queryFn: () => api.get(`/api/v1/posts/${id}/context`).then(res => res.data),
  })
};