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
    // Only handle 401 for critical endpoints, not for notification API
    // This prevents notification API failures from logging out the user
    if (error.response?.status === 401 && !is401HandlingInProgress) {
      const url = error.config?.url || '';
      
      console.error('401 Unauthorized from:', url);
      console.error('Response:', error.response?.data);
      
      // Don't clear auth for notification API - it's non-critical
      if (url.includes('notification-api')) {
        console.warn('Ignoring 401 from notification-api (non-critical)');
        return Promise.reject(error);
      }
      
      is401HandlingInProgress = true;
      
      console.warn('Clearing authentication due to 401 from:', url);
      
      // Clear auth data if token is expired (for critical APIs only)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axiosInstance.defaults.headers.common['Authorization'];
      
      // Dynamically import and call clearAuth from auth store to avoid circular dependencies
      import('../store/authStore.js').then(({ useAuth }) => {
        if (useAuth && useAuth.getState && typeof useAuth.getState === 'function') {
          useAuth.setState({
            currentUser: null,
            token: null,
            isAuthenticated: false,
            error: 'Session expired. Please login again.'
          });
        }
      }).catch(err => console.error('Failed to update auth store:', err));
      
      // Reset the flag after a brief delay
      setTimeout(() => {
        is401HandlingInProgress = false;
      }, 1000);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
