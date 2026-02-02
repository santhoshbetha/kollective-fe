// src/features/compose/store/useComposeStore.js
import { create } from 'zustand';

export const useComposeStore = create((set) => ({
  attachments: [], // Array of Attachment objects
  
  addAttachment: (attachment) => 
    set((state) => ({ attachments: [...state.attachments, attachment] })),
    
  removeAttachment: (id) => 
    set((state) => ({ 
      attachments: state.attachments.filter(a => a.id !== id) 
    })),

  clearAttachments: () => set({ attachments: [] }),
}));


/*
const MediaUploader = () => {
  const { mutate: upload, isPending } = useUploadMedia();
  const addAttachment = useComposeStore((s) => s.addAttachment);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    upload({ file }, {
      onSuccess: (data) => {
        addAttachment(data); // Push the server-generated Attachment into Zustand
      },
      onError: (err) => {
        alert("Upload failed: " + err.message);
      }
    });
  };

  return (
    <div className="uploader">
      <input type="file" onChange={handleFileChange} disabled={isPending} />
      {isPending && <p>Uploading...</p>}
    </div>
  );
};

Reducers: All ADD_MEDIA, REMOVE_MEDIA cases are deleted.

*/

//==================================================================================
/*
interface ComposeState {
  text: string;
  spoilerText: string;
  privacy: 'public' | 'unlisted' | 'private' | 'direct';
  mediaIds: string[];
  isSubmitting: boolean;
  
  // Actions
  setText: (text: string) => void;
  setPrivacy: (privacy: any) => void;
  addMediaId: (id: string) => void;
  resetCompose: () => void;
}

*/
export const useComposeStore = create((set) => ({
  text: '',
  spoilerText: '',
  privacy: 'public',
  mediaIds: [],
  isSubmitting: false,

  setText: (text) => set({ text }),
  setPrivacy: (privacy) => set({ privacy }),
  addMediaId: (id) => set((state) => ({ mediaIds: [...state.mediaIds, id] })),
  resetCompose: () => set({ text: '', spoilerText: '', mediaIds: [], isSubmitting: false }),
}));
/*
DELETE: src/stores/slices/composeSlice.ts.
REPLACE: updateComposeStatus with setText.
REPLACE: submitStatus thunk with useSubmitStatus mutation.
*/

//==================================================================================
// src/features/compose/store/useComposeStore.js
export const useComposeStore = create((set, get) => ({
  text: '',
  // ... other state
  
  selectSuggestion: (suggestion, token, position) => {
    const { text } = get();
    let completion = '';
    let startPos = position;

    if (suggestion.acct) { // It's an account
      completion = suggestion.acct;
    } else if (suggestion.name && token.startsWith('#')) { // It's a tag
      completion = suggestion.name;
      startPos = position - 1;
    }

    // Standard string manipulation logic
    const newText = text.substring(0, startPos) + completion + ' ' + text.substring(position + token.length);
    
    set({ text: newText });
  }
}));

//==================================================================================
//Automatic Alt-Text Reminders
// you utilize Zustand to track the state of your attachments in the compose box. This ensures that if a user tries to "Post" a status with images missing descriptions, 
// the UI provides a subtle nudge or blocks the submission until accessibility requirements are met.
// src/features/compose/store/useComposeStore.js
export const useComposeStore = create((set, get) => ({
  attachments: [], // Array of { id, file, description }
  
  // Validation: Check if any image is missing alt-text
  getMissingAltText: () => {
    return get().attachments.filter(a => !a.description || a.description.trim() === '');
  },

  updateDescription: (id, text) => set((state) => ({
    attachments: state.attachments.map(a => a.id === id ? { ...a, description: text } : a)
  })),
}));

/*
 Implementation: The Warning Badge
Add this to your ComposeForm.jsx, It reacts instantly as the user types descriptions for their uploads.
const AltTextReminder = () => {
  const missing = useComposeStore(s => s.getMissingAltText());
  
  if (missing.length === 0) return null;

  return (
    <div className="flex items-center gap-2 p-2 mb-2 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs animate-pulse">
      <AlertIcon size={14} />
      <span>{missing.length} image(s) missing descriptions. Adding alt-text helps screen-reader users!</span>
    </div>
  );
};

*/
