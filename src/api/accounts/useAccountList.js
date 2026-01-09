
import { useEntities } from '../../entity-store/hooks/useEntities.js';
import { useApi } from '../../hooks/useApi.js';
import { accountSchema } from '../../schemas/account.js';

import { useRelationships } from './useRelationsships.js';

function useAccountList(listKey, entityFn, opts = {}) {
  const { entities, ...rest } = useEntities(
    ['Accounts', ...listKey],
    entityFn,
    { schema: accountSchema, enabled: opts.enabled },
  );

  const { relationships } = useRelationships(
    listKey,
    (entities || []).map(({ id }) => id),
  );

  const accounts = entities.map((account) => ({
    ...account,
    relationship: relationships[account.id],
  }));

  return { accounts, ...rest };
}

function useBlocks() {
  const api = useApi();
  return useAccountList(['blocks'], () => api.get('/api/v1/blocks'));
}

function useMutes() {
  const api = useApi();
  return useAccountList(['mutes'], () => api.get('/api/v1/mutes'));
}

function useFollowing(accountId) {
  const api = useApi();

  return useAccountList(
    [accountId, 'following'],
    () => api.get(`/api/v1/accounts/${accountId}/following`),
    { enabled: !!accountId },
  );
}

function useFollowers(accountId) {
  const api = useApi();

  return useAccountList(
    [accountId, 'followers'],
    () => api.get(`/api/v1/accounts/${accountId}/followers`),
    { enabled: !!accountId },
  );
}

export {
  useAccountList,
  useBlocks,
  useMutes,
  useFollowing,
  useFollowers,
};