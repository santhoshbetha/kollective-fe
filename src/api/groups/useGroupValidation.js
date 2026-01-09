import { useQuery } from '@tanstack/react-query';

import { HTTPError } from '../HttpError';
import { useApi } from '../../hooks/useApi';
import { useFeatures } from '../../hooks/useFeatures';

const ValidationKeys = {
  validation: (name) => ['group', 'validation', name],
};

function useGroupValidation(name = '') {
  const api = useApi();
  const features = useFeatures();

  const getValidation = async () => {
    try {
      const response = await api.get('/api/v1/groups/validate', { searchParams: { name } });
      return response.json();
    } catch (e) {
      if (e instanceof HTTPError && e.response.status === 422) {
        return e.response.json();
      }

      throw e;
    }
  };

  const queryInfo = useQuery({
    queryKey: ValidationKeys.validation(name),
    queryFn: getValidation,
    enabled: features.groupsValidation && !!name,
  });

  return {
    ...queryInfo,
    data: {
      ...queryInfo.data,
      isValid: !queryInfo.data?.error,
    },
  };
}

export { useGroupValidation };