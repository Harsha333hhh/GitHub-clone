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

// Handle 401 responses (expired token)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data if token is expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axiosInstance.defaults.headers.common['Authorization'];
      // Redirect to login if needed (component will handle it)
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
