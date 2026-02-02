import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { accountSchema } from '../schemas/accountSchemas';

export const useSuggestions = () => {
  return useQuery({
    queryKey: ['accounts', 'suggestions'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/suggestions');
      
      // Validate the array of accounts
      return data.map((item) => accountSchema.parse(item.account || item));
    },
    // Suggestions don't change every second; keep them for 5 mins
    staleTime: 1000 * 60 * 5,
  });
};

/*
1. State Decoupling: The "Suggestions List" doesn't need to know if you followed someone. 
It just renders SuggestionItem. The SuggestionItem listens to the Relationship Cache. 
When the mutation updates the relationship, the suggestion component reacts automatically.
2. No Duplicate Data: You don't store the "following" boolean in two different Redux slices. 
The Relationship Cache is the single source of truth.
3. Automatic Cleanup: Using staleTime ensures that if a user navigates away and back, 
they don't see the same "stale" suggestions they already interacted with.
*/
export const useDismissSuggestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId) => api.delete(`/api/v1/suggestions/${accountId}`),
    onMutate: async (accountId) => {
      // Remove from the suggestions cache immediately
      queryClient.setQueryData(['accounts', 'suggestions'], (old) => 
        old?.filter((acc) => acc.id !== accountId)
      );
    }
  });
};


/*
const SuggestionItem = ({ account }) => {
  // Subscribes to the global relationship state for THIS account
  const { data: rel } = useRelationship(account.id);
  const { followMutation } = useAccountActions();

  // If we just followed them, we might want to hide the suggestion 
  // or change the button state instantly.
  if (rel?.following) return null; 

  return (
    <div className="suggestion-card">
      <img src={account.avatar} alt={account.username} />
      <div>
        <p>{account.display_name}</p>
        <button onClick={() => followMutation.mutate(account.id)}>
          Follow
        </button>
      </div>
    </div>
  );
};
*/
//==================================================================================
// src/features/accounts/api/useSuggestions.js
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useStatusImporter } from '@/features/statuses/hooks/useStatusImporter';

//This hook handles the logic of both V1 and V2 endpoints.
//  It uses the importAccounts helper to seed the global account cache.
export const useSuggestions = () => {
  const { importAccounts } = useStatusImporter();

  return useInfiniteQuery({
    queryKey: ['accounts', 'suggestions'],
    queryFn: async ({ pageParam }) => {
      // Logic Port: V2 returns objects { source, account }, V1 returns accounts
      // Try V2 first, fallback to V1 if necessary
      const response = await api.get(pageParam || '/api/v2/suggestions', {
        params: pageParam ? {} : { limit: 20 }
      });

      const data = response.data;
      const isV2 = data.length > 0 && 'account' in data[0];
      const accounts = isV2 ? data.map(item => item.account) : data;

      // SIDE-LOADING: Seed global account cache
      importAccounts(accounts);

      return {
        items: data, // Keep raw format for the UI (V2 has 'source' context)
        next: extractMaxIdFromLink(response.headers.get('Link')),
        isV2
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.next ?? undefined,
    staleTime: 1000 * 60 * 30, // Suggestions are stable
  });
};


