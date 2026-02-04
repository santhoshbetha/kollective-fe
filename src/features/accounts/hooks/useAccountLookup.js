import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useStatusImporter } from '../hooks/useStatusImporter';

export const useAccountLookup = (acct) => {
  const { importAccount } = useStatusImporter();

  return useQuery({
    // The queryKey uniquely identifies the lookup by the handle (e.g., user@domain)
    queryKey: ['accounts', 'lookup', acct],
    queryFn: async ({ signal }) => {
      // 1. Fetch the account by its handle
      const response = await api.get('/api/v1/accounts/lookup', {
        params: { acct },
        signal, // TanStack Query provides this for automatic cancellation
      });
      
      const account = response.data;

      // 2. SIDE-LOADING: Seed the global account cache
      // This ensures that navigating to the profile via ID is instant later
      if (account && account.id) {
        importAccount(account);
      }

      return account;
    },
    // Only run if the acct string is not empty
    enabled: !!acct,
    // Lookups for handles are generally stable
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/*
const AccountByHandle = ({ handle }) => {
  const { data: account, isLoading, isError } = useAccountLookup(handle);

  if (isLoading) return <LoadingSpinner />;
  if (isError || !account) return <NotFound />;

  // Redirect or render the profile
  return <AccountProfile id={account.id} />;
};
*/