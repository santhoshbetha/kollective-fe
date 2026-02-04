import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useFilters } from '@/features/filters/api/useFilters';
import { checkFiltered } from '../../filters/utils/filterHelpers';
import { fetchStatus } from './statuses';

export const useStatusN = (statusId, conversationId, expectedUsername) => {
  const queryClient = useQueryClient();
  const { data: filters } = useFilters();
  //const me = useAuthStore(s => s.me?.id);

  return useQuery({
    // If no conversationId, use a fallback key to avoid 'undefined' in the array
    queryKey: conversationId 
      ? ['status', statusId, conversationId] 
      : ['status', statusId],

    queryFn: () => fetchStatus(statusId),

    // 2. The Pulling Logic (Instant UI)
    initialData: () => {
      // 1. Only try to pull from context if we HAVE a conversationId
      if (conversationId) {
        const context = queryClient.getQueryData(['status', 'context', conversationId]);
        return context?.allStatuses.get(statusId);
      }
      
      // 2. Optional: Try to find the data in ANY existing status query 
      // (Useful if the user navigated from a different list)
      return queryClient.getQueryData(['status', statusId]);
    },

    // 3. The Transformation Logic (Filters & Validation)
    // REPLACES: The 'combiner' logic from your selector
    select: (status) => {
      if (!status || !status.account) return null;

      // Username Validation
      if (expectedUsername && status.account.acct !== expectedUsername) {
        return null;
      }

      // Handle Reblog Nesting
      // If it's a reblog, the 'reblog' property is already part of the object
      const targetStatus = status.reblog || status;
      
      // Filtering Logic
      //if (status.account.id !== me) {
      const filtered = checkFiltered(targetStatus.search_index || '', filters);
      // }

      return {
        ...status,
        filtered,
        reblog: status.reblog || null,
      };
    },

    enabled: !!statusId,
    staleTime: 1000 * 60 * 5,
  });
};
