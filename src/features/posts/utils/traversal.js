// Pure logic functions
export const buildAncestors = (postId, inReplyTos) => {
  const ancestors = new Set();
  let id = postId;
  while (id && !ancestors.has(id)) {
    ancestors.add(id);
    id = inReplyTos.get(id);
  }
  return Array.from(ancestors).reverse();
};

export const buildDescendants = (postId, contextReplies) => {
  const descendants = new Set();
  const stack = [postId];
  while (stack.length > 0) {
    const id = stack.pop();
    if (!id) continue;
    const replies = contextReplies.get(id);
    if (id !== postId) descendants.add(id);
    if (replies) {
      for (let i = replies.length - 1; i >= 0; i--) {
        if (!descendants.has(replies[i])) stack.push(replies[i]);
      }
    }
  }
  return Array.from(descendants);
};
