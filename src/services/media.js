import api from '../api'; // Your existing API client

//========API service layer next to see how to handle multiple concurrent uploads=============

/*
To handle multiple concurrent uploads efficiently within the
Soapbox compose feature, you should move the API calls into a dedicated service layer. 
This prevents the hook from becoming a "god object" and keeps your code dry.
*/

export const uploadMedia = (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  return api.post('/api/v1/media', formData, {
    onUploadProgress: (e) => {
      const percent = Math.round((e.loaded * 100) / (e.total || 1));
      onProgress(percent);
    },
  });
};

/*
2. Manage Concurrency in the Hook
In your useMediaUpload hook, you can now trigger multiple uploads simultaneously using 
Promise.all or by simply firing off multiple requests that update their own state index.

    1. Action: When a user selects 3 images, map over the File[] and call uploadMedia for each.
    2. Optimization: Use a limit (e.g., max 4 attachments) to prevent browser-level network 
       congestion, a common standard in Mastodon-compatible clients.

3. Why this achieves "Reduction"

    1.Error Handling: You can centralize "Retry" logic in the service layer instead of writing 
       try/catch blocks in every component.
    2. Bundle Size: By isolating API logic, you ensure that tree-shaking can effectively remove 
       unused service functions if you only use the composer in specific app builds.
    3. Cleaner Features: Your features/compose directory remains focused on User Experience, 
       while the services directory handles the Server Protocol.
*/