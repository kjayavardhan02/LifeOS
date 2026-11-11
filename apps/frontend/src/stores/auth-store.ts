import { create } from 'zustand';
import type { User } from '@lifeos/shared';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

function loadToken(): string | null {
  try {
    return localStorage.getItem('lifeos_token');
  } catch {
    return null;
  }
}

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem('lifeos_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: loadUser(),
  token: loadToken(),
  setAuth: (user, token) => {
    localStorage.setItem('lifeos_token', token);
    localStorage.setItem('lifeos_user', JSON.stringify(user));
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('lifeos_token');
    localStorage.removeItem('lifeos_user');
    set({ user: null, token: null });
  },
  isAuthenticated: () => !!get().token,
}));
