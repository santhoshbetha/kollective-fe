import { createCache, updateStore, updateList, createList } from "../utils";

export function createEntitiesSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    // No prefilled state here — state managed under scoped `entities` key

    importEntities(entityType, entities, listKey, pos, newState, overwrite = false) {
        setScoped((state) => {
            const cache = state[entityType] ?? createCache();
            cache.store = updateStore(cache.store, entities);
            
            if (typeof listKey === 'string') {
                let list = cache.lists[listKey] ?? createList();

                if (overwrite) {
                    list.ids = new Set();
                }

                list = updateList(list, entities, pos);

                if (newState) {
                    list.state = newState;
                }

                cache.lists[listKey] = list;
            }

            state[entityType] = cache;
        });
    },

    deleteEntities(entityType, ids, opts) {
        setScoped((state) => {
            const cache = state[entityType] ?? createCache();

            for (const id of ids) {
                delete cache.store[id];

                if (!opts?.preserveLists) {
                    for (const list of Object.values(cache.lists)) {
                        if (list) {
                            list.ids.delete(id);

                            if (typeof list.state.totalCount === 'number') {
                                list.state.totalCount--;
                            }
                        }
                    }
                }
            }

            state[entityType] = cache;
        });
    },

    dismiissEntities(entityType, ids, listKey) {
        setScoped((state) => {
            const cache = state[entityType] ?? createCache();
            const list = cache.lists[listKey];

            if (list) {
                for (const id of ids) {
                    list.ids.delete(id);

                    if (typeof list.state.totalCount === 'number') {
                        list.state.totalCount--;
                    }
                }

                state[entityType] = cache;
            }     
        });
    },

    incrementEntities(entityType, listKey, diff)    {
        setScoped((state) => {
            const cache = state[entityType] ?? createCache();
            const list = cache.lists[listKey];

            if (typeof list?.state?.totalCount === 'number') {
                list.state.totalCount += diff;
                state[entityType] = cache;
            }
        });
    },

    fetchEntitiesSuccess(entityType, entities, listKey, pos, newState, overwrite) {
        this.importEntities(entityType, entities, listKey, pos, newState, overwrite);
    },

    fetchEntitiesRequest(entityType, listKey) {
        setScoped((state) => {
            const cache = state[entityType] ?? createCache();
            if (typeof listKey === 'string') {
                const list = cache.lists[listKey] ?? createList();
                list.state.fetching = true;
                cache.lists[listKey] = list;
            }
            state[entityType] = cache;
        });
    },

    fetchEntitiesFail(entityType, listKey, error) {
        setScoped((state) => {
            const cache = state[entityType] ?? createCache();
            if (typeof listKey === 'string') {
                const list = cache.lists[listKey] ?? createList();
                list.state.fetching = false;
                list.state.error = error;
                cache.lists[listKey] = list;
            }
            state[entityType] = cache;
        });
    },

    invalidateEntitiesList(entityType, listKey) {
        setScoped((state) => {
            const cache = state[entityType] ?? createCache();
            const list = cache.lists[listKey] ?? createList();
            list.state.invalid = true;
        });
    },

    entitiesTransaction(transaction) {
        setScoped((state) => {
            for (const [entityType, changes] of Object.entries(transaction)) {
                const cache = state[entityType] ?? createCache();
                for (const [id, change] of Object.entries(changes)) {
                    const entity = cache.store[id];
                    if (entity) {
                        cache.store[id] = change(entity);
                    }
                }
            }
        }); 
    }
  };
}

export default createEntitiesSlice;
