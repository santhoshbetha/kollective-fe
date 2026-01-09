import { useEntity } from '../../entity-store/hooks/useEntity';
import { useApi } from '../../hooks/useApi';
import { groupTagSchema } from '../../schemas/group-tag';

function useGroupTag(tagId) {
  const api = useApi();

  const { entity: tag, ...result } = useEntity(
    ['GroupTags', tagId],
    () => api.get(`/api/v1/tags/${tagId }`),
    { schema: groupTagSchema },
  );

  return {
    ...result,
    tag,
  };
}

export { useGroupTag };