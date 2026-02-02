import { useMutation } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useUploadMedia = () => {
  return useMutation({
    // 1. The API Call
    mutationFn: async ({ file, description, focus }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (description) formData.append('description', description);
      if (focus) formData.append('focus', focus);

      // Mastodon/Pleroma endpoint for media uploads
      const { data } = await api.post('/api/v1/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data; // Returns the Attachment object { id, url, type, etc. }
    },
  });
};
