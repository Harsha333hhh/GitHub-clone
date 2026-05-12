import { create } from "zustand";
import axiosInstance from "../api/axiosConfig";

export const useAuth = create((set) => ({
  currentUser: JSON.parse(localStorage.getItem('user')) || null,
  loading: false,
  isAuthenticated: !!localStorage.getItem('user'),
  error: null,

  login: async (userCredObj) => {
    try {
      set({ loading: true, error: null });

      const res = await axiosInstance.post('/user-api/login', userCredObj);
      const user = res.data.user || res.data.payload;

      localStorage.setItem('user', JSON.stringify(user));

      set({
        loading: false,
        error: null,
        isAuthenticated: true,
        currentUser: user
      });
      
      return true;
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || "Login failed",
        isAuthenticated: false,
        currentUser: null,
      });
      return false;
    }
  },

  completeSignup: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({
      loading: false,
      error: null,
      isAuthenticated: true,
      currentUser: user
    });
  },

  syncAuthState: () => {
    const user = JSON.parse(localStorage.getItem('user'));
    set({
      currentUser: user || null,
      isAuthenticated: !!user
    });
  },

  logout: async () => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.post('/user-api/logout', {});
      localStorage.removeItem('user');
      
      set({ 
        currentUser: null, 
        loading: false, 
        isAuthenticated: false,
        error: null 
      });
    } catch (err) {
      console.error("Logout failed", err);
      localStorage.clear();
      set({ currentUser: null, isAuthenticated: false, loading: false });
    }
  }
}));