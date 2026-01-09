import { useEntities } from '../../entity-store/hooks/useEntities';
import { useApi } from '../../hooks/useApi';
import normalizeStatus from '../../normalizers/status';
import { toSchema } from '../../utils/normalizers';

const statusSchema = toSchema(normalizeStatus);

function useGroupMedia(groupId) {
  const api = useApi();

  return useEntities(['Statuses', 'groupMedia', groupId], () => {
    return api.get(`/api/v1/timelines/group/${groupId}?only_media=true`);
  }, { schema: statusSchema });
}

export { useGroupMedia };