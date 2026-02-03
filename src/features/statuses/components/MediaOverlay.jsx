// src/features/statuses/components/MediaOverlay.jsx
import { useState } from 'react';

///Content Warning Overlays
const MediaOverlay = ({ status, children }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  
  if (!status.blurMedia || isRevealed) {
    return <div className="media-container">{children}</div>;
  }

  return (
    <div className="relative group overflow-hidden rounded-lg">
      {/* The actual media is blurred */}
      <div className="filter blur-2xl grayscale brightness-50 transition-all duration-500">
        {children}
      </div>

      {/* The Overlay UI */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white p-4 text-center">
        <span className="mb-2 text-sm font-bold uppercase tracking-widest">
          {status.sensitive ? 'Sensitive Content' : 'Filtered Content'}
        </span>
        <button 
          onClick={() => setIsRevealed(true)}
          className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-md hover:bg-white/30 transition"
        >
          View Content
        </button>
      </div>
    </div>
  );
};

export default MediaOverlay;

