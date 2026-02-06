import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { relationshipSchema } from '../../../schemas/relationship';
import api from '../../../api/clientN';

// Assuming relationshipSchema is defined elsewhere
// const relationshipSchema = z.object({ ... });

export function useRelationship(accountId, enabled = false) {
  return useQuery({
    // Unique key for this specific relationship
    queryKey: ['relationships', accountId],
    
    queryFn: async () => {
      const response = await api.get(`/api/v1/accounts/relationships`, {
        params: { 'id[]': [accountId] },
      });
      
      const data = await response.json();

      // Validate and return the first item in the array
      return z.array(relationshipSchema)
        .nonempty()
        .transform(arr => arr[0])
        .parse(data);
    },

    // Only run if accountId exists AND the component specifically asks for it
    enabled: !!accountId && enabled,
    
    // Relationships change frequently in social apps, 
    // so we might want a shorter staleTime
    staleTime: 1000 * 60, // 1 minute
  });
}

//function useRelationship(accountId: string | undefined, opts: UseRelationshipOpts = {}) ---> in soapbox
