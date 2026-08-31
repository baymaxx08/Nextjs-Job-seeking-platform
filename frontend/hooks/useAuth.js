import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { api, clearAuthToken, setAuthToken } from '../lib/api';
import { useAuthStore } from '../store/authStore';

function useAuth() {
  const router = useRouter();
  const {
    user,
    accessToken,
    role,
    isAuthenticated,
    hasHydrated,
    setSession,
    setUser,
    setAccessToken,
    clearSession,
  } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      setAuthToken(accessToken);
      return;
    }

    clearAuthToken();
  }, [accessToken]);

  const login = async (values) => {
    const response = await api.post('/auth/login', values);
    const payload = response.data?.data;

    if (payload?.access_token) {
      setSession({
        user: payload.user,
        accessToken: payload.access_token,
        refreshToken: payload.refresh_token,
      });
      setAuthToken(payload.access_token);
    }

    return payload;
  };

  const register = async (userRole, values) => {
    const endpoint = userRole === 'provider' ? '/auth/register/provider' : '/auth/register/seeker';
    const response = await api.post(endpoint, values);
    const payload = response.data?.data;

    if (payload?.access_token) {
      setSession({
        user: payload.user,
        accessToken: payload.access_token,
        refreshToken: payload.refresh_token,
      });
      setAuthToken(payload.access_token);
    }

    return payload;
  };

  const refreshSession = async () => {
    const stored = useAuthStore.getState();
    const response = await api.post('/auth/refresh-token', {
      refreshToken: stored.refreshToken,
    });
    const payload = response.data?.data;

    if (payload?.access_token) {
      setSession({
        user: payload.user,
        accessToken: payload.access_token,
        refreshToken: payload.refresh_token,
      });
      setAuthToken(payload.access_token);
    }

    return payload;
  };

  const loadCurrentUser = async () => {
    const response = await api.get('/auth/me');
    const payload = response.data?.data;

    if (payload?.user) {
      setUser(payload.user);
    }

    return payload?.user || null;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearSession();
      clearAuthToken();
      router.push('/login');
    }
  };

  return {
    user,
    accessToken,
    role,
    isAuthenticated,
    hasHydrated,
    login,
    register,
    refreshSession,
    loadCurrentUser,
    logout,
    setSession,
    setUser,
    setAccessToken,
    clearSession,
  };
}

export { useAuth };