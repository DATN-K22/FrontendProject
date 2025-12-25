import axios from "axios";

const api = axios.create({
  baseURL:  import.meta.url,
  withCredentials: false,
});

// Request interceptor: automatically add Authorization token to requests
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

// Response interceptor: handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors (unauthorized/expired token)
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      // Optionally redirect to login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        // Only show alert if not already on login/signup page
        console.log('Token expired or invalid. Please login again.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
