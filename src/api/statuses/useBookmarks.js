
import { useEntities } from '../../entity-store/hooks/useEntities';
import { useApi } from '../../hooks/useApi';
import { useFeatures } from '../../hooks/useFeatures';
import { statusSchema } from '../../schemas';

/**
 * Get all the statuses the user has bookmarked.
 * https://docs.joinmastodon.org/methods/bookmarks/#get
 * GET /api/v1/bookmarks
 * TODO: add 'limit'
 */
function useBookmarks() {
  const api = useApi();
  const features = useFeatures();

  const { entities, ...result } = useEntities(
    ["Statuses", 'bookmarks'],
    () => api.get('/api/v1/bookmarks'),
    { enabled: features.bookmarks, schema: statusSchema },
  );

  const bookmarks = entities;

  return {
    ...result,
    bookmarks,
  };
}

export { useBookmarks };