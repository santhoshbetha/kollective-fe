import { useMemo } from 'react';

import { ApiClient } from '../api/apiClient.js';
//import * as BuildConfig from 'soapbox/build-config.ts';

import useBoundStore from '../stores/boundStore.js';
import { useOwnAccount } from './useOwnAccount.ts';

export function useApi() { // san this backend
  const { account } = useOwnAccount();
  const authUserUrl = useBoundStore((state) => state.auth.me);
  const accessToken = useBoundStore((state) => account ? state.auth.users[account.url]?.access_token : undefined);

  return useMemo(() => {
    const baseUrl = new URL((typeof window !== 'undefined' ? import.meta.env.VITE_BACKEND_URL : undefined) || account?.url || authUserUrl || (typeof window !== 'undefined' ? location.origin : '')).origin;
    return new ApiClient(baseUrl, accessToken, fetch);
  }, [account, authUserUrl, accessToken]);
}