// Action-only slice for interactions (likes, boosts, etc.). No local state — only actions.

import { isLoggedIn } from "../../utils/auth";

export function createInteractionsSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    reblog(status, effects) {
        const root = rootGet();
        if (!isLoggedIn(root)) return;

        root.statuses.reblogRequest(status);
        effects?.reblogEffect(status.id);

        fetch(`/api/v1/statuses/${status.id}/reblog`, {
            method: 'POST',
        }).then((res) => {
            if (!res.ok) throw new Error(`Failed to reblog status (${res.status})`);
            return res.json();
        }).then((data) => {
           root.importer.importFetchedStatus(data.reblog);
        }).catch((err) => {
            console.error('interactionsSlice.reblog failed', err);
            root.statuses.reblogFail(status, err);
        });
    },

    unreblog(status, effects) {
        const root = rootGet();
        if (!isLoggedIn(root)) return;

        root.statuses.unreblogRequest(status);
        effects?.unreblogEffect(status.id);

        fetch(`/api/v1/statuses/${status.id}/unreblog`, {       
            method: 'POST',
        }).then((res) => {
            if (!res.ok) throw new Error(`Failed to unreblog status (${res.status})`);      
            return res.json();
        }   
        ).catch((err) => {
            console.error('interactionsSlice.unreblog failed', err);
            root.statuses.unreblogFail(status, err);
            effects?.reblogEffect(status.id);
        });     
    },

    toggleReblog(status, effects) {
        if (status.reblogged) {
            this.unreblog(status, effects);
        } else {
            this.reblog(status, effects);
        }
    },

    favourite(status) {
        const root = rootGet();
        if (!isLoggedIn(root)) return;

        fetch(`/api/v1/statuses/${status.id}/favourite`, {
            method: 'POST',
        }).then((res) => {
            root.statusLists.favouriteSuccess(status);
        }).catch((err) => {
            root.statuses.favouriteFail(status);
            console.error('interactionsSlice.favourite failed', err);
        });
    },

    unfavourite(status) { 
        const root = rootGet();
        if (!isLoggedIn(root)) return;

        fetch(`/api/v1/statuses/${status.id}/unfavourite`, {
            method: 'POST',
        }).then((res) => {
            root.statusLists.unfavouriteSuccess(status);
        }).catch((err) => {
            console.error('interactionsSlice.unfavourite failed', err);
        });
    },

    toggleFavourite(status) {
        if (status.favourited) {
            this.unfavourite(status);
        } else {
            this.favourite(status);
        }
    },

    dislike(status) {
        const root = rootGet();
        if (!isLoggedIn(root)) return;  
        fetch(`/api/v1/statuses/${status.id}/dislike`, {
            method: 'POST',
        }).catch((err) => {
            root.statuses.dislikeFail(status, error);
            console.error('interactionsSlice.dislike failed', err);
        });
    },

    undislike(status) {
        const root = rootGet();
        if (!isLoggedIn(root)) return;
        fetch(`/api/v1/statuses/${status.id}/undislike`, {
            method: 'POST',
        }).catch((err) => {
            console.error('interactionsSlice.undislike failed', err);
        });
    },

    toggleDislike(status) {
        if (status.disliked) {
            this.undislike(status); 
        } else {
            this.dislike(status);
        }   
    },

    fetchReblogs(id) {
        const root = rootGet();
        if (!isLoggedIn(root)) return;
        
        fetch(`/api/v1/statuses/${id}/reblogged_by`, {
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
            root.importer.importFetchedAccounts(data);
            root.accounts.fecthRelationships(data.map(acc => acc.id));
            root.userLists.fetchReblogSuccess(id, data, next);
        }       
        ).catch((error) => {     
            // handle error 
            console.error('interactionsSlice.fetchReblogs failed', error);
        });      
    },

    expandReblogs(id, path) {
        const root = rootGet();
        fetch(path, {
            method: 'GET',
            headers: {  
                'Content-Type': 'application/json',
            },
        })  .then(async (response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }   
            const next = response.next();
            const data = await response.json(); 
            // handle success
            root.importer.importFetchedAccounts(data);
            root.accounts.fecthRelationships(data.map(acc => acc.id));
            root.userLists.expandReblogSuccess(id, data, next);
        }
        ).catch((error) => {
            // handle error
            console.error('interactionsSlice.expandReblogs failed', error);
        });
    },

    fecchFavourites(id) {
        const root = rootGet();
        if (!isLoggedIn(root)) return;
        fetch(`/api/v1/statuses/${id}/favourited_by`, {
            method: 'GET',
            headers: {  
                'Content-Type': 'application/json',
            },
        })  .then(async (response) => { 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }   
            const next = response.next();
            const data = await response.json(); 
            // handle success
            root.importer.importFetchedAccounts(data);
            root.accounts.fecthRelationships(data.map(acc => acc.id));
            root.userLists.fetchFavouritesSuccess(id, data, next);
        }   
        ).catch((error) => {     
            // handle error 
            console.error('interactionsSlice.fecchFavourites failed', error);
        });      
    },

    expandFavoutites(id, path) {
        const root = rootGet();
        fetch(path, {   
            method: 'GET',
            headers: {  
                'Content-Type': 'application/json',     
            },  
        })  .then(async (response) => { 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const next = response.next();
            const data = await response.json();
            // handle success
            root.importer.importFetchedAccounts(data);
            root.accounts.fecthRelationships(data.map(acc => acc.id));
            root.userLists.expandFavouritesSuccess(id, data, next);
        }
        ).catch((error) => {
            // handle error
            console.error('interactionsSlice.expandFavoutites failed', error);
        });
    },

    fetchDislikes(id) {
        const root = rootGet();
        if (!isLoggedIn(root)) return;      
        fetch(`/api/v1/statuses/${id}/disliked_by`, {
            method: 'GET',  
            headers: {
                'Content-Type': 'application/json',
            },  
        })  .then(async (response) => { 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }   
            const data = await response.json(); 
            // handle success
            root.importer.importFetchedAccounts(data);
            root.accounts.fecthRelationships(data.map(acc => acc.id));
            root.userLists.fetchDislikesSuccess(id, data);
        }
        ).catch((error) => {
            // handle error
            console.error('interactionsSlice.fetchDislikes failed', error);
        });
    },

    fetchReactions(id) {
        const root = rootGet();
        fetch(`/api/v1/statuses/${id}/reactions`, {
            method: 'GET',
            headers: {  
                'Content-Type': 'application/json',
            },
        })  .then(async (response) => { 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }   
            const data = await response.json(); 
            // handle success
            root.importer.importFetchedAccounts(data.map(reaction => reaction.account));
            root.userLists.fetchReactionsSuccess(id, data);
        }
        ).catch((error) => {
            // handle error
            console.error('interactionsSlice.fetchReactions failed', error);
        });
    },

    pin(status) {
        const root = rootGet();
        if (!isLoggedIn(root)) return;
        fetch(`/api/v1/statuses/${status.id}/pin`, {
            method: 'POST',
        }).then((res) => {
            root.importFetchedStatus(res.json());
            root.statusLists.pinSuccess(status);
        }).catch((err) => {
            console.error('interactionsSlice.pin failed', err);
        });
    },

    pinToGroup(status, group) {
        const root = rootGet();
        if (!isLoggedIn(root)) return;  
        fetch(`/api/v1/groups/${group.id}/statuses/${status.id}/pin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ group_id: group.id }),
        }).then((res) => {
            root.importFetchedStatus(res.json());
            root.statusLists.pinToGroupSuccess(status, group);
        }).catch((err) => {
            console.error('interactionsSlice.pinToGroup failed', err);
        });
    },  

    unpin(status) {
        const root = rootGet();
        if (!isLoggedIn(root)) return;
        fetch(`/api/v1/statuses/${status.id}/unpin`, {  
            method: 'POST',
        }).then((res) => {
            root.importFetchedStatus(res.json()); 
            root.statusLists.unpinSuccess(status);
        }).catch((err) => {
            console.error('interactionsSlice.unpin failed', err);
        }   
        );
    },

    
  }
}

export default createInteractionsSlice;
