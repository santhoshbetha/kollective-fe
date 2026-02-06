import { useState } from "react";

// features/compose/hooks/useMediaUpload.ts
export const useMediaUpload = () => {
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // 1. Unified Selection Logic
  const onUpload = (files) => {
    setIsUploading(true);
    // Logic to call your API (e.g., POST /api/v1/media)
    // and append result to the attachments array
  };

  // 2. State-driven Deletion
  const onRemove = (id) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // 3. Automated Error Handling
  // Logic to clear failed uploads automatically

  return { attachments, onUpload, onRemove, isUploading };
};

/*
Why This Reduces the Codebase

    Decoupled View: Your main composer component no longer needs to know how a file is sent to the server. It only needs to map through the attachments array and display thumbnails 1.4.10.
    Reusability: This same hook can be imported into the Direct Message feature or Edit Post feature without duplicating a single line of logic.
    UI Library Synergy: It perfectly complements the Soapbox 3.0 UI library by providing clean props for HStack and Button components 1.3.1.

Specific Components to Delete
Once this logic is moved to a hook, you can often delete or heavily simplify:

    src/features/compose/components/UploadButton.tsx (now just a "dumb" button).
    src/features/compose/components/AttachmentList.tsx (now just a list view)
*/

//=======================upload progress bars========================
// features/compose/hooks/useMediaUpload.ts
/*
    To include upload progress without causing the entire composer to lag, you should manage 
    progress at the individual attachment level rather than the global state.
    By using the XHR onUploadProgress event or Axios onUploadProgress, you can update 
    a specific ID in your state array.

    The Hook with Progress Logic
    Update your useMediaUpload.ts to track progress per file:
*/
export const useMediaUpload2 = () => {
  const [attachments, setAttachments] = useState([]);

  const onUpload = (file) => {
    const tempId = Math.random().toString();
    
    // Add placeholder with 0% progress
    setAttachments(prev => [...prev, { id: tempId, file, progress: 0, isUploading: true }]);

    // Example using Axios for progress tracking
    api.post('/api/v1/media', { file }, {
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        updateAttachment(tempId, { progress: percent });
      }
    }).then(response => {
      // Replace placeholder with final server data
      updateAttachment(tempId, { ...response.data, isUploading: false });
    });
  };

  const updateAttachment = (id, data) => {
    setAttachments(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  };

  return { attachments, onUpload };
};
/*
The Lean UI Component
Instead of the main Compose component handling the bars, create a 
tiny AttachmentThumbnail that reads the progress:
// features/compose/components/AttachmentThumbnail.tsx
export const AttachmentThumbnail = ({ attachment }) => (
  <Box position="relative">
    <img src={attachment.previewUrl} />
    {attachment.isUploading && (
      <div className="progress-bar-overlay">
        <div style={{ width: `${attachment.progress}%` }} />
      </div>
    )}
  </Box>
);
*/

//========================="multiple uploads"============================
import { useState } from 'react';
import { uploadMedia } from '../../../services/media'; // The service we created

/*
To implement multiple uploads efficiently in useMediaUpload, you can wrap the selection loop in Promise.all. 
This ensures you can track when the entire batch is finished, which is useful for disabling 
the "Post" button until all images are ready.
*/

export const useMediaUpload3 = () => {
  const [attachments, setAttachments] = useState([]);
  const [isBatchUploading, setIsBatchUploading] = useState(false);

  const onUpload = async (files) => {
    if (!files) return;

    setIsBatchUploading(true);
    const fileArray = Array.from(files);

    // 1. Create placeholders for all files immediately
    const newAttachments = fileArray.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      isUploading: true,
    }));

    setAttachments(prev => [...prev, ...newAttachments]);

    // 2. Fire all uploads concurrently using Promise.all
    try {
      await Promise.all(
        fileArray.map((file, index) => {
          const targetId = newAttachments[index].id;
          
          return uploadMedia(file, (percent) => {
            // Update individual progress
            updateAttachment(targetId, { progress: percent });
          }).then(response => {
            // Success: Replace placeholder with server data
            updateAttachment(targetId, { ...response.data, isUploading: false });
          }).catch(err => {
            // Error: Mark this specific one as failed
            updateAttachment(targetId, { isUploading: false, error: true });
          });
        })
      );
    } finally {
      setIsBatchUploading(false);
    }
  };

  const updateAttachment = (id, data) => {
    setAttachments(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  };

  return { attachments, onUpload, isBatchUploading };
};

/*
Why use Promise.all here?

    Speed: Files upload in parallel rather than one-by-one, significantly improving UX for users 
    on fast connections.
    State Control: isBatchUploading stays true until the last file in the selection finishes. 
    You can bind this to your "Post" button in the Soapbox Compose UI to prevent users from 
    submitting a post with half-uploaded images.
    Error Isolation: If one upload fails, the others in the Promise.all block can still succeed, 
    allowing the user to retry just the failed one.

    Browsers typically limit concurrent connections to the same domain (usually 6). If a user 
    selects 10+ images, Promise.all will fire them all, but the browser will queue them. For a 
    production-grade Soapbox 3.0 implementation, this is perfectly fine for the 4-attachment 
    limit typical of Mastodon-style posts. "retry logic function" is next.
**/

//-----------------------------------------------------------
/*  retry logic function  
To add
retry logic, you simply expose a function from your hook that re-triggers the uploadMedia 
service for a specific attachment ID. This is much cleaner than re-uploading the entire batch.
*/

// src/features/compose/hooks/useMediaUpload.ts
export const useMediaUpload = () => {
  const [attachments, setAttachments] = useState<any[]>([]);

  const uploadFile = async (id, file) => {
    updateAttachment(id, { isUploading: true, error: false, progress: 0 });

    try {
      const response = await uploadMedia(file, (percent) => {
        updateAttachment(id, { progress: percent });
      });
      // Replace with server data (e.g., actual media ID from Mastodon API)
      updateAttachment(id, { ...response.data, isUploading: false });
    } catch (err) {
      updateAttachment(id, { isUploading: false, error: true });
    }
  };

  const onUpload = (files) => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const id = Math.random().toString(36).substr(2, 9);
      // Initialize state
      setAttachments(prev => [...prev, { id, file, progress: 0, isUploading: true }]);
      // Start upload
      uploadFile(id, file);
    });
  };

  // The "Retry" function
  const onRetry = (id) => {
    const item = attachments.find(a => a.id === id);
    if (item && item.file) {
      uploadFile(id, item.file);
    }
  };

  const updateAttachment = (id, data) => {
    setAttachments(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  };

  return { attachments, onUpload, onRetry };
};

/*
In your AttachmentThumbnail.tsx, you can now 
conditionally render a Retry Button if the error state is true.
export const AttachmentThumbnail = ({ attachment, onRetry }) => (
  <Box className="thumbnail-wrapper">
    <img src={URL.createObjectURL(attachment.file)} alt="upload preview" />
    
    {attachment.error && (
      <div className="error-overlay">
        <p>Upload Failed</p>
        <Button size="xs" onClick={() => onRetry(attachment.id)}>
          Retry
        </Button>
      </div>
    )}
  </Box>
);


*/
