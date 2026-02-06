import { useQuery } from "@tanstack/react-query";
import { api } from "../../../api/client";
import { useHistory } from 'react-router-dom';

//useAccount ==> useEntity equivalent
export function useAccount(accountId, opts = {}) {
  const history = useHistory();
  const { me } = useLoggedIn(); // Assuming this is your auth hook

  // 1. Fetch the Account
  const accountQuery = useQuery({
    queryKey: ['accounts', accountId],
    queryFn: () => api.get(`/api/v1/accounts/${accountId}`).then(r => r.json()),
    enabled: !!accountId,
    retry: (failureCount, error) => {
       if (error.status === 401) return false; // Don't retry on auth errors
       return failureCount < 3;
    },
  });

  // 2. Fetch the Relationship (replaces useRelationship)
  const relQuery = useQuery({
    queryKey: ['relationships', accountId],
    queryFn: () => api.get(`/api/v1/accounts/relationships`, { params: { id: [accountId] } }),
    enabled: !!accountId && !!opts.withRelationship,
  });

  // 3. Logic & Derived State
  const isUnauthorized = accountQuery.error?.status === 401;
  const relationship = relQuery.data?.[0];
  const isBlocked = relationship?.blocked_by === true;
  
  // Combine data (replaces useMemo)
  const account = accountQuery.data 
    ? { ...accountQuery.data, relationship } 
    : undefined;

  // Handle Redirect
  if (isUnauthorized) history.push('/login');

  return {
    account,
    isLoading: accountQuery.isLoading,
    isRelationshipLoading: relQuery.isLoading,
    error: accountQuery.error,
    isUnauthorized,
    isUnavailable: me === accountId ? false : isBlocked,
  };
}


