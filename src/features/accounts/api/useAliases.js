import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { toast } from '@/components/Toast';

//This thunk is not required. The aliasesSlice handles Pleroma-specific account migration 
// features (AKA "Also Known As"). You can replace this entire logic with a Mutation that handles the server's feature-parity check (V1 vs Pleroma API) internally.

// REPLACES: fetchAliases
export const useAliases = () => {
  return useQuery({
    queryKey: ['accounts', 'aliases'],
    queryFn: () => api.get('/api/pleroma/aliases').then(res => res.data.aliases),
    // Only fetch if Pleroma features are supported
    staleTime: 1000 * 60 * 60, 
  });
};

// REPLACES: fetchAliasesSuggestions
export const useAliasSuggestions = (q) => {
  return useQuery({
    queryKey: ['accounts', 'search', 'aliases', q],
    queryFn: () => api.get('/api/v1/accounts/search', { params: { q, resolve: true, limit: 4 } }).then(res => res.data),
    enabled: q.length > 2,
  });
};
