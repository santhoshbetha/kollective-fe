import { tokenSchema } from "../../schemas/token";
import { accountSchema } from "../../schemas/account";

const SESSION_KEY = 'kollective:auth:me';

const initialStateX = {
  tokens: {
    access_token: null,
    token_type: null,
    scope: null,
    created_at: null, 
    id: null, // Kollective (primary key)
    me: null, // leroma (ActivityPub ID of user)
  },
  users: {
    access_token: null,
    id: null,
    url: null,
  },
  me: null,
};

const initialState = {
  tokens: new Map(), 
  users: new Map(), //each user can have multiple accounts // this is list of accounts keyed by url: { url: { access_token, id, url } }
  me: null,
};


export function createAuthSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    ...initialState,

    authLoggedIn(token) { 
      const result = tokenSchema.safeParse(token);

        setScoped((state) => {
          if (result.success) {
            state.tokens[token.access_token] = result.data;
          } else {
            return state;
          }
        });
    },

    authLoggedOut(account) {
      const result = accountSchema.safeParse(account);
        setScoped((state) => {
          if (result.success) {
            const accessToken = state.users[result.data.url]?.access_token;

            delete state.tokens[accessToken];
            delete state.users[result.data.url];

            if (!state.me || !state.users[state.me]) {
              state.me = Object.keys(state.users)[0] || null;
            }

          } else {
            return state;
          }
        });     
    },

    verifyCredentialsSuccess(account, token) {
      const accResult = accountSchema.safeParse(account);
        setScoped((state) => {
          if (accResult.success && typeof token === 'string') {
            state.users[account.url] = {
              access_token: token,
              id: account.id,
              url: account.url,
            };
            if (!state.me || !state.users[state.me]) {
              state.me = Object.keys(state.users)[0] || null;
            }
          } else {
            return state;
          }
        });
    },

    verifyCredentialsFail(error, token) {
      setScoped((state) => {
        if (typeof token === 'string' && error && (error.status === 401 || error.status === 403)) {
          if ([401, 403].includes(error.response.status)) {
             delete state.tokens[token];

             for (const url in state.users) {
               if (state.users[url].access_token === token) {
                 delete state.users[url];
               }
             }
             if (!state.me || !state.users[state.me]) {
               state.me = Object.keys(state.users)[0] || null;
             }
          } else {
            return state;
          }
        } else {
          return state;
        }
      });
    },

    switchAccount(account, background) {
      const result = accountSchema.safeParse(account);
        setScoped((state) => {
          if (result.success) {
            if (background) {
              sessionStorage.setItem(SESSION_KEY, result.data.url);
              return state;
            }
            return {
              ...state,
              me: result.data.url,
            }
          } else {
            return state;
          }
        });
    },

    fetchMeSkip() { 
       setScoped((state) => {
         return {
            ...state,
            me: null,
         }
       });
    }
}}

export default createAuthSlice;
