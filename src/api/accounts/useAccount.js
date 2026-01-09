import { useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import useEntity from '../../entity-store/hooks/useEntity.js';
import { useApi } from '../../hooks/useApi.js';
import { useFeatures } from '../../hooks/useFeatures.js';
import { useLoggedIn } from '../../hooks/useLoggedIn.js';
import { accountSchema } from '../../schemas/account.js';

import { useRelationship } from './useRelationship.js';

function useAccount(accountId, opts = {}) {
  const api = useApi();
  const history = useHistory();
  const features = useFeatures();
  const { me } = useLoggedIn();
  const { withRelationship } = opts;

  const { entity, isUnauthorized, ...result } = useEntity(  //san this 
    ["Accounts", accountId],
    () => api.get(`/api/v1/accounts/${accountId}`),
    { schema: accountSchema, enabled: !!accountId },
  );

  const {
    relationship,
    isLoading: isRelationshipLoading,
  } = useRelationship(accountId, { enabled: withRelationship });

  const isBlocked = relationship?.blocked_by === true;
  const isUnavailable = (me === entity?.id) ? false : (isBlocked && !features.blockersVisible);

  const account = useMemo(
    () => entity ? { ...entity, relationship } : undefined,
    [entity, relationship],
  );

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
    account,
  };
}

export { useAccount };