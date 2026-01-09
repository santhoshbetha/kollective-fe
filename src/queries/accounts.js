import { useMutation } from '@tanstack/react-query';

import useBoundStore from '../stores/boundStore';
import { useApi } from '../hooks/useApi';
import { useOwnAccount } from '../hooks/useOwnAccount';

const useUpdateCredentials = () => {
  const { account } = useOwnAccount();
  const api = useApi();

  return useMutation({
    mutationFn: (data) => api.patch('/api/v1/accounts/update_credentials', data),
    onMutate(variables) {
      const cachedAccount = account;
      useBoundStore.getState().accountsMeta.patchMeSuccess({ ...account, ...variables });
      useBoundStore.getState().compose.patchMeSuccess({ ...account, ...variables });
      useBoundStore.getState().me.patchMeSuccess({ ...account, ...variables });

      return { cachedAccount };
    },
    async onSuccess(response) {
      useBoundStore.getState().accountsMeta.patchMeSuccess(await response.json());
      useBoundStore.getState().compose.patchMeSuccess(await response.json());
      useBoundStore.getState().me.patchMeSuccess(await response.json());
      //toast.success('Chat Settings updated successfully');//TODO later
    },
    onError(_error, _variables, context) {
      //toast.error('Chat Settings failed to update.');//TODO later
      useBoundStore.getState().accountsMeta.patchMeSuccess(context.cachedAccount);
      useBoundStore.getState().compose.patchMeSuccess(context.cachedAccount);
      useBoundStore.getState().me.patchMeSuccess(context.cachedAccount);
    },
  });
};

export { useUpdateCredentials };