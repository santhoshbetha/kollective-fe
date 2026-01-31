// Action-only slice for domain block operations. No local state — only actions.

import { isLoggedIn } from "../../utils/auth";

const selectAccountsByDomain = (state, domain) => {
  const accountsStore = state.accounts || {}; // Replaces state.entities["ACCOUNTS"]
  const searchString = `@${domain}`;
  
  return Object.values(accountsStore)
    .filter(acc => acc?.acct?.endsWith(searchString))
    .map(acc => acc.id);
};

export function createDomainBlocksSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();

  function selectAccountsByDomain(state, domain){
      const store = state.entities["ACCOUNTS"]?.store;
      const entries = store ? Object.entries(store) : undefined;
      const accounts = entries
          ?.filter(([_, item]) => item && item.acct.endsWith(`@${domain}`))
          .map(([_, item]) => item.id);
      return accounts || [];
  }

  return {

async blockDomain(domain) {
      const state = rootGet();
      const actions = getActions();
      if (!isLoggedIn(state)) return;

      try {
        const res = await fetch('/api/v1/domain_blocks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain }),
        });

        if (!res.ok) throw new Error(`Failed to block domain (${res.status})`);
        
        const data = await res.json();
        const affectedAccountIds = selectAccountsByDomain(state, domain);

        // Notify slices using uniquely named actions to avoid collisions
        actions.domainBlockRelationshipSuccess?.(affectedAccountIds);
        actions.domainBlockSuggestionSuccess?.(affectedAccountIds);
        
        return data;
      } catch (err) {
        console.error('domainBlocksSlice.blockDomain failed', err);
      }
    },

    async unblockDomain(domain) {
      const state = rootGet();
      const actions = getActions();
      if (!isLoggedIn(state)) return;

      try {
        const res = await fetch(`/api/v1/domain_blocks/${encodeURIComponent(domain)}`, {
          method: 'DELETE',
        });

        if (!res.ok) throw new Error(`Failed to unblock domain (${res.status})`);

        const data = await res.json();
        const affectedAccountIds = selectAccountsByDomain(state, domain);

        actions.domainUnblockRelationshipSuccess?.(affectedAccountIds);
        actions.domainUnblockSuggestionSuccess?.(affectedAccountIds);
        
        return data;
      } catch (err) {
        console.error('domainBlocksSlice.unblockDomain failed', err);
      }
    },

    // Fetch list of blocked domains
    async fetchDomainBlocks() {
      const state = rootGet();
      const actions = getActions();
      if (!isLoggedIn(state)) return [];

      try {
        const res = await fetch('/api/v1/domain_blocks', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const data = await res.json();
        // Standard Link header parsing instead of .next()
        const link = res.headers.get('Link');
        const next = link?.match(/<([^>]+)>;\s*rel="next"/i)?.[1] || null;

        actions.fetchDomainBlocksSuccess?.(data, next);
        return data;
      } catch (error) {
        console.error('domainBlocksSlice.fetchDomainBlocks failed', error);
        return [];
      }
    },

    async expandDomainBlocks() {
      const state = rootGet();
      const actions = getActions();
      if (!isLoggedIn(state)) return;

      const url = state.domainLists?.blocks?.next;
      if (!url) return;

      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const data = await res.json();
        const link = res.headers.get('Link');
        const newNext = link?.match(/<([^>]+)>;\s*rel="next"/i)?.[1] || null;

        actions.expandDomainBlocksSuccess?.(data, newNext);
      } catch (error) {
        console.error('domainBlocksSlice.expandDomainBlocks failed', error);
      }
    },
  };
}

export default createDomainBlocksSlice;
