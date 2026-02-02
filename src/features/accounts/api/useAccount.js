// src/features/accounts/api/useAccount.js
//Replaces makeGetAccount, getAccountRelationship, and getAccountMeta
export const useAccount = (accountId) => {
  return useQuery({
    queryKey: ['accounts', 'detail', accountId],
    queryFn: () => api.get(`/api/v1/accounts/${accountId}`).then(res => res.data),
    select: (account) => {
      if (!account) return null;
      // Get the relationship from our dedicated relationship cache
      const relationship = queryClient.getQueryData(['relationships', accountId]);
      
      return {
        ...account,
        relationship,
        // Standardize Pleroma/Mastodon metadata merging
        source: account.source || account.pleroma?.source,
      };
    },
  });
};
