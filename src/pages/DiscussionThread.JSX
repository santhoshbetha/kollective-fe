/*
bUSINESS DISCUSSION:
Discussion Component
Your React app will use these endpoints to render a Reddit-like comment section.
*/
const DiscussionThread = ({ businessId, token }) => {
  const [comments, setComments] = useState([]);
  
  // Fetch comments on mount
  useEffect(() => {
    fetch(`/api/businesses/${businessId}/comments`)
      .then(res => res.json())
      .then(json => setComments(json.data));
  }, [businessId]);

  const handleComment = async (text, parentId = null) => {
    const res = await fetch(`/api/businesses/${businessId}/comments`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text, parent_id: parentId })
    });
    // Update local state with the new comment...
  };

  return (
    <div className="discussion-container">
      <h3>Join the Discussion</h3>
      {comments.map(comment => (
        <CommentItem key={comment.id} comment={comment} onReply={handleComment} />
      ))}
    </div>
  );
};

/*
5. Why this is the "Democratic" Standard

    Weighted Interests: Proposals with more Upvotes can be boosted in your 60-mile radius feed to show what the community actually wants.
    Accountability: By threading comments, users can debate the feasibility of an idea in an organized way.
    Verification Synergy: If a proposal gets high engagement, you can notify the user that they should proceed to Business Verification and open an "Existing" business. 
*/
