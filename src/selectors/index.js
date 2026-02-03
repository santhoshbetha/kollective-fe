import { createSelector } from 'reselect';
import { createCachedSelector, LruMapCache } from 're-reselect';
import { shouldFilter } from '../utils/timelines';
import { getFeatures } from '../utils/features';
import { maybeFromJS } from '../utils/normalizers';
import { normalizeId } from '../utils/normalizers';

export function selectAccount(state, accountId) {
  return state.entities['accounts']?.store[accountId];
}

export function selectOwnAccount(state) {
  if (state.me) {
    return selectAccount(state, state.me);
  }
}

export const accountIdsToAccts = (state, ids) => 
  ids.map((id) => selectAccount(state, id).acct);

const getAccountBase         = (state, id) => state.entities['accounts']?.store[id];
const getAccountRelationship = (state, id) => state.relationships[id];
const getAccountMeta         = (state, id) => state.accountsMeta[id];

export const makeGetAccount = () => {
  return createSelector([
    getAccountBase,
    getAccountRelationship,
    getAccountMeta,
  ], (account, relationship, meta) => {
    if (!account) return null;
    return {
      ...account,
      relationship,
      source: meta?.source ?? account.source,
      kollective: meta?.kollective ?? account.kollective,
    };
  });
};

const toServerSideType = (columnType) => {
  switch (columnType) {
    case 'home':
    case 'notifications':
    case 'public':
    case 'thread':
      return columnType;
    default:
      if (columnType.includes('list:')) {
        return 'home';
      } else {
        return 'public'; // community, account, hashtag
      }
  }
};

export const getFilters = (state, query) => {
  return state.filters.filter((filter) => {
    return (!query?.contextType || filter.context.includes(toServerSideType(query.contextType)))
      && (filter.expires_at === null || Date.parse(filter.expires_at) > new Date().getTime());
  });
};

const escapeRegExp = (string) =>
  string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 

export const regexFromFilters = (filters) => {
  if (filters.size === 0) return null;

  return new RegExp(filters.map(filter =>
    filter.keywords.map(keyword => {
      let expr = escapeRegExp(keyword.keyword);

      if (keyword.whole_word) {
        if (/^[\w]/.test(expr)) {
          expr = `\\b${expr}`;
        }

        if (/[\w]$/.test(expr)) {
          expr = `${expr}\\b`;
        }
      }

      return expr;
    }).join('|'),
  ).join('|'), 'i');
};

const checkFiltered = (index, filters) =>
  filters.reduce((result, filter) =>
    result.concat(filter.keywords.reduce((result, keyword) => {
      let expr = escapeRegExp(keyword.keyword);

      if (keyword.whole_word) {
        if (/^[\w]/.test(expr)) {
          expr = `\\b${expr}`;
        }

        if (/[\w]$/.test(expr)) {
          expr = `${expr}\\b`;
        }
      }

      const regex = new RegExp(expr);

      if (regex.test(index)) return result.concat(filter.title);
      return result;
    }, new Set()
)), new Set());

export const makeGetStatus = () => {
  return createSelector(
    //san this add: inputSelectors 
    [
      (state, { id }) => state.statuses[id],
      (state, { id }) => state.statuses[state.statuses[id]?.reblog || ''],
      (_state, { username }) => username,
      getFilters,
      (state) => state.me,
      (state) => getFeatures(state.instance),
    ],

    //san this add: combiner (gets executed only when inputselectors value changed)
    (statusBase, statusReblog, username, filters, me, features) => {
      if (!statusBase) return null;
      const { account } = statusBase;

      if (!account) return null;

      const accountUsername = account.acct;

      // Must be owner of status if username exists.
      if (accountUsername !== username && username !== undefined) {
        return null;
      }

      return statusBase.withMutations((map) => {
        map.set('reblog', statusReblog || null);

        if ((features.filters) && account.id !== me) {
          const filtered = checkFiltered(statusReblog?.search_index || statusBase.search_index, filters);

          map.set('filtered', filtered);
        }
      });
    },
  );
};

export const getAccountGallery = createSelector([
  (state, id) => state.timelines[`account:${id}:media`]?.items || new Set(),
  (state) => state.statuses,
], (statusIds, statuses) => {
  return statusIds.reduce((medias, statusId) => {
    const status = statuses[statusId];
    if (!status) return medias;
    if (status.reblog) return medias;

    return medias.concat(
      status.media_attachments.map(media => media.merge({ status, account: status.account })));
  }, []);
});

export const getGroupGallery = createSelector([
  (state, id) => state.timelines[`group:${id}:media`]?.items || new Set(),
  (state) => state.statuses,
], (statusIds, statuses) => {
  return statusIds.reduce((medias, statusId) => {
    const status = statuses[statusId];
    if (!status) return medias;
    if (status.reblog) return medias;

    return medias.concat(
      status.media_attachments.map(media => media.merge({ status, account: status.account })));
  }, []);
});

export const makeGetChat = () => {
  return createSelector(
    [
      (state, { id }) => state.chats.items[id],
      (state, { id }) => selectAccount(state, state.chats.items[id]?.account),
      (state, { last_message }) => state.chat_messages[last_message],
    ],

    (chat, account, lastMessage) => {
      if (!chat || !account) return null;

      return chat.withMutations((map) => {
        // @ts-ignore
        map.set('account', account);
        // @ts-ignore
        map.set('last_message', lastMessage);
      });
    },
  );
};

export const makeGetReport = () => {
  const getStatus = makeGetStatus();

  return createSelector(
    [
      (state, id) => state.admin.reports[id],
      (state, id) => selectAccount(state, state.admin.reports[id]?.account || ''),
      (state, id) => selectAccount(state, state.admin.reports[id]?.target_account || ''),
      (state, id) => (maybeFromJS(state.admin.reports[id]?.statuses) || []).map(
        statusId => state.statuses[normalizeId(statusId)])
        .filter((s) => s)
        .map((s) => getStatus(state, s.toJS())),
    ],

    (report, account, targetAccount, statuses) => {
      if (!report) return null;
      return report.withMutations((report) => {
        // @ts-ignore
        report.set('account', account);
        // @ts-ignore
        report.set('target_account', targetAccount);
        // @ts-ignore
        report.set('statuses', statuses);
      });
    },
  );
};

export function makeGetOtherAccounts() {
  return createSelector([
    (state) => state.entities['accounts']?.store,
    (state) => state.auth.users,
    (state) => state.me,
  ],
  (store, authUsers, me) => {
    const accountIds = Object.values(authUsers).map((authUser) => authUser.id);

    return accountIds.reduce((accounts, id) => {//accounts is accumulator
      if (id === me) return accounts; // Skip the current user

      const account = store[id]; // Look up the account object by ID
      if (account) {
        accounts.push(account); // If found, add it to the accumulator array
      }

      return accounts; // Return the accumulator for the next iteration
    }, []);
  });
}

/*
const getSimplePolicy = createSelector([
  (state) => state.admin.configs,
  (state) => state.instance.kollective.metadata.federation.mrf_simple,
], (configs, instancePolicy) => {
  return {
    ...instancePolicy,
    //...ConfigDB.toSimplePolicy(configs),//TODO check later
  };
});
*/
/*
const getRemoteInstanceFavicon = (state, host) => {
  const accounts = (state.entities['accounts']?.store ?? {});
  const account = Object.entries(accounts).find(([_, account]) => account && getDomain(account) === host)?.[1];
  return account?.kollective?.favicon;
};

const getRemoteInstanceFederation = (state, host) => {
  const simplePolicy = getSimplePolicy(state);

  return Object.fromEntries(
    Object.entries(simplePolicy).map(([key, hosts]) => [key, hosts.includes(host)]),
  );
};


export const makeGetHosts = () => {
  return createSelector([getSimplePolicy], (simplePolicy) => {
    const { accept, reject_deletes, report_removal, ...rest } = simplePolicy;

    return Object.values(rest)
      .reduce((acc, hosts) => new Set([...acc, ...hosts]), new Set())
      .sort();
  });
};*/

export const RemoteInstanceRecord = {
  host: '',
  favicon: null,
  federation: null,
};

export const makeGetRemoteInstance = () =>
  createSelector([
    (_state, host) => host,
 //   getRemoteInstanceFavicon,
  //  getRemoteInstanceFederation,
  ], (host, favicon, federation) =>
    RemoteInstanceRecord({
      host,
      favicon,
      federation,
    }));

export const makeGetStatusIds = () => createCachedSelector([
  (state, { type }) => state.settings[type] || {},
  (state, { type }) => state.timelines[type]?.items || new Set(),
  (state) => state.statuses,
], (columnSettings, statusIds, statuses) => {
  return statusIds.filter((id) => {
    const status = statuses[id];
    if (!status) return true;
    return !shouldFilter(status, columnSettings);
  });
})(
  // Cache key function
  (_state, { type, prefix }) => `${prefix || type}`,
  // Cache options
  {
    cacheObject: new LruMapCache({ maxSize: 10 }),
  }
);

/*
usage:
 const statusIds = useStore((state) => selectStatusIds(state, type));

 =============================
 The Better Zustand Alternative: useShallow
If your only goal is to prevent re-renders when a selector returns a new array
or object with the same data, Zustand's built-in useShallow hook is often easier than createSelector


import { useShallow } from 'zustand/react/shallow';

// This prevents re-renders if the filtered array content is identical
const statusIds = useStore(useShallow(state => 
  state.timelines[type]?.items.filter(id => !!state.statuses[id])
));

//but do not need useShallow if you are using createCachedSelector correctly.

 Zustand's useShallow doesn't care about memory or caching calculations. It simply looks at 
 the result of your selector and performs a "shallow check" (comparing every item in the array/object).

 Comparison Table
Tool	                 Prevents Calculation?	Prevents          Re-render?	Strategy
createCachedSelector	     Yes	                  Yes	               Caches the reference.
useShallow	               No	                    Yes	              Checks the content (shallow compare).

*/



