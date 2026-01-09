import { relationshipSchema } from "../../schemas/relationship";
import { setIn, asPlain } from "../../utils/immutableSafe.js";

export const createRelationshipsSlice = (
  setScoped,
  getScoped,
  rootSet,
  rootGet,
) => {
  const set = setScoped;
  return ({
    // store relationships by id
    //byId: {},

    importAccount(account) {
      if (!account) return;
      const acct = asPlain(account) || {};
      const relationship =
        (acct.pleroma && acct.pleroma.relationship) || acct.relationship || null;
      if (!relationship || !relationship.id) return;
      try {
        const parsed = relationshipSchema.parse(asPlain(relationship));
        set((state) => {
          state[parsed.id] = parsed;
        });
      } catch (e) {
        console.error("Failed to parse relationship for account", e);
      }
    },

    importAccounts(accounts) {
      if (!Array.isArray(accounts)) return;
      const arr = accounts.map(asPlain);
      set((state) => {
        arr.forEach((acct) => {
          const relationship =
            (acct && acct.pleroma && acct.pleroma.relationship) ||
            acct.relationship ||
            null;
          if (relationship && relationship.id) {
            try {
              state[relationship.id] = relationshipSchema.parse(
                asPlain(relationship),
              );
            } catch (e) {
              console.error("Failed to parse relationship in importAccounts", e);
            }
          }
        });
      });
    },

    blockOrUnBlockAccountSuccess(relationship) {
      if (!relationship || !relationship.id) return;
      try {
        const parsed = relationshipSchema.parse(asPlain(relationship));
        set((state) => {
          state[parsed.id] = parsed;
        });
      } catch (e) {
        console.error("Failed to parse relationship in blockAccountSuccess", e);
      }
    },

    muteOrUnmuteaccountSuccess(relationship) {
      if (!relationship || !relationship.id) return;
      try {
        const parsed = relationshipSchema.parse(asPlain(relationship));
        set((state) => {
          state[parsed.id] = parsed;
        });
      } catch (e) {
        console.error("Failed to parse relationship in muteAccountSuccess", e);
      }
    },

    subscribeOrUnsubscribeAccountSuccess(relationship) {
      if (!relationship || !relationship.id) return;
      try {
        const parsed = relationshipSchema.parse(asPlain(relationship));     

        set((state) => {
          state[parsed.id] = parsed;
        }     
        );
      } catch (e) {
        console.error(
          "Failed to parse relationship in subscribeAccountSuccess",
          e,
        );
      }
    },

    pinOrUnpinAccountSuccess(relationship) {
      if (!relationship || !relationship.id) return;
      try {
        const parsed = relationshipSchema.parse(asPlain(relationship));
        set((state) => {
          state[parsed.id] = parsed;
        });
      } catch (e) {
        console.error("Failed to parse relationship in pinAccount", e);
      }
    },

    accountNoteSuubmitSuccess(relationship) {
      if (!relationship || !relationship.id) return;
      try {
        const parsed = relationshipSchema.parse(asPlain(relationship));
        set((state) => {
          state[parsed.id] = parsed;
        });
      } catch (e) {
        console.error("Failed to parse relationship in accountNoteSubmit", e);
      }
    },

    removeAccountFromFollowersSuccess(relationship) {
      if (!relationship || !relationship.id) return;
      try {
        const parsed = relationshipSchema.parse(asPlain(relationship));
        set((state) => {
          state[parsed.id] = parsed;
        });
      } catch (e) {
        console.error("Failed to parse relationship in removeAccountFromFollowers", e);
      }
    },

    fetchRelationshipsSuccess(relationships) {
      if (!relationships) return;
      relationships.forEach((relationship) => {
        if (!relationship || !relationship.id) return;
        set((state) => {
          try {
            const parsed = relationshipSchema.parse(asPlain(relationship));
            state[parsed.id] = parsed;
          } catch (e) {
            console.error("Failed to parse relationship in fetchRelationshipsSuccess", e);
          }
        });
      });
    },

    domainBlockSuccess(accounts) {
      if (!accounts) return;
      accounts.forEach((account) => {
        if (!account || !account.id || !account.relationship) return;
        set((state) => {
          try {
            let out = setIn(state, [account.id, 'domain_blocking'], true);
            state = { ...state, ...out };
          } catch (e) {
            console.error("Failed to parse relationship in domainBlockSuccess", e);
          }
        });
      });
    },

    domainUnblockSuccess(accounts) {
      if (!accounts) return;
      accounts.forEach((account) => {
        if (!account || !account.id || !account.relationship) return;
        set((state) => {
          try {
            let out = setIn(state, [account.id, 'domain_blocking'], false);
            state = { ...state, ...out };
          } catch (e) {
            console.error("Failed to parse relationship in domainUnblockSuccess", e);
          }
        });
      });
    },

    //account-notes submit action
    async submitAccountNote(id, value) {
      return fetch(`/api/v1/accounts/${id}/note`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            comment: value
          }),
        })
        .then((response) => response.json())
        .then((data) => {
          // handle success
          this.accountNoteSubmitSuccess(data);
        })
        .catch((error) => {
          // handle error
          console.error('Error: submitAccountNote failed', error);
        });
    },
  });
};

export default createRelationshipsSlice;
