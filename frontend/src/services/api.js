import axios from 'axios';

// Determine runtime API base URL:
// - If VITE_API_URL is set (dev or prod env), use it.
// - Otherwise, assume backend runs on the same machine on port 5000 and use that as fallback for preview mode.
const defaultBase = import.meta.env.VITE_API_URL || `${window.location.origin.replace(/:\d+$/, ':5000')}/api`;

const api = axios.create({
  baseURL: defaultBase,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;