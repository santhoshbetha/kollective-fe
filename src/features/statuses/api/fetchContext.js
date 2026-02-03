//This function fetches both branches of the conversation in a single network request.
export const fetchContext = async (statusId) => {
  const response = await fetch(`/api/v1/statuses/${statusId}/context`);
  if (!response.ok) throw new Error('Failed to fetch context');
  const data = await response.json();

  // Pre-process into Maps for O(1) traversal in selectors
  const inReplyTos = new Map();
  const replies = new Map();

  [...data.ancestors, ...data.descendants].forEach((status) => {
    if (status.in_reply_to_id) {
      inReplyTos.set(status.id, status.in_reply_to_id);
      const existing = replies.get(status.in_reply_to_id) || [];
      replies.set(status.in_reply_to_id, [...existing, status.id]);
    }
  });

  return { inReplyTos, replies };
};
