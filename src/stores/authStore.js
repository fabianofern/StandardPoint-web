import { create } from 'zustand';

export const useAuthStore = create((set) => ({
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

  setAccessDenied: (user) => set({
    isAuthenticated: true,
    user,
    isChecking: false,
    hasToolAccess: false
  }),

  setChecking: (isChecking) => set({ isChecking }),

  logout: () => set({
      isAuthenticated: false,
      user: null,
      isChecking: false,
      hasToolAccess: false
  })
}));
