// lightweight media uploader used for development/testing
export async function uploadFile(file, intl, onSuccess, onError, onProgress) {
  try {
    if (onProgress) onProgress({ loaded: 0 });
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/v1/media", {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      const err = new Error(`Upload failed: ${res.status}`);
      if (onError) onError(err);
      throw err;
    }

    const json = await res.json();
    if (onProgress) onProgress({ loaded: 100 });
    if (onSuccess) onSuccess(json);
    return json;
  } catch (err) {
    if (onError) onError(err);
    throw err;
  }
}

export default { uploadFile };
