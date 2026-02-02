export const useAliasActions = () => {
  const queryClient = useQueryClient();

  const handleAlias = useMutation({
    mutationFn: async ({ account, method }) => {
      const isDelete = method === 'DELETE';
      
      // Feature check (Logic from your thunk)
      const features = queryClient.getQueryData(['instance'])?.pleroma?.metadata?.features || [];
      const hasAccountMoving = features.includes('account_moving');

      if (!hasAccountMoving) {
        // Fallback: V1 Update Credentials (also_known_as)
        const me = queryClient.getQueryData(['accounts', 'me']);
        const currentAKA = me?.pleroma?.also_known_as || [];
        const apId = account.pleroma?.ap_id;
        
        const nextAKA = isDelete 
          ? currentAKA.filter(id => id !== account) 
          : [...currentAKA, apId];

        return api.patch('/api/v1/accounts/update_credentials', { also_known_as: nextAKA });
      }

      // Pleroma Native API
      const options = isDelete 
        ? { data: { alias: account } } 
        : { alias: account.acct };

      return api.request(method, '/api/pleroma/aliases', options);
    },
    onSuccess: (_, variables) => {
      toast.success(variables.method === 'DELETE' ? "Alias removed" : "Alias added");
      queryClient.invalidateQueries({ queryKey: ['accounts', 'aliases'] });
      queryClient.invalidateQueries({ queryKey: ['accounts', 'me'] });
    }
  });

  return { handleAlias };
};
