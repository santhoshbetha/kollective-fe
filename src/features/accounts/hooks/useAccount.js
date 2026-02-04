import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../api/client";

//Replaces makeGetAccount, getAccountRelationship, and getAccountMeta
export const useAccount = (accountId) => {
  const queryClient = useQueryClient();
  
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
        // Standardize Kollective/Mastodon metadata merging
        source: account.source || account.kollective?.source,
      };
    },
  });
};

