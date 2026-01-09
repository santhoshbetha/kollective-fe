import { useQuery } from '@tanstack/react-query';

import useBoundStore from '../stores/boundStore.js';
import { useApi } from '../hooks/useApi.js';
import { normalizeTag } from '../normalizers/tag.js';

export default function useTrends() {
  const api = useApi();

  const getTrends = async () => {
    const data = await api.get('/api/v1/trends');

    const root = useBoundStore.getState();
    if (root?.trends && typeof root.trends.fetchTrendsSuccess === 'function') {
      try {
        root.trends.fetchTrendsSuccess(data);
      } catch (e) {
        console.error('fetchTrendsSuccess failed', e);
      }
    }

    const normalizedData = Array.isArray(data) ? data.map((tag) => normalizeTag(tag)) : [];
    return normalizedData;
  };

  const result = useQuery({
    queryKey: ['trends'],
    queryFn: getTrends,
    placeholderData: [],
    staleTime: 600000, // 10 minutes
  });

  return result;
}
