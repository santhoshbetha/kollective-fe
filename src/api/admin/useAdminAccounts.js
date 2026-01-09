import { useEntities } from '../../entity-store/hooks/useEntities.js';
import { useApi } from '../../hooks/useApi.js';
import { adminAccountSchema } from '../../schemas/admin-account.js';

/** https://docs.joinmastodon.org/methods/admin/accounts/#v1 */
export function useAdminAccounts(filters, limit) {
  const api = useApi();

  const searchParams = new URLSearchParams();

  for (const [name, value] of Object.entries(filters || {})) {
    if (value == null) continue;
    searchParams.append(name, value.toString());
  }

  if (typeof limit === 'number') {
    searchParams.append('limit', limit.toString());
  }

  const { entities, ...rest } = useEntities(
    ['Accounts', searchParams.toString()],
    () => api.get('/api/v1/admin/accounts', { searchParams }),
    { schema: adminAccountSchema.transform(({ account }) => account) },
  );

  return { accounts: entities, ...rest };
}