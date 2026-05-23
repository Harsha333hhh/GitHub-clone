import { create } from "zustand";
import axiosInstance from "../api/axiosConfig";

export const useAuth = create((set) => ({
  currentUser: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  isAuthenticated: !!localStorage.getItem('token'),
  error: null,

  login: async (userCredObj) => {
    try {
      set({ loading: true, error: null });

      const res = await axiosInstance.post('/user-api/login', userCredObj);
      const user = res.data.user || res.data.payload;
      const token = res.data.token;

      // Store both user and token
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      // Update axios default header with new token
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      set({
        loading: false,
        error: null,
        isAuthenticated: true,
        currentUser: user,
        token: token
      });
      
      return true;
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || "Login failed",
        isAuthenticated: false,
        currentUser: null,
        token: null
      });
      return false;
    }
  },

  completeSignup: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({
      loading: false,
      error: null,
      currentUser: user
      // isAuthenticated remains false until user logs in
    });
  },

  syncAuthState: () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    // Set axios header with stored token
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    set({
      currentUser: user || null,
      token: token || null,
      isAuthenticated: !!token
    });
  },

  logout: async () => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.post('/user-api/logout', {});
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      delete axiosInstance.defaults.headers.common['Authorization'];
      
      set({ 
        currentUser: null, 
        token: null,
        loading: false, 
        isAuthenticated: false,
        error: null 
      });
    } catch (err) {
      console.error("Logout failed", err);
      localStorage.clear();
      delete axiosInstance.defaults.headers.common['Authorization'];
      set({ currentUser: null, token: null, isAuthenticated: false, loading: false });
    }
  }
}));