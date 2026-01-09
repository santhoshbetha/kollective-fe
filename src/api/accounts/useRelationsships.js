import { ApiResponse } from '../apiResponse.js';
import { useBatchedEntities } from '../../entity-store/hooks/useBatchedEntities.js';
import { useApi } from '../../hooks/useApi.js';
import useLoggedIn from '../../hooks/useLoggedIn.js';
import { relationshipSchema } from '../../schemas/relationship.js';

function useRelationships(listKey, ids) {
  const api = useApi();
  const { isLoggedIn } = useLoggedIn();

  async function fetchRelationships(ids) {
    const results = [];

    for (const chunk of chunkArray(ids, 20)) {
      // `chunk` is an array of ids; many HTTP clients will serialize arrays
      // into repeated query params (id=1&id=2). Pass the array directly.
      const response = await api.get('/api/v1/accounts/relationships', { searchParams: { id: chunk } });
      const json = await response.json();

      results.push(...json);
    }

    return new ApiResponse(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { entityMap: relationships, ...result } = useBatchedEntities(
    ['Relationships', ...listKey],
    ids,
    fetchRelationships,
    { schema: relationshipSchema, enabled: isLoggedIn },
  );

  return { relationships, ...result };
}

function* chunkArray(array, chunkSize) {
  if (chunkSize <= 0) throw new Error('Chunk size must be greater than zero.');

  for (let i = 0; i < array.length; i += chunkSize) {
    yield array.slice(i, i + chunkSize);
  }
}

export { useRelationships };