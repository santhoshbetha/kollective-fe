import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { useEntityLookup } from '../../entity-store/hooks/useEntityLookup.js';
import { useApi } from '../../hooks/useApi.js';
import { useFeatures } from '../../hooks/useFeatures.js';
import { useLoggedIn } from '../../hooks/useLoggedIn.js';
import { accountSchema } from '../../schemas/account.js';

import { useRelationship } from './useRelationship.js';

function useAccountLookup(acct, opts = {}) {
  const api = useApi();
  const features = useFeatures();
  const history = useHistory();
  const { me } = useLoggedIn();
  const { withRelationship } = opts;

  const { entity: account, isUnauthorized, ...result } = useEntityLookup(
    'Accounts',
    (account) => account.acct.toLowerCase() === acct?.toLowerCase(),
    () => api.get(`/api/v1/accounts/lookup?acct=${encodeURIComponent(acct)}`),
    { schema: accountSchema, enabled: !!acct },
  );

  const {
    relationship,
    isLoading: isRelationshipLoading,
  } = useRelationship(account?.id, { enabled: withRelationship });

  const isBlocked = relationship?.blocked_by === true;
  const isUnavailable = (me === account?.id) ? false : (isBlocked && !features.blockersVisible);

  useEffect(() => {
    if (isUnauthorized) {
      history.push('/login');
    }
  }, [isUnauthorized]);

  return {
    ...result,
    isLoading: result.isLoading,
    isRelationshipLoading,
    isUnauthorized,
    isUnavailable,
    account: account ? { ...account, relationship } : undefined,
  };
}

export { useAccountLookup };