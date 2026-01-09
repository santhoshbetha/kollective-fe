// Minimal Entities placeholder
export const Entities = {
  RELATIONSHIPS: "relationships",
};

export const PLEROMA = "pleroma";

export function parseVersion(versionString) {
  if (!versionString) return { software: "unknown" };
  const s = String(versionString).toLowerCase();
  if (s.includes("pleroma")) return { software: PLEROMA };
  return { software: "mastodon" };
}

// Simple fetch wrapper returning an object with json(), text(), next(), pagination()
async function fetchWrapped(url, opts = {}) {
  const res = await fetch(url, opts);
  return {
    status: res.status,
    json: () => res.json(),
    text: () => res.text(),
    next: () => null,
    pagination: () => ({ next: null }),
  };
}

export const api = {
  request: (method, path, params, opts) => {
    const search =
      opts && opts.searchParams
        ? "?" + new URLSearchParams(opts.searchParams).toString()
        : "";
    const url = path + search;
    const headers = (opts && opts.headers) || {
      "Content-Type": "application/json",
    };
    const body =
      method === "GET" || method === "HEAD"
        ? undefined
        : JSON.stringify(params);
    return fetchWrapped(url, { method, headers, body });
  },
  get: (path, opts) => api.request("GET", path, null, opts),
  post: (path, params, opts) => api.request("POST", path, params, opts),
  put: (path, params, opts) => api.request("PUT", path, params, opts),
  delete: (path, opts) => api.request("DELETE", path, null, opts),
};

export default {
  api,
  Entities,
  parseVersion,
  PLEROMA,
};
