// Slice for lightweight per-account metadata (counts, lastFetch timestamps, cached flags)
// Factory signature follows the project's convention: (setScoped, getScoped, rootSet, rootGet)
import { accountSchema } from "../../schemas";

export function createAccountsMetaSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    
    fetchMeSuccess(me) {
       setScoped((state) => { 
            const result = accountSchema.safeParse(me);
            if (!result.success) {
                return state;
            }

            const account = result.data;
            const existing = state[account.id];
            state[account.id] = {
                kollective: account.kollective ?? existing?.kollective,
                source: account.source ?? existing?.source,
            }
            return state;
       });
    },

    verifyCredentialsSuccess(account) {
        setScoped((state) => { 
            const result = accountSchema.safeParse(account);
            if (!result.success) {
                return state;
            }

            const acct = result.data;
            const existing = state[acct.id];
            state[acct.id] = {
                kollective: acct.kollective ?? existing?.kollective,
                source: acct.source ?? existing?.source,
            }
            return state;
       });
    },

    rememberAuthAccountSuccess(account) {
        setScoped((state) => { 
            const result = accountSchema.safeParse(account);
            if (!result.success) {
                return state;
            } 
            const acct = result.data;
            const existing = state[acct.id];
            state[acct.id] = {
                kollective: acct.kollective ?? existing?.kollective,
                source: acct.source ?? existing?.source,
            }
            return state;
       });
    }
  };
}

export default createAccountsMetaSlice;

