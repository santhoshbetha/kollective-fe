import PollOption from "./polls/PollOption";

const PollPreview = ({ poll }) => {
  if (!poll?.options) return null;

  return (
    <div className="space-y-2 mt-2">
      {poll.options.map((option, i) => (
        <PollOption
          key={i}
          index={i}
          option={option}
          poll={poll}
          showResults={false} // Always false in preview
          active={false}
          onToggle={() => {}} // No-op in preview
        />
      ))}
      <div className="text-[10px] text-gray-400 uppercase tracking-widest px-1">
        Poll Preview
      </div>
    </div>
  );
};

export default PollPreview;

/*
2. Updated PollPreview (using the new PollOption)
We use showResults={false} here because it's a "Pending" state (the user hasn't voted yet, 
they are just seeing the post they are about to send).
*/
