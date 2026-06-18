export const postKeys = {
  // 1. The base 'namespace' for all post-related data
  all: ['post'],

   // 2. The sub-category for conversation threads (contexts)
  // Returns: ['post', 'context']
  contexts: () => [...postKeys.all, 'context'],

 // 3. The specific context for a single ID
  // Returns: ['post', 'context', '123']
  context: (id) => [...postKeys.contexts(), id],

 // 4. Other keys for comparison
  details: () => [...postKeys.all, 'detail'],
  detail: (id) => [...postKeys.details(), id],

  lists: () => [...postKeys.all, 'list'],
  list: (type, params = {}) => [...postKeys.lists(), { type, ...params }],
  
  timelines: () => [...postKeys.all, 'timeline'],
  timeline: (type) => [...postKeys.timelines(), type],
};

export const accountKeys = {
  all: ['account'],
  detail: (id) => [...accountKeys.all, id],
  
  relationships: () => ['relationship'],
  relationship: (listKey, id) => [...accountKeys.relationships(), listKey, id],
};

/*
usage:

usePostjs:
// BEFORE: queryKey: ['post', postId]
// AFTER:
queryKey: postKeys.detail(postId),

useRelationships.js:
// BEFORE: ['relationship', ...listKey]
// AFTER:
const expandedPath = [...accountKeys.relationships(), ...listKey];

usePostImporter.js:
// Seeding becomes much safer:
queryClient.setQueryData(accountKeys.detail(post.account.id), post.account);
queryClient.setQueryData(postKeys.detail(post.id), post);


Why this is "Production Grade"

    1. Refactoring: If you want to change 'post' to 'post', you change it in one line in the factory, 
       and the entire app updates.
    2. Invalidation: If you want to clear every relationship in the cache (e.g., when the user logs out),
       you just call queryClient.invalidateQueries({ queryKey: accountKeys.relationships() }).
    3. Scalability: As you add "Polls," "Bookmarks," or "Mutes," you just add a new object to the factory.

*/