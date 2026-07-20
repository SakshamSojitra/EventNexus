import { create } from 'zustand';
import axios from 'axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'attendee' | 'admin';
  avatar: string;
  referralCode?: string;
  isActive?: boolean;
  isSuspended?: boolean;
}

interface StoreState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setLoading: (v: boolean) => void;
}

export const useStore = create<StoreState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => {
    token ? localStorage.setItem('token', token) : localStorage.removeItem('token');
    set({ token });
  },
  setLoading: (v) => set({ isLoading: v }),

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true });
    } catch (e: any) {
      throw new Error(e.response?.data?.message || 'Login failed');
    } finally {
      set({ isLoading: false });
    }
  },

  adminLogin: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await axios.post('/api/auth/admin/login', { email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true });
    } catch (e: any) {
      throw new Error(e.response?.data?.message || 'Admin login failed');
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await axios.post('/api/auth/register', { name, email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true });
    } catch (e: any) {
      throw new Error(e.response?.data?.message || 'Registration failed');
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { data } = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ user: data, isAuthenticated: true });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
