import clsx from "clsx";
import { Check } from "lucide-react";

const PollOptionText = ({ option, index, active, onToggle, multiple }) => (
  <button
    onClick={() => onToggle(index)}
    className={clsx(
      "relative w-full flex items-center justify-between p-3 rounded-xl border transition-all text-sm font-medium",
      active 
        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" 
        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
    )}
  >
    <span className="truncate">{option.title}</span>
    
    {/* Radio/Checkbox visual */}
    <div className={clsx(
      "w-5 h-5 flex items-center justify-center border transition-colors",
      multiple ? "rounded-md" : "rounded-full",
      active ? "bg-blue-500 border-blue-500" : "border-gray-300 dark:border-gray-600"
    )}>
      {active && <Check size={14} className="text-white" />}
    </div>
  </button>
);
export default PollOptionText;