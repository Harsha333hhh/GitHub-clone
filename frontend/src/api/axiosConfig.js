import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  withCredentials: true, // Always send cookies with requests
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosInstance;
