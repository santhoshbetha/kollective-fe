import {  useMemo } from 'react';
import { makeGetAccount } from '../selectors';
import useBoundStore from '../stores/boundStore';

/** Get the logged-in account from the store, if any. */
export const useOwnAccount = () => {
  const getAccount = useMemo(() => makeGetAccount(), []);

  const account = useBoundStore((state) =>  {
    // Handle case where state might be undefined or me slice might not be initialized yet
    if (!state) return undefined;
    
    const meSlice = state.me || {};
    const me = meSlice.me;

    if (typeof me === 'string' && me !== '') {
      return getAccount(state, me);
    }
  });

  return { account: account || undefined };
};
