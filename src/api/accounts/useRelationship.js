import { z } from 'zod';
import { useEntity } from '../../entity-store/hooks/useEntity.js';
import { useApi } from '../../hooks/useApi.js';
import { relationshipSchema } from '../../schemas/relationship.js';

function useRelationship(accountId, opts = {}) {
  const api = useApi();
  const { enabled = false } = opts;

  const { entity: relationship, ...result } = useEntity(
    ['Relationships', accountId],
    () => api.get('/api/v1/accounts/relationships', { searchParams: { id: [accountId] } }),
    {
      enabled: enabled && !!accountId,
      schema: z.array(relationshipSchema).nonempty().transform((arr) => arr[0]),
    },
  );

  return { relationship, ...result };
}

export { useRelationship };