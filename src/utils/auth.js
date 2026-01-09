import { selectAccount, selectOwnAccount } from "../selectors";

export const validId = (id) =>
  typeof id === "string" && id !== "null" && id !== "undefined";

export const isURL = (url) => {
  if (typeof url !== "string") return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const parseBaseURL = (url) => {
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
};

export const getLoggedInAccount = (state) => selectOwnAccount(state);

export const isLoggedIn = (state) => {
  return validId(state.auth.me);
};

export const getAppToken = (state) => state.auth.app?.access_token;

export const getUserToken = (state, accountId) => {
  if (!accountId) return;
  const accountUrl = selectAccount(state, accountId)?.url;
  if (!accountUrl) return;
  return state.auth.users[accountUrl]?.access_token;
};

export const getAccessToken = (state) => {
  const me = state.me;
  return getUserToken(state, me);
};

export const getAuthUserId = (state) => {
  const me = state.auth.me;

  return [state.auth.users[me]?.id, me].filter((id) => id).find(validId);
};

export const getAuthUserUrl = (state) => {
  const me = state.auth.me;

  return [state.auth.users[me]?.url, me].filter((url) => url).find(isURL);
};

export const getMeUrl = (state) => selectOwnAccount(state)?.url;
