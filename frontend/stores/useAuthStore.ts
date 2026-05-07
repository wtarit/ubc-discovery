import { create } from 'zustand';
import { api, type UserResponse } from '@/services/api';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  user: UserResponse | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, fullName: string) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (email: string, code: string) => Promise<boolean>;
  refresh: () => Promise<boolean>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  idToken: null,
  user: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const tokens = await api.login(email, password);
      set({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        idToken: tokens.id_token,
        isLoading: false,
      });
      await get().fetchUser();
      return true;
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
      return false;
    }
  },

  signup: async (email, password, fullName) => {
    set({ isLoading: true, error: null });
    try {
      const result = await api.signup(email, password, fullName);
      set({ isLoading: false });
      return { success: true, message: result.message };
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
      return { success: false, message: e.message };
    }
  },

  verifyEmail: async (email, code) => {
    set({ isLoading: true, error: null });
    try {
      await api.verify(email, code);
      set({ isLoading: false });
      return true;
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
      return false;
    }
  },

  refresh: async () => {
    const { refreshToken } = get();
    if (!refreshToken) return false;
    try {
      const tokens = await api.refreshToken(refreshToken);
      set({
        accessToken: tokens.access_token,
        idToken: tokens.id_token,
      });
      return true;
    } catch {
      return false;
    }
  },

  logout: () => {
    set({
      accessToken: null,
      refreshToken: null,
      idToken: null,
      user: null,
      error: null,
    });
  },

  fetchUser: async () => {
    try {
      const user = await api.getMe();
      set({ user });
    } catch {
      // Token might be invalid
    }
  },

  clearError: () => set({ error: null }),
}));
