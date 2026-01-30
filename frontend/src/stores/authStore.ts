import { create } from 'zustand';
import authService, { User } from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loadUser: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: authService.getCurrentUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const { user } = await authService.login({ email, password });
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isLoading: false
      });
      throw error;
    }
  },

  register: async (email, password, name) => {
    try {
      set({ isLoading: true, error: null });
      const { user } = await authService.register({ email, password, name });
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Registration failed',
        isLoading: false
      });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  loadUser: () => {
    console.log('[AuthStore] loadUser called');
    const user = authService.getCurrentUser();
    const isAuthenticated = authService.isAuthenticated();
    console.log('[AuthStore] User from localStorage:', user);
    console.log('[AuthStore] isAuthenticated:', isAuthenticated);
    set({ user, isAuthenticated });
  },

  clearError: () => set({ error: null }),
}));
