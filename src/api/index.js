import { ApiClient } from "./apiClient";

//san this api
/**
 * API client.
 */
export default () => {
  const baseURL = import.meta.env.VITE_BACKEND_URL;

  return new ApiClient(baseURL);
};
