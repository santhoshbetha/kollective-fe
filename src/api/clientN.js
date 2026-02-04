import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.yourdomain.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the Auth Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token'); // Or from your Zustand store
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle global errors (like 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Logic for Logout or Redirect to Login
      console.error('Unauthorized, logging out...');
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
