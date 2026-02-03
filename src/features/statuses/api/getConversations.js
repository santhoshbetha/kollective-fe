export const fetchConversation = async (statusId) => {
  const response = await fetch(`/api/v1/statuses/${statusId}/context`);
  if (!response.ok) throw new Error('Failed to fetch conversation');
  const data = await response.json();

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
