import { useMutation, useQuery } from '@tanstack/react-query';

import { useApi } from '../../hooks/useApi.js';
import { queryClient } from '../../queries/client.js';
import { adminRuleSchema } from '../../schemas/rule.js';

const useRules = () => {
  const api = useApi();

  const getRules = async () => {
    const response = await api.get('/api/v1/pleroma/admin/rules');
    const data = await response.json();

    const normalizedData = data.map((rule) => adminRuleSchema.parse(rule));
    return normalizedData;
  };

  const result = useQuery({
    queryKey: ['admin', 'rules'],
    queryFn: getRules,
    placeholderData: [],
  });

  const {
    mutate: createRule,
    isPending: isCreating,
  } = useMutation({
    mutationFn: (params) => api.post('/api/v1/pleroma/admin/rules', params),
    retry: false,
    onSuccess: async (response) => {
      const data = await response.json();
      return queryClient.setQueryData(['admin', 'rules'], (prevResult) =>
        [...(prevResult ?? []), adminRuleSchema.parse(data)],
      );
    },
  });

  const {
    mutate: updateRule,
    isPending: isUpdating,
  } = useMutation({
    mutationFn: ({ id, ...params }) => api.patch(`/api/v1/pleroma/admin/rules/${id}`, params),
    retry: false,
    onSuccess: async (response) => {
      const data = await response.json();
      return queryClient.setQueryData(['admin', 'rules'], (prevResult) =>
        (prevResult ?? []).map((rule) => rule.id === data.id ? adminRuleSchema.parse(data) : rule),
      );
    },
  });

  const {
    mutate: deleteRule,
    isPending: isDeleting,
  } = useMutation({
    mutationFn: (id) => api.delete(`/api/v1/pleroma/admin/rules/${id}`),
    retry: false,
    onSuccess: (_, id) =>
      queryClient.setQueryData(['admin', 'rules'], (prevResult) =>
        (prevResult ?? []).filter(({ id: ruleId }) => ruleId !== id),
      ),
  });

  return {
    ...result,
    createRule,
    isCreating,
    updateRule,
    isUpdating,
    deleteRule,
    isDeleting,
  };
};

export { useRules };
