import {  useMemo } from 'react';
import { makeGetAccount } from '../selectors';
import useBoundStore from '../stores/boundStore';

/** Get the logged-in account from the store, if any. */
export const useOwnAccount = () => {
  const getAccount = useMemo(() => makeGetAccount(), []);

  const account = useBoundStore((state) =>  {
    const { me } = state.auth;

    if (typeof me === 'string') {
      return getAccount(state, me);
    }
  });

  return { account: account || undefined };
};
