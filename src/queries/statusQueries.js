import { queryOptions } from '@tanstack/react-query';
import api from '../api/client';
import { statusKeys } from './keys';

export const statusQueries = {
  // A single status detail
  detail: (id) => queryOptions({
    queryKey: statusKeys.detail(id),
    queryFn: () => api.get(`/api/v1/statuses/${id}`).then(res => res.data),
    staleTime: 1000 * 60 * 5, // 5 minutes
  }),

  // A specific timeline (home, public, etc)
  timeline: (type) => queryOptions({
    queryKey: statusKeys.list(type),
    queryFn: () => api.get(`/api/v1/timelines/${type}`).then(res => res.data),
  })
};

/*
import { useQuery } from '@tanstack/react-query';
import { statusQueries } from '@/queries/statusQueries';

const StatusDetail = ({ id }) => {
  // Clean, readable, and type-safe
  const { data: status, isLoading } = useQuery(statusQueries.detail(id));

  if (isLoading) return <Spinner />;
  return <div>{status.content}</div>;
};
*/
