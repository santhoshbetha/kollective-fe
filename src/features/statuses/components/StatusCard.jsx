const StatusCard = ({ status }) => {
  if (status.filtered) {
    return <div className="filter-placeholder">Hidden: {status.filter_titles[0]}</div>;
  }

  return <div className="status-body">{status.content}</div>;
};

// ================================================================
// Filter Highlights
const StatusCard = ({ status }) => {
  return (
    <div className={`status-card border-l-4 ${status.highlightClass || 'border-transparent'}`}>
      <div className="status-content">
        {status.content}
      </div>
      {status.highlightClass && (
        <span className="text-xs font-bold uppercase p-1">
          Matched: {status.filter_titles[0]}
        </span>
      )}
    </div>
  );
};

