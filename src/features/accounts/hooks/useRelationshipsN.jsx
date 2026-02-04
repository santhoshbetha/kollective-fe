import { fetchRelationships } from './accounts';
import { relationshipSchema } from '../schemas/relationshipSchemas';
import { useBatchedEntities } from '@/hooks/useBatchedEntities';

// src/hooks/useRelationships.js
export function useRelationships(listKey, ids) {
  const { isLoggedIn } = useLoggedIn();

  return useBatchedEntities(
    ['relationship', ...listKey], // Key format: ['relationship', id]
    ids,
    (missingIds) => fetchRelationships(missingIds),
    { 
      schema: relationshipSchema, 
      enabled: isLoggedIn 
    }
  );
}

/*
import { useTimeline } from '../hooks/useStatuses';
import { useRelationships } from '../../accounts/hooks/useRelationships';
import { StatusItem } from './StatusItem';

export const Timeline = ({ type = 'home' }) => {
  // 1. Fetch the statuses (e.g., 20 posts)
  const { data, isLoading } = useTimeline(type);

  // 2. Collect all unique account IDs from the current page
  const accountIds = useMemo(() => {
    if (!data) return [];
    // Flatten pages (if infinite) and get account IDs
    const allStatuses = data.pages.flat();
    return [...new Set(allStatuses.map(s => s.account.id))];
  }, [data]);

  // 3. THE MAGIC: Batch fetch relationships for all these IDs
  // This doesn't return anything we need to map over here; 
  // it just "warms up" the cache for the children.
  useRelationships([type], accountIds);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col">
      {data.pages.map((page) => 
        page.map(status => (
          <StatusItem 
            key={status.id} 
            statusId={status.id} 
            conversationId={null} // Timeline view
          />
        ))
      )}
    </div>
  );
};

*/