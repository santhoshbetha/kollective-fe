import { useInfiniteQuery, useMutation } from '@tanstack/react-query';

import { useApi } from '../hooks/useApi.js';
import useBoundStore from '../stores/boundStore.js';
import { removePageItem } from '../utils/queries.js';

const SuggestionKeys = {
  suggestions: ['suggestions'],
  localSuggestions: ['suggestions', 'local'],
};

const useSuggestions = (opts) => {
  const api = useApi();
  const local = opts?.local ?? false;

  const getV2Suggestions = async (pageParam) => {
    const endpoint = pageParam?.link || (local ? '/api/v2/ditto/suggestions/local' : '/api/v2/suggestions');
    // api.get returns parsed JSON
    const data = await api.get(endpoint);
    const accounts = Array.isArray(data) ? data.map(({ account }) => account) : [];
    const accountIds = accounts.map((account) => account.id);

    try {
      useBoundStore.getState().importFetchedAccounts(accounts);
    } catch (e) {
      console.debug('importFetchedAccounts failed', e);
    }

    try {
      useBoundStore.getState().accounts.fetchRelationships(accountIds);
    } catch (e) {
      console.debug('fetchRelationships failed', e);
    }

    return {
      result: Array.isArray(data) ? data.map((x) => ({ ...x, account: x.account.id })) : [],
      link: undefined,
      hasMore: false,
    };
  };

  const result = useInfiniteQuery({
    queryKey: local ? SuggestionKeys.localSuggestions : SuggestionKeys.suggestions,
    queryFn: ({ pageParam }) => getV2Suggestions(pageParam),
    keepPreviousData: true,
    initialPageParam: undefined,
    getNextPageParam: (config) => {
      if (config?.hasMore) {
        return { link: config?.link };
      }
    },
  });

  const data = result.data?.pages.reduce(
    (prev, curr) => [...prev, ...curr.result],
    [],
  );

  return {
    ...result,
    data: data || [],
  };
};

const useDismissSuggestion = () => {
  const api = useApi();

  return useMutation({
    mutationFn: (accountId) => api.delete(`/api/v1/suggestions/${accountId}`),
    onMutate(accountId) {
      removePageItem(SuggestionKeys.suggestions, accountId, (o, n) => o.account === n);
    },
  });
};

function useOnboardingSuggestions() {
  const api = useApi();

  const getV2Suggestions = async (pageParam) => {
    const link = pageParam?.link || '/api/v2/suggestions';
    const data = await api.get(link);
    const accounts = Array.isArray(data) ? data.map(({ account }) => account) : [];
    const accountIds = accounts.map((account) => account.id);
    try {
      useBoundStore.getState().importFetchedAccounts(accounts);
    } catch (e) {
      console.debug('importFetchedAccounts failed', e);
    }
    try {
      useBoundStore.getState().relationships.fetchRelationships(accountIds);
    } catch (e) {
      console.debug('fetchRelationships failed', e);
    }

    return {
      data: Array.isArray(data) ? data : [],
      link: undefined,
      hasMore: false,
    };
  };

  const result = useInfiniteQuery({
    queryKey: ['suggestions', 'v2'],
    queryFn: ({ pageParam }) => getV2Suggestions(pageParam),
    keepPreviousData: true,
    initialPageParam: { link: undefined },
    getNextPageParam: (config) => {
      if (config.hasMore) {
        return { link: config.link };
      }

      return undefined;
    },
  });

  const data = result.data?.pages.reduce(
    (prev, curr) => [...prev, ...curr.data],
    [],
  );

  return {
    ...result,
    data,
  };
}


export { useOnboardingSuggestions, useSuggestions, useDismissSuggestion };