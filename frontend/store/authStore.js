import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      role: null,
      isAuthenticated: false,
      hasHydrated: false,
      setSession: ({ user, accessToken, refreshToken }) =>
        set((state) => ({
          user,
          accessToken,
          refreshToken: refreshToken !== undefined ? refreshToken : state.refreshToken,
          role: user?.role || null,
          isAuthenticated: Boolean(user && accessToken),
        })),
      setUser: (user) =>
        set((state) => ({
          user,
          role: user?.role || state.role,
          isAuthenticated: Boolean(user && state.accessToken),
        })),
      setAccessToken: (accessToken) =>
        set((state) => ({
          accessToken,
          isAuthenticated: Boolean(state.user && accessToken),
        })),
      setTokens: (accessToken, refreshToken) =>
        set((state) => ({
          accessToken,
          refreshToken: refreshToken || state.refreshToken,
          isAuthenticated: Boolean(state.user && accessToken),
        })),
      clearSession: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          role: null,
          isAuthenticated: false,
        }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'job-portal-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!error && state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);

export { useAuthStore };