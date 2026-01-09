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
        const res = await fetch(`/api/v1/media/${encodeURIComponent(mediaId)}${params ? `?${new URLSearchParams(params).toString()}` : ''}`, { method: 'GET' });
        return res;
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
        if (!res.ok) throw new Error(`Failed to update media (${res.status})`);
        const data = await res.json();
        return data;
      } catch (err) {
        console.error('mediaSlice.updateMedia failed', err);
        return null;
      } 
    },

    // Upload media. Supports JSON body or FormData. If a progress callback is provided
    // and the payload is FormData, use XMLHttpRequest to report progress.
    uploadMedia(data, onUploadProgress = noOp) {
      // If data is FormData and progress callback provided, use XHR for progress events
      if (typeof FormData !== 'undefined' && data instanceof FormData) {
        return new Promise((resolve) => {
          try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/v1/media');

            xhr.upload.onprogress = (evt) => {
              if (evt.lengthComputable && typeof onUploadProgress === 'function') {
                onUploadProgress({ loaded: evt.loaded, total: evt.total, percent: (evt.loaded / evt.total) * 100 });
              }
            };

            xhr.onreadystatechange = () => {
              if (xhr.readyState !== 4) return;
              const status = xhr.status;
              let body = null;
                try {
                  body = xhr.responseText ? JSON.parse(xhr.responseText) : null;
                } catch {
                  body = null;
                }
              // Resolve with a Response-like object { status, json }
              resolve({ status, json: async () => body });
            };

            xhr.onerror = () => resolve(null);
            xhr.send(data);
          } catch (err) {
            console.error('mediaSlice.uploadMedia XHR failed', err);
            resolve(null);
          }
        });
      }

      // Otherwise send as JSON via fetch
      return (async () => {
        try {
          const res = await fetch('/api/v1/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data || {}),
          });
          return res;
        } catch (err) {
          console.error('mediaSlice.uploadMedia failed', err);
          return null;
        }
      })();
    },

    async uploadFile(file, intl, onSuccess = noOp, onFail = noOp, onUploadProgress = noOp) {
      const root = rootGet();
      if (!isLoggedIn(root)) return;

      const cfg = root?.instance?.configuration?.media_attachments || {};
      const maxImageSize = cfg.image_size_limit;
      const maxVideoSize = cfg.video_size_limit;
      const maxVideoDuration = cfg.video_duration_limit;

      if (!file) return onFail(new Error('no_file'));

      const isImage = !!(file.type && file.type.match(/image.*/));
      const isVideo = !!(file.type && file.type.match(/video.*/));
      const videoDurationInSeconds = (isVideo && maxVideoDuration) ? await getVideoDuration(file) : 0;

      if (isImage && maxImageSize && (file.size > maxImageSize)) {
        const limit = formatBytes(maxImageSize);
        const _message = intl.formatMessage(messages.exceededImageSizeLimit, { limit });
        return onFail(new Error('image_size_limit'));
      }

      if (isVideo && maxVideoSize && (file.size > maxVideoSize)) {
        const limit = formatBytes(maxVideoSize);
        const _message = intl.formatMessage(messages.exceededVideoSizeLimit, { limit });
        return onFail(new Error('video_size_limit'));
      }

      if (isVideo && maxVideoDuration && (videoDurationInSeconds > maxVideoDuration)) {
        const _message = intl.formatMessage(messages.exceededVideoDurationLimit, { limit: maxVideoDuration });
        return onFail(new Error('video_duration_limit'));
      }

      try {
        const resized = await resizeImage(file).catch(() => file);
        const form = new FormData();
        form.append('file', resized || file);

        const response = await this.uploadMedia(form, onUploadProgress);
        if (!response) return onFail(new Error('upload_failed'));

        const { status } = response;
        const body = await (typeof response.json === 'function' ? response.json() : null);

        if (status === 200) {
          return onSuccess(body);
        }

        if (status === 202 && body && body.id) {
          const poll = async () => {
            try {
              const r = await this.fetchMedia(body.id);
              if (!r) return onFail(new Error('poll_failed'));
              const s = r.status;
              const b = await r.json();
              if (s === 200) return onSuccess(b);
              if (s === 206 || s === 202) return setTimeout(poll, 1000);
              return onFail(new Error('unexpected_status'));
            } catch (e) {
              return onFail(e);
            }
          };
          poll();
          return;
        }

        return onFail(new Error('unexpected_response'));
      } catch (err) {
        console.error('mediaSlice.uploadFile failed', err);
        return onFail(err);
      }
    },
  };
}

export default createMediaSlice;
