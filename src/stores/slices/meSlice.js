import { selectAccount } from "../../selectors";
import { getAuthUserId, getAuthUserUrl } from "../../utils/auth";

//type Me = string | null | false | undefined; =. initial state

const handleForbidden = (state, error) => {
  try {
    if (!error) return state;
    // Try common shapes for HTTP errors: `error.response.status`, `error.status`, or numeric error
    const status =
      error?.response?.status ??
      error?.status ??
      (typeof error === "number" ? error : undefined);
    if (status === 401 || status === 403) return false;
  } catch {
    // If anything goes wrong while inspecting the error, fall back to returning current state
  }
  return state;
};

export function createMeSlice(setScoped, getScoped, rootSet, rootGet) {
  const set = setScoped;
  return {
    fetchMeSuccess(me) {
      set({ me: me.id });
    },

    patchMeSuccess(me) {
      set({ me: me.id });
    },

    verifyCredentialsSuccess(account) {
      set({ me: account.id });
    },

    fetchMeSkip() {
      set((state) => {
        state.me = false;
      });
    },

    authLoggedOut() {
      set((state) => {
        state.me = false;
      });
    },

    fetchMeFail(error) {
      set((state) => {
        return handleForbidden(state, error);
      });
    },

    //Below are actions that return something
    //instead of just setting state

    getMeId(state) {
      return (state && state.me) || getAuthUserId(state) || null;
    },

    getMeUrl(state) {
      const accountId = this.getMeId(state);
      if (!accountId) return null;
      if (accountId)  {
        return selectAccount(state, accountId?.url || getAuthUserUrl(state));
      } 
    },

    getMeToken(state) {
      const accountUrl = this.getMeUrl(state) || state.auth.me;
      return state.auth.users[accountUrl]?.access_token;
    },

    fecthMe() {
      const root = rootGet()
      const token = this.getMeToken(root);
      const accountUrl = this.getMeUrl(root);

      if (!token) {
        return;
      }

      try {
        root.auth.verifyCredentials(token, accountUrl)
      } catch (error) {
        root.me.fetchMeFail(error)
        console.error('createMeSlice.fecthMe failed', error);
      }
    },

    patchMe(params) {
      fetch('/api/v1/accounts/update_credentials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params || {}),
      }).then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
      }).then(data => {
        this.patchMeSuccess(data);
      }).catch(error => {
        console.error('createMeSlice.fetchMe failed', error);
      });
    },

    patchMeSuccessAction(me) {
      const root = rootGet();
     
      root.importer.importFetchedAccount(me);
      this.compose.patchMeSuccess(me);
      this.patchMeSuccess(me);
      this.accountsMeta.patchMeSuccess(me);
    },

  };
}

export default createMeSlice;
