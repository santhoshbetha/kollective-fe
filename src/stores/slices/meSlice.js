import { selectAccount } from "../../selectors";
import { getAuthUserId, getAuthUserUrl } from "../../utils/auth";

//type Me = string | null | false | undefined; =. initial state

// Simplified forbidden handler: returns false (logged out state) on 401/403
const handleForbidden = (error) => {
  const status = error?.response?.status ?? error?.status ?? (typeof error === "number" ? error : null);
  return (status === 401 || status === 403) ? false : undefined;
};

export function createMeSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();

  return {
    // --- State Setters (Immer) ---
    fetchMeSuccess: (me) => setScoped((state) => { state.me = me.id; }),
    patchMeSuccess: (me) => setScoped((state) => { state.me = me.id; }),
    verifyCredentialsSuccess: (account) => setScoped((state) => { state.me = account.id; }),
    fetchMeSkip: () => setScoped((state) => { state.me = false; }),
    authLoggedOut: () => setScoped((state) => { state.me = false; }),

    fetchMeFail(error) {
      const forbiddenResult = handleForbidden(error);
      if (forbiddenResult === false) {
        setScoped((state) => { state.me = false; });
      }
    },

    //Below are actions that return something
    //instead of just setting state
    // --- Selectors / Helpers ---
    getMeId(state) {
      return state?.me || getAuthUserId(state) || null;
    },

    getMeUrl(state) {
      const actions = getActions();
      const accountId = actions.getMeId(state);
      if (!accountId) return null;
      
      // selectAccount typically returns an object, ensure we return the URL or account object as needed
      return selectAccount(state, accountId?.url || getAuthUserUrl(state));
    },

    getMeToken(state) {
      const actions = getActions();
      const accountUrl = actions.getMeUrl(state) || state.auth?.me;
      return state.auth?.users?.[accountUrl]?.access_token;
    },


    fetchMe() {
      const actions = getActions();
      const token = actions.getMeToken(rootGet());
      const accountUrl = actions.getMeUrl(rootGet());

      if (!token) return;

      try {
        // Assuming verifyCredentials triggers state updates elsewhere
        actions.verifyCredentials(token, accountUrl);
      } catch (error) {
        actions.fetchMeFail(error);
        console.error('createMeSlice.fetchMe failed', error);
      }
    },

    async patchMe(params) {
      const actions = getActions(); 
      try {
        const res = await fetch('/api/v1/accounts/update_credentials', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params || {}),
        });

        if (!res.ok) throw new Error('Network response was not ok');
        
        const data = await res.json();
        actions.patchMeSuccessAction(data);
      } catch (error) {
        console.error('createMeSlice.patchMe failed', error);
      }
    },

    patchMeSuccessAction(me) {
      const actions = getActions();
     
      // Coordination across multiple slices
      actions.importFetchedAccount?.(me);
      actions.patchMeSuccess?.(me);
      actions.patchMeSuccess?.(me);
      
      actions.patchMeSuccess(me);
    },

  };
}

export default createMeSlice;
