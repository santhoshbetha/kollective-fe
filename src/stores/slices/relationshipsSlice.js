import { relationshipSchema } from "../../schemas/relationship";
import { setIn, asPlain } from "../../utils/immutableSafe.js";

export const createRelationshipsSlice = (
  setScoped,
  getScoped,
  rootSet,
  rootGet,
) => {

  // Internal helper to parse and merge relationships into state
  const mergeRelationships = (data) => {
    const items = Array.isArray(data) ? data : [data];
    setScoped((state) => {
      items.forEach((item) => {
        if (!item?.id) return;
        try {
          const parsed = relationshipSchema.parse(asPlain(item));
          state[parsed.id] = parsed;
        } catch (e) {
          console.error("Relationship parsing failed", e);
        }
      });
    });
  };

  return ({
    // store relationships by id
    //byId: {},

    importKollectiveAccount(account) {
      const acct = asPlain(account);
      const rel = acct?.kollective?.relationship || acct?.relationship;
      if (rel) mergeRelationships(rel);
    },

    importKollectiveAccounts(accounts) {
      if (!Array.isArray(accounts)) return;
      const relationships = accounts
        .map(acct => asPlain(acct)?.kollective?.relationship || asPlain(acct)?.relationship)
        .filter(Boolean);
      mergeRelationships(relationships);
    },

    blockOrUnBlockAccountSuccess: mergeRelationships,
    muteOrUnmuteaccountSuccess: mergeRelationships,
    subscribeOrUnsubscribeAccountSuccess: mergeRelationships,
    pinOrUnpinAccountSuccess: mergeRelationships,
    accountNoteSubmitSuccess: mergeRelationships, // Fixed typo from 'Suubmit'
    removeAccountFromFollowersSuccess: mergeRelationships,
    fetchRelationshipsSuccess: mergeRelationships,

    domainBlockSuccess(accounts) {
      setScoped((state) => {
        accounts?.forEach((acct) => {
          if (state[acct.id]) state[acct.id].domain_blocking = true;
        });
      });
    },

    domainUnblockSuccess(accounts) {
      setScoped((state) => {
        accounts?.forEach((acct) => {
          if (state[acct.id]) state[acct.id].domain_blocking = false;
        });
      });
    },

    //account-notes submit action
    async submitAccountNote(id, value) {
      const actions = getScoped();
      try {
        const response = await fetch(`/api/v1/accounts/${id}/note`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comment: value }),
        });

        if (!response.ok) throw new Error('Note submission failed');
        
        const data = await response.json();
        actions.accountNoteSubmitSuccess(data);
        return data;
      } catch (error) {
        console.error('Error: submitAccountNote failed', error);
      }
    },
    
  });
};

export default createRelationshipsSlice;
