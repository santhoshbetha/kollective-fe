import { useTransaction } from '../../entity-store/hooks/useTransaction.js';
import { useApi } from '../../hooks/useApi.js';
import { useGetState } from '../../hooks/useGetState.js';
import { accountIdsToAccts } from '../../selectors.js';

function useSuggest() {
  const api = useApi();
  const getState = useGetState();
  const { transaction } = useTransaction();

  function suggestEffect(accountIds, suggested) {
    const updater = (account) => ({
      ...account,
      pleroma: {
        ...(account?.pleroma || {}),
        is_suggested: suggested,
      },
    });

    transaction({
      Accounts: accountIds.reduce(
        (result, id) => ({ ...result, [id]: updater }),
        {},
      ),
    });
  }

  async function suggest(accountIds, callbacks) {
    const accts = accountIdsToAccts(getState(), accountIds);
    suggestEffect(accountIds, true);
    try {
      await api.patch('/api/v1/pleroma/admin/users/suggest', { nicknames: accts });
      callbacks?.onSuccess?.();
    } catch (err) {
      void err;
      callbacks?.onError?.(err);
      suggestEffect(accountIds, false);
    }
  }

  async function unsuggest(accountIds, callbacks) {
    const accts = accountIdsToAccts(getState(), accountIds);
    suggestEffect(accountIds, false);
    try {
      await api.patch('/api/v1/pleroma/admin/users/unsuggest', { nicknames: accts });
      callbacks?.onSuccess?.();
    } catch (err) {
      void err;
      callbacks?.onError?.(err);
      suggestEffect(accountIds, true);
    }
  }

  return {
    suggest,
    unsuggest,
  };
}

export { useSuggest };