import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.BACKEND_URI || 'http://localhost:3000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url, 'Full URL:', config.baseURL + config.url);
    // Add any request interceptors here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - let the component handle navigation
      // Don't redirect here to avoid page refreshes
      console.log('Unauthorized access - component should handle redirect');
    }
    return Promise.reject(error);
  }
);

export default api;
