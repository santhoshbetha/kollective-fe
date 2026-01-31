// Action-only slice for media uploads and management. No local state — only actions.
import { defineMessages} from 'react-intl'
import { formatBytes, getVideoDuration }  from "../../utils/media";
import { isLoggedIn } from "../../utils/auth";
import resizeImage from "../../utils/resize-image";

const messages = defineMessages({
  exceededImageSizeLimit: { id: 'upload_error.image_size_limit', defaultMessage: 'Image exceeds the current file size limit ({limit})' },
  exceededVideoSizeLimit: { id: 'upload_error.video_size_limit', defaultMessage: 'Video exceeds the current file size limit ({limit})' },
  exceededVideoDurationLimit: { id: 'upload_error.video_duration_limit', defaultMessage: 'Video exceeds the current duration limit ({limit, plural, one {# second} other {# seconds}})' },
});


// uploadFile uses XMLHttpRequest to allow progress callbacks. Other operations use fetch.
export function createMediaSlice(setScoped, getScoped, rootSet, rootGet) {
  const noOp = (e) => {};

  return {

    // Return the raw Fetch Response so callers can inspect status (used for polling)
    async fetchMedia(mediaId, params) {
      try {
        const query = params ? `?${new URLSearchParams(params)}` : '';
        return await fetch(`/api/v1/media/${encodeURIComponent(mediaId)}${query}`);
      } catch (err) {
        console.error('mediaSlice.fetchMedia failed', err);
        return null;
      }
    },

    async updateMedia(mediaId, params) {
      try {
        const res = await fetch(`/api/v1/media/${mediaId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params || {}),
        });
        if (!res.ok) throw new Error(`Update failed: ${res.status}`);
        return await res.json();
      } catch (err) {
        console.error('mediaSlice.updateMedia failed', err);
        return null;
      }
    },

    // Upload media. Supports JSON body or FormData. If a progress callback is provided
    // and the payload is FormData, use XMLHttpRequest to report progress.
    uploadMedia(data, onUploadProgress = noOp) {
      if (data instanceof FormData) {
        return new Promise((resolve) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/api/v1/media');

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              onUploadProgress({ loaded: e.loaded, total: e.total, percent: (e.loaded / e.total) * 100 });
            }
          };

          xhr.onload = () => {
            let body = null;
            try { body = JSON.parse(xhr.responseText); } catch (e) { /* ignore */ }
            resolve({ status: xhr.status, json: async () => body });
          };

          xhr.onerror = () => resolve(null);
          xhr.send(data);
        });
      }

      return (async () => {
        try {
          return await fetch('/api/v1/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data || {}),
          });
        } catch (err) {
          return null;
        }
      })();
    },

    async uploadFile(file, intl, onSuccess = noOp, onFail = noOp, onUploadProgress = noOp) {
      const actions = getScoped();
      if (!isLoggedIn(rootGet()) || !file) return onFail(new Error(file ? 'unauthorized' : 'no_file'));

      const { image_size_limit: maxImg, video_size_limit: maxVid, video_duration_limit: maxDur } = 
        rootGet()?.instance?.configuration?.media_attachments || {};

      const isImage = file.type?.startsWith('image/');
      const isVideo = file.type?.startsWith('video/');

      // Validation logic
      if (isImage && maxImg && file.size > maxImg) {
        return onFail(new Error('image_size_limit'), intl.formatMessage(messages.exceededImageSizeLimit, { limit: formatBytes(maxImg) }));
      }
      if (isVideo) {
        if (maxVid && file.size > maxVid) {
          return onFail(new Error('video_size_limit'), intl.formatMessage(messages.exceededVideoSizeLimit, { limit: formatBytes(maxVid) }));
        }
        const duration = maxDur ? await getVideoDuration(file) : 0;
        if (maxDur && duration > maxDur) {
          return onFail(new Error('video_duration_limit'), intl.formatMessage(messages.exceededVideoDurationLimit, { limit: maxDur }));
        }
      }

      try {
        const resized = await resizeImage(file).catch(() => file);
        const form = new FormData();
        form.append('file', resized);

        const response = await actions.uploadMedia(form, onUploadProgress);
        if (!response) return onFail(new Error('upload_failed'));

        const body = await (typeof response.json === 'function' ? response.json() : null);
        const status = response.status;

        if (status === 200) return onSuccess(body);

        // Polling logic for async processing (202 Accepted)
        if (status === 202 && body?.id) {
          const poll = async () => {
            const r = await actions.fetchMedia(body.id);
            if (!r) return onFail(new Error('poll_failed'));
            
            const b = await r.json();
            if (r.status === 200) return onSuccess(b);
            if ([202, 206].includes(r.status)) return setTimeout(poll, 1000);
            onFail(new Error('unexpected_status'));
          };
          return poll();
        }

        onFail(new Error('unexpected_response'));
      } catch (err) {
        onFail(err);
      }
    },
  };
}

export default createMediaSlice;
