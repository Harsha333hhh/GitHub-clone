import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  withCredentials: true, // Always send cookies with requests
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to every request
axiosInstance.interceptors.request.use(
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

// Handle 401 responses (expired token) - but be smart about it
let is401HandlingInProgress = false;
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401 once to avoid infinite loops
    if (error.response?.status === 401 && !is401HandlingInProgress) {
      is401HandlingInProgress = true;
      
      // Clear auth data if token is expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axiosInstance.defaults.headers.common['Authorization'];
      
      // Reset the flag after a brief delay
      setTimeout(() => {
        is401HandlingInProgress = false;
      }, 1000);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
