// src/features/accounts/api/useRelationships.js
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { relationshipSchema } from '../schemas/accountSchemas';
import { chunkArray } from '../../../utils/apiUtils';
import { relationshipSchema } from '../schemas/relationshipSchemas';

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
