import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../../../api/client";

export const useAliasActions = () => {
  const queryClient = useQueryClient();

  const handleAlias = useMutation({
    mutationFn: async ({ account, method }) => {
      const isDelete = method === 'DELETE';
      
      // Feature check (Logic from your thunk)
      const features = queryClient.getQueryData(['instance'])?.kollective?.metadata?.features || [];
      const hasAccountMoving = features.includes('account_moving');

      if (!hasAccountMoving) {
        // Fallback: V1 Update Credentials (also_known_as)
        const me = queryClient.getQueryData(['accounts', 'me']);
        const currentAKA = me?.kollective?.also_known_as || [];
        const apId = account.kollective?.ap_id;
        
        const nextAKA = isDelete 
          ? currentAKA.filter(id => id !== account) 
          : [...currentAKA, apId];

        return api.patch('/api/v1/accounts/update_credentials', { also_known_as: nextAKA });
      }

      // Kollective Native API
      const options = isDelete 
        ? { data: { alias: account } } 
        : { alias: account.acct };

      return api.request(method, '/api/kollective/aliases', options);
    },
    onSuccess: (_, variables) => {
      toast.success(variables.method === 'DELETE' ? "Alias removed" : "Alias added");
      queryClient.invalidateQueries({ queryKey: ['accounts', 'aliases'] });
      queryClient.invalidateQueries({ queryKey: ['accounts', 'me'] });
    }
  });

  return { handleAlias };
};

