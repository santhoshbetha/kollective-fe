// Pure logic functions
export const buildAncestors = (statusId, inReplyTos) => {
  const ancestors = new Set();
  let id = statusId;
  while (id && !ancestors.has(id)) {
    ancestors.add(id);
    id = inReplyTos.get(id);
  }
  return Array.from(ancestors).reverse();
};

export const buildDescendants = (statusId, contextReplies) => {
  const descendants = new Set();
  const stack = [statusId];
  while (stack.length > 0) {
    const id = stack.pop();
    if (!id) continue;
    const replies = contextReplies.get(id);
    if (id !== statusId) descendants.add(id);
    if (replies) {
      for (let i = replies.length - 1; i >= 0; i--) {
        if (!descendants.has(replies[i])) stack.push(replies[i]);
      }
    }
  }
  return Array.from(descendants);
};
