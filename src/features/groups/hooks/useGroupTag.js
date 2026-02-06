import { useQuery } from '@tanstack/react-query';
import api from '../../../api/clientN';
import { groupTagSchema } from '../../../schemas/groupTag';

export function useGroupTag(tagId) {
  //const api = useApi();

  return useQuery({
    // Unique key for this specific group tag
    queryKey: ['group-tags', tagId],

    queryFn: async () => {
      const response = await api.get(`/api/v1/tags/${tagId}`);
      const json = await response.json();
      
      // Validating with the schema from the original code
      return groupTagSchema.parse(json);
    },

    // Guard: Don't attempt to fetch if tagId is undefined or empty
    enabled: !!tagId,

    // Tags usually don't change their metadata (like name) often, 
    // so we can cache this a bit longer than a relationship.
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
