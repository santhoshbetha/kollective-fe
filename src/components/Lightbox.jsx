import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { X, Download } from 'lucide-react';

/*
1. The Lightbox Component (JSX)
This component uses Tailwind for a blurred backdrop and Lucide for 
a close button. We add a simple Esc key listener for a "Pro" feel.
*/

const Lightbox = ({ src, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return createPortal(
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button className="absolute top-6 right-6 text-white hover:scale-110 transition-transform">
        <X size={32} />
      </button>

      <img 
        src={src} 
        className="max-w-[95%] max-h-[90%] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300" 
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
      />

      <a 
        href={src} 
        download 
        className="absolute bottom-6 right-6 flex items-center gap-2 bg-white/10 hover:bg-white/20 p-3 rounded-full text-white text-sm backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <Download size={18} /> Save Image
      </a>
    </div>,
    document.body
  );
};
export default Lightbox;

/*
To implement a Lightbox, we’ll use a React Portal to break the image out of the TanStack Virtual list's constraints. This allows users to view your 
FFmpeg-generated thumbnails or avatars in high-resolution, full-screen glory.
*/




