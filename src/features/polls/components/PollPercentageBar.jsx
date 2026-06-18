const PollPercentageBar = ({ percent }) => (
  <div 
    className="absolute inset-y-0 left-0 bg-blue-100 dark:bg-blue-900/40 transition-all duration-700 ease-out rounded-l-md"
    style={{ width: `${percent}%` }}
  />
);
export default PollPercentageBar;