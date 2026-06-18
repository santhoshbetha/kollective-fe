const PostCard = ({ post }) => {
  if (post.filtered) {
    return <div className="filter-placeholder">Hidden: {post.filter_titles[0]}</div>;
  }

  return <div className="post-body">{post.content}</div>;
};

// ================================================================
// Filter Highlights
const PostCard2 = ({ post }) => {
  return (
    <div className={`post-card border-l-4 ${post.highlightClass || 'border-transparent'}`}>
      <div className="post-content">
        {post.content}
      </div>
      {post.highlightClass && (
        <span className="text-xs font-bold uppercase p-1">
          Matched: {post.filter_titles[0]}
        </span>
      )}
    </div>
  );
};

export default PostCard2;
export { PostCard };
