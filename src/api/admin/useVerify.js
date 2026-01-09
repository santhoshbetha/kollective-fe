import { useTransaction } from '../../entity-store/hooks/useTransaction.js';

import { useApi } from '../../hooks/useApi.js';
import { useGetState } from '../../hooks/useGetState.js';
import { accountIdsToAccts } from '../../selectors.js';

function useVerify() {
  const api = useApi();
  const getState = useGetState();
  const { transaction } = useTransaction();

  function verifyEffect(accountIds, verified) {
    const updater = (account) => {
      const existingPleroma = account?.pleroma || {};
      const oldTags = Array.isArray(existingPleroma.tags) ? existingPleroma.tags : [];
      const tags = oldTags.filter((tag) => tag !== 'verified');
      if (verified) tags.push('verified');

      return {
        ...account,
        pleroma: {
          ...existingPleroma,
          tags,
        },
        verified,
      };
    };

    transaction({
      Accounts: accountIds.reduce(
        (result, id) => ({ ...result, [id]: updater }),
        {},
      ),
    });
  }

  async function verify(accountIds, callbacks) {
    const accts = accountIdsToAccts(getState(), accountIds);
    verifyEffect(accountIds, true);
    try {
      await api.put('/api/v1/pleroma/admin/users/tag', { nicknames: accts, tags: ['verified'] });
      callbacks?.onSuccess?.();
    } catch (err) {
      void err;
      callbacks?.onError?.(err);
      verifyEffect(accountIds, false);
    }
  }

  async function unverify(accountIds, callbacks) {
    const accts = accountIdsToAccts(getState(), accountIds);
    verifyEffect(accountIds, false);
    try {
      await api.request('DELETE', '/api/v1/pleroma/admin/users/tag', { nicknames: accts, tags: ['verified'] });
      callbacks?.onSuccess?.();
    } catch (err) {
      void err;
      callbacks?.onError?.(err);
      verifyEffect(accountIds, true);
    }
  }

  return {
    verify,
    unverify,
  };
}

export { useVerify };