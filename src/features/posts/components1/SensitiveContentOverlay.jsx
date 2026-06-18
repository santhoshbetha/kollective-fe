import { Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';

const SensitiveContentOverlay = ({ status, visible, onToggleVisibility }) => {
  // If the user clicked "Show", we show a small "Hide" button in the corner
  if (visible) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
        className="absolute bottom-2 right-2 z-50 flex items-center gap-1 rounded bg-black/50 px-2 py-1 text-xs text-white hover:bg-black/70"
      >
        <EyeOff size={14} /> Hide
      </button>
    );
  }

  // The "Blocked" state with blur
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center rounded-lg bg-gray-900/60 backdrop-blur-xl">
      <div className="p-4 text-center text-white">
        <h4 className="font-bold">Sensitive content</h4>
        <p className="mb-4 text-xs opacity-80">This content may not be suitable for all audiences.</p>
        
        {status.spoiler_text && (
          <p className="mb-4 italic text-sm">"{status.spoiler_text}"</p>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
          className="flex items-center gap-2 mx-auto rounded-full border border-white px-4 py-1.5 text-sm font-medium hover:bg-white/10"
        >
          <Eye size={16} /> Show Content
        </button>
      </div>
    </div>
  );
};

export default SensitiveContentOverlay;
