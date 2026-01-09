import { useMutation } from '@tanstack/react-query';

import useBoundStore from '../stores/boundStore.js';
import { useApi } from '../hooks/useApi.js';

const useFetchRelationships = () => {
  const api = useApi();

  return useMutation({
    mutationFn: ({ accountIds }) => {
      const ids = (accountIds || []).map((id) => `id[]=${encodeURIComponent(id)}`).join('&');
      const qs = ids.length > 0 ? `?${ids}` : '';
      return api.get(`/api/v1/accounts/relationships${qs}`);
    },
    onSuccess(data) {
      // ApiClient.get returns parsed JSON, so pass it through directly
      const root = useBoundStore.getState();
      if (root?.relationships && typeof root.relationships.fetchRelationshipsSuccess === 'function') {
        root.relationships.fetchRelationshipsSuccess(data);
      }
    },
    onError(error) {
      const root = useBoundStore.getState();
      if (root?.relationships && typeof root.relationships.fetchRelationshipsFail === 'function') {
        root.relationships.fetchRelationshipsFail(error);
      } else {
        console.error('useFetchRelationships error', error);
      }
    },
  });
};

export { useFetchRelationships };