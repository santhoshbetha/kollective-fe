// Action-only slice for domain block operations. No local state — only actions.

import { isLoggedIn } from "../../utils/auth";


export function createDomainBlocksSlice(setScoped, getScoped, rootSet, rootGet) {

    function selectAccountsByDomain(state, domain){
        const store = state.entities["ACCOUNTS"]?.store;
        const entries = store ? Object.entries(store) : undefined;
        const accounts = entries
            ?.filter(([_, item]) => item && item.acct.endsWith(`@${domain}`))
            .map(([_, item]) => item.id);
        return accounts || [];
    }

  return {

    blockDomain(domain) {
        const root = rootGet();
        if (!isLoggedIn(root)) return;

        fetch('/api/v1/domain_blocks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain }),
        }).then((res) => {
          if (!res.ok) throw new Error(`Failed to block domain (${res.status})`);
          return res.json();
        }).then((data) => {
          const accounts = selectAccountsByDomain(root, domain);
          if (!accounts) return;
          root.relationships?.domainBlockSuccess(accounts);
          root.suggestions?.domainBlockSuccess(accounts);
        }).catch((err) => {
          console.error('domainBlocksSlice.blockDomain failed', err);
        });
    },

    unblockDomain(domain) {
        const root = rootGet();
        if (!isLoggedIn(root)) return;
        fetch(`/api/v1/domain_blocks/${encodeURIComponent(domain)}`, { //TODO: check later
          method: 'DELETE',
        }).then((res) => {
            if (!res.ok) throw new Error(`Failed to unblock domain (${res.status})`);   
            return res.json();
        }).then((data) => {
          const accounts = selectAccountsByDomain(root, domain);
          if (!accounts) return;
          root.relationships?.domainUnblockSuccess(accounts);
          root.suggestions?.domainUnblockSuccess(accounts);
        }).catch((err) => {
          console.error('domainBlocksSlice.unblockDomain failed', err);
        });
    },

    // Fetch list of blocked domains
    async fetchBlockedDomains() {
      if (!isLoggedIn(rootGet())) return [];
      const root = rootGet();
      try {
        const res = await fetch('/api/v1/domain_blocks', { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to fetch blocked domains (${res.status})`);
        const data = await res.json();

        // Notify any slice that wants the list
        root.domainLists?.fetchBlockedDomainsSuccess?.(data);
        return data;
      } catch (err) {
        console.error('domainBlocksSlice.fetchBlockedDomains failed', err);
        return [];
      }
    },

    fetchDomainBlocks() {
      const root = rootGet();
        if (!isLoggedIn(root)) {
            return;
        }

      fetch('/api/v1/domain_blocks', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',       
        },
      })
      .then(async (response) => {   
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }   
        const next = response.next();
        const data = await response.json();
        // handle success
        root.domainLists?.fetchDomainBlocksSuccess(data, next);
      }).catch((error) => {
            // handle error     
            console.error('Error: fetchDomainBlocks failed', error);
        });
    },

    expandDomainBlocks() {
        const root = rootGet();
        if (!isLoggedIn(root)) {
            return;
        }   
        const url = root.domainLists.blocks.next;

        if (!url) {
        return;
        } 
        
        fetch(url, {
            method: 'GET',
            headers: {      
                'Content-Type': 'application/json', 
            },
        })
        .then(async (response) => {     
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }       
            const newNext = response.next();
            const data = await response.json();     
            // handle success
            root.domainLists?.fexpandDomainBlocksSuccess(data, newNext);
        }   ).catch((error) => {     
            // handle error     
            console.error('Error: expandDomainBlocks failed', error);
        });     
    },
  };
}

export default createDomainBlocksSlice;
