// src/features/polls/components/PollOption.jsx
const PollOption = ({ option, totalVotes, isWinner }) => {
  // Calculate percentage
  const percent = totalVotes > 0 ? Math.round((option.votes_count / totalVotes) * 100) : 0;

  return (
    <div className="poll-option-wrapper">
      <div className="flex justify-between mb-1">
        <span>{option.title}</span>
        <span className="font-bold">{percent}%</span>
      </div>
      
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        {/* CSS transition makes the 'Live' update look like an animation */}
        <div 
          className={`h-full transition-all duration-1000 ease-out ${isWinner ? 'bg-blue-500' : 'bg-gray-400'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
