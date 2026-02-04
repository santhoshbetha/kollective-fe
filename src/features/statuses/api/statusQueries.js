import { queryOptions } from '@tanstack/react-query';
import api from '../../../api/clientN';
import { fetchStatus } from './statuses';
import { statusKeys } from '../../../queries/keys';

export const statusQueries = {
  // Single status detail
  detail: (statusId) => queryOptions({
    // We keep the key simple here; specific overrides happen in the hook
    queryKey: statusKeys.detail(statusId),
    queryFn: () => fetchStatus(statusId),
    staleTime: 1000 * 60 * 5,
    enabled: !!statusId,
  }),
  
  // Timeline lists (home, public, local)
  timeline: (type, params = {}) => queryOptions({
    queryKey: statusKeys.list(type, params),
    queryFn: () => api.get(`/api/v1/timelines/${type}`, { params }).then(res => res.data),
  }),

  // Kollective-specific status context (replies/thread)
  context: (id) => queryOptions({
    queryKey: statusKeys.context(id),
    queryFn: () => api.get(`/api/v1/statuses/${id}/context`).then(res => res.data),
  })
};