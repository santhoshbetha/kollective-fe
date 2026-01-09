import { ApiResponse } from "./apiResponse";
export class ApiClient {
  constructor(baseURL, accessToken, fetch) {
    this.fetch = fetch;
    this.baseUrl = baseURL;
    this.accessToken = accessToken;
  }

  async request(method, endpoint, data = null, headers = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      method: method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    if (this.accessToken) {
      config.headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await this.fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }
      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async get(endpoint, headers = {}) {
    return this.request("GET", endpoint, null, headers);
  }

  async post(endpoint, data, headers = {}) {
    return this.request("POST", endpoint, data, headers);
  }

  async put(endpoint, data = null, headers = {}) {
    return this.request('PUT', endpoint, data, headers);
  }

  async delete(endpoint, headers = {}) {
    return this.request('DELETE', endpoint, null, headers);
  }

  async patch(endpoint, data, headers = {}) {
    return this.request("PATCH", endpoint, data, headers);
  }

  async head(endpoint, headers = {}) {
    return this.request('HEAD', endpoint, undefined, headers);
  }

  async options(endpoint, headers = {}) {
    return this.request('OPTIONS', endpoint, undefined, headers);
  }

  /**
  * Perform an XHR request from the native `Request` object and get back a `MastodonResponse`.
  * This is needed because unfortunately `fetch` does not support upload progress.
  */
  async xhr(request, opts = {}){
    const xhr = new XMLHttpRequest();
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    xhr.responseType = 'arraybuffer';

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) {
        return;
      }

      const headers = new Headers(
        xhr.getAllResponseHeaders()
          .trim()
          .split(/[\r\n]+/)
          .map((line) => {
            const [name, ...rest] = line.split(': ');
            const value = rest.join(': ');
            return [name, value];
          }),
      );

      const response = new ApiResponse(xhr.response, {
        status: xhr.status,
        statusText: xhr.statusText,
        headers,
      });

      resolve(response);
    };

    xhr.onerror = () => {
      reject(new TypeError('Network request failed'));
    };

    xhr.onabort = () => {
      reject(new DOMException('The request was aborted', 'AbortError'));
    };

    if (opts.onUploadProgress) {
      xhr.upload.onprogress = opts.onUploadProgress;
    }

    if (opts.signal) {
      opts.signal.addEventListener('abort', () => xhr.abort(), { once: true });
    }

    xhr.open(request.method, request.url, true);

    for (const [name, value] of request.headers) {
      xhr.setRequestHeader(name, value);
    }

    xhr.send(await request.arrayBuffer());

    return promise;
  }

}

// Export an instance of the client for easy use
//const apiClient = new ApiClient('http://localhost:5000/api'); // Replace with your backend URL
//export default apiClient;
