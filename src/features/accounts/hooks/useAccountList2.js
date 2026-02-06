import { useMemo } from 'react';
import { useInfiniteEntities } from '../../../hooks/useInfiniteEntities';
import { useRelationships } from './useRelationships'; // Your other TanStack hook

export function useAccountList(listKey, entityFn, opts = {}) {
  // 1. Fetch the list of accounts using the infinite query
  const query = useInfiniteEntities(['accounts', ...listKey], entityFn, opts);

  // 2. Flatten all pages of accounts into one array
  const allAccounts = useMemo(() => {
    return query.data?.pages.flatMap(page => page.items) ?? [];
  }, [query.data]);

  // 3. Fetch relationships for all IDs currently in the list
  const accountIds = allAccounts.map(a => a.id);
  const { data: relationships = {} } = useRelationships(listKey, accountIds);

  // 4. Combine them (replaces the manual .map in the Soapbox code)
  const accounts = useMemo(() => {
    return allAccounts.map(account => ({
      ...account,
      relationship: relationships[account.id] || null,
    }));
  }, [allAccounts, relationships]);

  return {
    accounts,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetching: query.isFetching,
    isLoading: query.isLoading, // true only on first load
    isError: query.isError,
    totalCount: query.data?.pages?.[0]?.totalCount,
  };
}
