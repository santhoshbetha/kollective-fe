import { createCache, updateStore, updateList, createList } from "../utils";

export function createEntitiesSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    // No prefilled state here — state managed under scoped `entities` key

    importEntities(entityType, entities, listKey, pos, newState, overwrite = false) {
      setScoped((state) => {
        // 1. Ensure the entity type cache exists (e.g., 'ACCOUNTS')
        if (!state[entityType]) state[entityType] = createCache();
        const cache = state[entityType];

        // 2. Update the main store (Normalized dictionary)
        entities.forEach((entity) => {
          if (entity?.id) {
            cache.store[entity.id] = entity;
          }
        });

        // 3. Handle list-specific logic if a listKey is provided
        if (typeof listKey === 'string') {
          if (!cache.lists[listKey]) cache.lists[listKey] = createList();
          const list = cache.lists[listKey];

          const incomingIds = entities.map((e) => e.id).filter(Boolean);

          if (overwrite) {
            list.ids = incomingIds;
          } else {
            // Uniqueness check (OrderedSet equivalent)
            const combined = pos === 'top' 
                ? [...incomingIds, ...list.ids] 
                : [...list.ids, ...incomingIds];
            list.ids = [...new Set(combined)];
          }

          if (newState) {
            list.state = { ...list.state, ...newState, fetching: false };
          }
        }
      });
    },

    deleteEntities(entityType, ids, opts) {
      setScoped((state) => {
        const cache = state[entityType];
        if (!cache || !cache.store) return;

        // Normalize ids to an array if a single ID was passed
        const idsToDelete = Array.isArray(ids) ? ids : [ids];

        idsToDelete.forEach((id) => {
          // 1. Remove from the primary store
          delete cache.store[id];

          // 2. Cleanup lists unless specifically told to preserve them
          if (!opts?.preserveLists && cache.lists) {
            // Iterate over all list objects (e.g., 'home', 'notifications')
            Object.values(cache.lists).forEach((list) => {
              if (Array.isArray(list.ids)) {
                const originalLength = list.ids.length;
                
                // Filter out the deleted ID
                list.ids = list.ids.filter((itemId) => itemId !== id);
                
                // 3. Update totalCount if an item was actually removed
                if (list.ids.length < originalLength && typeof list.state?.totalCount === 'number') {
                  list.state.totalCount--;
                }
              }
            });
          }
        });
      });
    },

    dismissEntities(entityType, ids, listKey) {
      setScoped((state) => {
        const cache = state[entityType];
        const list = cache?.lists?.[listKey];

        // 1. Guard against missing data
        if (!list || !Array.isArray(list.ids)) return;

        // 2. Normalize input to array
        const idsToRemove = Array.isArray(ids) ? ids : [ids];

        idsToRemove.forEach((id) => {
          const originalLength = list.ids.length;
          
          // 3. Standard JS filter replaces Set.delete()
          list.ids = list.ids.filter((itemId) => itemId !== id);

          // 4. Update totalCount if an item was actually removed
          if (list.ids.length < originalLength && typeof list.state?.totalCount === 'number') {
              list.state.totalCount--;
          }
        });
        // In Immer, you do NOT need to return 'state' or do 'state[entityType] = cache'
      });
    },

    incrementEntities(entityType, listKey, diff) {
      setScoped((state) => {
        // 1. Safe access to the specific list
        const list = state[entityType]?.lists?.[listKey];

        // 2. Direct mutation if the count is a valid number
        if (typeof list?.state?.totalCount === 'number') {
            list.state.totalCount += diff;
        }
        
        // Note: In Immer, you do NOT need 'state[entityType] = cache'
        // or any return statement. The change above is tracked automatically.
      });
    },

    fetchEntitiesSuccess(entityType, entities, listKey, pos, newState, overwrite) {
      rootGet().importEntities(entityType, entities, listKey, pos, newState, overwrite);
    },

    fetchEntitiesRequest(entityType, listKey) {
      setScoped((state) => {
        if (!state[entityType]) state[entityType] = createCache();
        if (!state[entityType].lists[listKey]) {
          state[entityType].lists[listKey] = createList();
        }
        state[entityType].lists[listKey].state.fetching = true;
      });
    },

    fetchEntitiesFail(entityType, listKey, error) {
      setScoped((state) => {
        const list = state[entityType]?.lists?.[listKey];
        if (list) {
          list.state.fetching = false;
          list.state.error = error;
        }
      });
    },

    invalidateEntitiesList(entityType, listKey) {
      setScoped((state) => {
        const list = state[entityType]?.lists?.[listKey];
        if (list) list.state.invalid = true;
      });
    },

    entitiesTransaction(transaction) {
      setScoped((state) => {
        Object.entries(transaction).forEach(([entityType, changes]) => {
          const cache = state[entityType];
          if (!cache) return;

          Object.entries(changes).forEach(([id, changeFn]) => {
            const entity = cache.store[id];
            if (entity) {
              // Immer allows direct mutation of the returned object
              cache.store[id] = changeFn(entity);
            }
          });
        });
      });
    },
  };
}

export default createEntitiesSlice;
