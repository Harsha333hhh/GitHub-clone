import axios from 'axios';

// Create axios instance with default config
const isProduction = window.location.hostname !== 'localhost';
const baseURL = isProduction ? '/_/backend' : 'http://localhost:4000';

const axiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: true, // Always send cookies with requests
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosInstance;
