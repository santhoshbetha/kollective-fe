const truncateFilename = (url, maxLength) => {
  const filename = String(url || '').split('/').pop() || '';
  const max = Number(maxLength) || 0;

  if (!filename) return filename;
  if (max <= 0) return filename;
  if (filename.length <= max) return filename;

  const half = Math.floor(max / 2);
  return [filename.substr(0, half), filename.substr(filename.length - half)].join('…');
};

const formatBytes = (bytes, decimals = 2) => {
  const value = Number(bytes) || 0;
  if (value === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : Math.floor(decimals);
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(value) / Math.log(k));
  const index = Math.min(Math.max(i, 0), sizes.length - 1);

  return parseFloat((value / Math.pow(k, index)).toFixed(dm)) + ' ' + sizes[index];
};

const getVideoDuration = (file) => {
  // Gracefully handle non-browser environments
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return Promise.resolve(0);
  }

  const video = document.createElement('video');

  const promise = new Promise((resolve, reject) => {
    const onLoaded = () => {
      // Chrome bug: https://bugs.chromium.org/p/chromium/issues/detail?id=642012
      if (video.duration === Infinity) {
        // seek to a large value to force duration calculation
        video.currentTime = Number.MAX_SAFE_INTEGER;
        video.ontimeupdate = () => {
          video.ontimeupdate = null;
          resolve(video.duration);
          try {
            video.currentTime = 0;
          } catch (e) {
            // ignore
          }
        };
      } else {
        resolve(video.duration);
      }
    };

    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('error', (event) => reject(event?.target?.error || new Error('Video load error')));
  });

  try {
    video.src = window.URL.createObjectURL(file);
  } catch (e) {
    return Promise.resolve(0);
  }

  return promise;
};

let domParser = null;
try {
  // DOMParser may not be available in some environments (SSR)
  if (typeof DOMParser !== 'undefined') domParser = new DOMParser();
} catch (e) {
  domParser = null;
}

const VideoProviders = {
  RUMBLE: 'rumble.com',
};

/** Try adding autoplay to an iframe embed for platforms such as YouTube. */
const addAutoPlay = (html) => {
  if (!domParser || typeof window === 'undefined') return html;

  try {
    const parsed = domParser.parseFromString(String(html), 'text/html');
    const body = parsed.querySelector('body');
    if (!body) return html;

    const iframe = body.querySelector('iframe');
    if (!iframe) return html;

    // make iframe responsive by default
    iframe.style.width = '100%';
    iframe.style.height = '100%';

    // Normalize src parsing with a base in case src is relative
    let src = iframe.getAttribute('src') || iframe.src || '';
    let url;
    try {
      url = new URL(src, window.location.href);
    } catch (e) {
      return html;
    }

    const provider = url.hostname.replace(/^www\./, '');

    if (provider === VideoProviders.RUMBLE) {
      url.searchParams.append('pub', '7a20');
      url.searchParams.append('autoplay', '2');
    } else {
      url.searchParams.append('autoplay', '1');
      url.searchParams.append('auto_play', '1');
      // preserve existing allow list and ensure autoplay is allowed
      const existingAllow = iframe.getAttribute('allow') || '';
      const allows = existingAllow.split(';').map((s) => s.trim()).filter(Boolean);
      if (!allows.includes('autoplay')) allows.push('autoplay');
      iframe.setAttribute('allow', allows.join('; '));
    }

    iframe.setAttribute('src', url.toString());

    // Return the inner HTML of the body (DOMParser wraps fragments)
    return body.innerHTML;
  } catch (e) {
    return html;
  }
};

export { getVideoDuration, formatBytes, truncateFilename, addAutoPlay };
