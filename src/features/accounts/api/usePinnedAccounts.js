import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useStatusImporter } from '../hooks/useStatusImporter';

export const usePinnedAccounts = (accountId) => {
  const { importAccounts } = useStatusImporter();

  return useQuery({
    // Cache is unique to the profile being viewed
    queryKey: ['accounts', accountId, 'pinned'],
    queryFn: async () => {
      const response = await api.get(`/api/v1/pleroma/accounts/${accountId}/endorsements`);
      const data = response.data;

      // SIDE-LOADING: Seed the global account cache
      // This replaces dispatch(importFetchedAccounts(data))
      importAccounts(data);

      return data;
    },
    // Only run if we have an ID
    enabled: !!accountId,
    // Pinned accounts don't change often
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/*
const PinnedAccountsSection = ({ accountId }) => {
  const { data: pinnedAccounts, isLoading, isError } = usePinnedAccounts(accountId);

  if (isLoading) return <LoadingSpinner />;
  if (isError || !pinnedAccounts?.length) return null;

  return (
    <div className="pinned-accounts">
      <h3>Pinned Accounts</h3>
      {pinnedAccounts.map(account => (
        <AccountCard key={account.id} account={account} />
      ))}
    </div>
  );
};

*/
