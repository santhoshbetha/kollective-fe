import { useState } from 'react';
import { createPortal } from 'react-dom';

const ImageGallery = ({ attachments, initialIndex = 0, onClose }) => {
  const [index, setIndex] = useState(initialIndex);
  const current = attachments[index];

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md" onClick={onClose}>
      {/* 1. Main Image Display */}
      <div className="relative flex-1 flex items-center justify-center">
         <img 
            key={current.url}
            src={current.url} 
            alt={current.alt_text}
            className="max-w-[95%] max-h-[80%] object-contain select-none animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          />
          {/* ... Navigation Arrows ... */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((index - 1 + attachments.length) % attachments.length);
            }}
          >
            ‹
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((index + 1) % attachments.length);
            }}
          >
            ›
          </button>
      </div>

      {/* 2. Floating Caption Bar */}
      {current.description && (
        <div 
          className="w-full max-w-2xl mx-auto mb-8 p-4 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl text-white animate-in slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-sm leading-relaxed text-center italic">
            {current.description}
          </p>
        </div>
      )}

      {/* 3. Footer Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-[10px] font-bold">
        {index + 1} / {attachments.length}
      </div>
    </div>,
    document.body
  );
};

export default ImageGallery;

/*
TODO: elixir
# lib/my_app/repo/migrations/add_description_to_attachments.ex
def change do
  alter table(:post_attachments) do
    add :description, :text # Individual caption
    add :alt_text, :text    # For accessibility (Screen Readers)
  end
end

3. Why this is "Pro" Grade:

    Accessibility (A11y): Adding the alt_text field ensures your Standalone App is usable by visually impaired users via screen readers, fulfilling WCAG 2.1 requirements.
    Visual Hierarchy: By separating the "Post Content" from the "Image Caption," you allow creators to provide context for a specific photo (e.g., "Close-up of the circuit board") without cluttering the main thread.
    Seamless Transitions: Using the key on the image ensures that when the user swivels to the next photo, the new caption "slides in," making the React Gallery feel like a native app.

*/

/*
4. Integration with Elixir
When your Phoenix JSON View returns the attachments array, ensure it looks like this:
%{url: "...", description: "My first prototype", alt_text: "A silver circuit board"}.
Your Media Hub is now the ultimate visual experience.
*/
