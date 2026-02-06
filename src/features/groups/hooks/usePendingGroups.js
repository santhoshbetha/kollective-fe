import { useInfiniteEntities } from '../../../hooks/useInfiniteEntities';
import { useOwnAccount } from '../../accounts/hooks/useOwnAccount'; // Assuming this is migrated

export function usePendingGroups() {
  const api = useApi();
  const features = useFeatures();
  const { account } = useOwnAccount();

  // The Query Key includes the account ID to ensure the list is unique to the user
  const queryKey = ['groups', 'pending', account?.id];

  const query = useInfiniteEntities(
    queryKey,
    () => api.get('/api/v1/groups', { params: { pending: true } }),
    {
      // Only fetch if the user is logged in AND the feature is enabled
      enabled: !!account?.id && !!features.groupsPending,
      // Pending statuses might change if an admin approves while browsing
      staleTime: 1000 * 60 * 2, // 2 minutes
    }
  );

  return {
    groups: query.data?.pages.flatMap(page => page.items) ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    refetch: query.refetch,
  };
}
