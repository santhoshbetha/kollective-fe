// src/features/accounts/api/useRelationships.js
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { relationshipSchema } from '../../../schemas/relationship';
import { chunkArray } from '../../../utils/apiUtils';

export const useRelationships = (accountIds) => {
  const queryClient = useQueryClient();

  return useQuery({
    // Stable key based on sorted IDs to ensure consistent caching
    queryKey: ['relationships', [...accountIds].sort()],
    
    queryFn: async () => {
      // 1. Chunking Logic (Ported from your thunk)
      const results = [];
      const chunks = chunkArray(accountIds, 20);

      for (const ids of chunks) {
        const { data } = await api.get('/api/v1/accounts/relationships', {
          params: { id: ids },
        });
        
        const validated = relationshipSchema.array().parse(data);
        results.push(...validated);

        // 2. SIDE-LOADING: Seed individual relationship caches
        // This makes useRelationship(singleId) instant later
        validated.forEach((rel) => {
          queryClient.setQueryData(['relationship', rel.id], rel);
        });
      }

      return results;
    },
    // Only run if we have IDs and are logged in
    enabled: accountIds.length > 0,
    staleTime: 1000 * 60 * 30, // Relationships are stable; keep for 30 mins
  });
};

export const useRelationship = (accountId) => {
  return useQuery({
    queryKey: ['relationships', accountId],
    queryFn: () => api.get('/api/v1/accounts/relationships', { 
      params: { id: [accountId] } 
    }).then(res => res.data[0]),
    enabled: !!accountId,
    staleTime: 1000 * 60 * 30, // Relationships are stable; cache for 30m
  });
};

//======================
// src/features/accounts/api/useRelationships.js
import { relationshipSchema } from '../schemas/relationshipSchemas';

export const useRelationships = (accountIds) => {
  return useQuery({
    queryKey: ['relationships', accountIds.sort()],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/accounts/relationships', {
        params: { id: accountIds }
      });
      // Validate and transform the entire array
      return z.array(relationshipSchema).parse(data);
    },
    enabled: accountIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

//=================================================================================
import { useQuery, useQueryClient } from '@tanstack/react-query';

// write a simple useRelationship(accountId) hook (singular) that pulls this data for a single Follow button

//simple useRelationship(accountId) hook (singular) that pulls this data for a single Follow button

//To make your Follow button work, we’ll create a hook that "listens" to the cache.
//Because useBatchedEntities has already "seeded" the relationships into the cache under the key 
// ['relationship', listKey, id], this hook will return that data instantly if it's available.

/**
 * Retrieves relationship status for a single account.
 * It primarily looks in the cache seeded by useBatchedEntities.
 */
export const useRelationship = (accountId, listKey = 'home') => {
  const queryClient = useQueryClient();

  return useQuery({
    // Must match the key format used in useBatchedEntities
    queryKey: ['relationship', listKey, accountId],
    
    // Fallback: If not in cache, fetch it individually
    queryFn: async () => {
      const response = await api.get('/api/v1/accounts/relationships', { 
        searchParams: { 'id[]': accountId } 
      });
      const json = await response.json();
      return json[0] || null;
    },

    // This is the magic: it looks for the data already seeded by the batcher
    initialData: () => {
      return queryClient.getQueryData(['relationship', listKey, accountId]);
    },

    enabled: !!accountId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};


//===========================================================


