import { useTransaction } from '../../entity-store/hooks/useTransaction.js';
import { useApi } from '../../hooks/useApi.js';
import useBoundStore from '../../stores/boundStore.js';
import { useLoggedIn } from '../../hooks/useLoggedIn.js';
import { relationshipSchema } from '../../schemas/relationship.js';

function useFollow() {
  const api = useApi();
  const { isLoggedIn } = useLoggedIn();
  const { transaction } = useTransaction();

  function followEffect(accountId) {
    transaction({
      Accounts: {
        [accountId]: (account) => ({
          ...account,
          followers_count: Math.max(0, (account?.followers_count || 0) + 1),
        }),
      },
      Relationships: {
        [accountId]: (relationship) => ({
          ...relationship,
          following: true,
        }),
      },
    });
  }

  function unfollowEffect(accountId) {
    transaction({
      Accounts: {
        [accountId]: (account) => ({
          ...account,
          followers_count: Math.max(0, (account?.followers_count || 0) - 1),
        }),
      },
      Relationships: {
        [accountId]: (relationship) => ({
          ...relationship,
          following: false,
        }),
      },
    });
  }

  async function follow(accountId, options = {}) {
    if (!isLoggedIn) return;
    followEffect(accountId);

    try {
      const response = await api.post(`/api/v1/accounts/${accountId}/follow`, options);
      const result = relationshipSchema.safeParse(await response.json());
      if (result.success) {
        // entities.importEntities signature: (entityType, entities, listKey?, pos?, newState?, overwrite?)
        useBoundStore.getState().entities.importEntities('Relationships', [result.data]);
      }
    } catch (err) {
      void err;
      unfollowEffect(accountId);
    }
  }

  async function unfollow(accountId) {
    if (!isLoggedIn) return;
    unfollowEffect(accountId);

    try {
      await api.post(`/api/v1/accounts/${accountId}/unfollow`);
    } catch (err) {
      void err;
      followEffect(accountId);
    }
  }

  return {
    follow,
    unfollow,
    followEffect,
    unfollowEffect,
  };
}

export { useFollow };