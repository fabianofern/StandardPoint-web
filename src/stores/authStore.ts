import { create } from 'zustand';

interface User {
  id: string | number;
  name: string;
  email: string;
  [key: string]: any;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isChecking: boolean;
  hasToolAccess: boolean;
  setAuth: (user: User) => void;
  setUnauthenticated: () => void;
  setAccessDenied: (user?: User) => void;
  setChecking: (isChecking: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isChecking: true,
  hasToolAccess: false,
  
  setAuth: (user) => set({ 
    isAuthenticated: true, 
    user, 
    isChecking: false, 
    hasToolAccess: true 
  }),
  
  setUnauthenticated: () => set({ 
    isAuthenticated: false, 
    user: null, 
    isChecking: false, 
    hasToolAccess: false 
  }),

  setAccessDenied: (user?: User) => set((state) => ({
    isAuthenticated: true,
    user: user || state.user,
    isChecking: false,
    hasToolAccess: false
  })),

  setChecking: (isChecking) => set({ isChecking }),

  logout: () => set({
      isAuthenticated: false,
      user: null,
      isChecking: false,
      hasToolAccess: false
  })
}));
