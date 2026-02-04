export const statusKeys = {
  // 1. The base 'namespace' for all status-related data
  all: ['status'],

   // 2. The sub-category for conversation threads (contexts)
  // Returns: ['status', 'context']
  contexts: () => [...statusKeys.all, 'context'],

 // 3. The specific context for a single ID
  // Returns: ['status', 'context', '123']
  context: (id) => [...statusKeys.contexts(), id],

 // 4. Other keys for comparison
  details: () => [...statusKeys.all, 'detail'],
  detail: (id) => [...statusKeys.details(), id],
  
  timelines: () => [...statusKeys.all, 'timeline'],
  timeline: (type) => [...statusKeys.timelines(), type],
};

export const accountKeys = {
  all: ['account'],
  detail: (id) => [...accountKeys.all, id],
  
  relationships: () => ['relationship'],
  relationship: (listKey, id) => [...accountKeys.relationships(), listKey, id],
};

/*
usage:

useStatus.js:
// BEFORE: queryKey: ['status', statusId]
// AFTER:
queryKey: statusKeys.detail(statusId),

useRelationships.js:
// BEFORE: ['relationship', ...listKey]
// AFTER:
const expandedPath = [...accountKeys.relationships(), ...listKey];

useStatusImporter.js:
// Seeding becomes much safer:
queryClient.setQueryData(accountKeys.detail(status.account.id), status.account);
queryClient.setQueryData(statusKeys.detail(status.id), status);


Why this is "Production Grade"

    1. Refactoring: If you want to change 'status' to 'post', you change it in one line in the factory, 
       and the entire app updates.
    2. Invalidation: If you want to clear every relationship in the cache (e.g., when the user logs out),
       you just call queryClient.invalidateQueries({ queryKey: accountKeys.relationships() }).
    3. Scalability: As you add "Polls," "Bookmarks," or "Mutes," you just add a new object to the factory.

*/