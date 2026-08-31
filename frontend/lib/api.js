import axios from 'axios';

const isBrowser = typeof window !== 'undefined';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || (isBrowser ? '/api' : 'http://127.0.0.1:5000/api'),
  withCredentials: true,
});

// Helper to extract access token from Zustand storage in localStorage
function getStoredAccessToken() {
  if (!isBrowser) return null;
  try {
    const authRaw = localStorage.getItem('job-portal-auth');
    if (authRaw) {
      const parsed = JSON.parse(authRaw);
      return parsed?.state?.accessToken || null;
    }
  } catch {
    // ignore
  }
  return null;
}

function getStoredRefreshToken() {
  if (!isBrowser) return null;
  try {
    const authRaw = localStorage.getItem('job-portal-auth');
    if (authRaw) {
      const parsed = JSON.parse(authRaw);
      return parsed?.state?.refreshToken || null;
    }
  } catch {
    // ignore
  }
  return null;
}

// Automatic token attachment request interceptor
api.interceptors.request.use((config) => {
  if (isBrowser && !config.headers.Authorization && !config.headers.authorization) {
    const token = getStoredAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

// 401 response interceptor for token refresh & retry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || '';
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh-token');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint && isBrowser) {
      const refreshToken = getStoredRefreshToken();

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshRes = await axios.post(
          (process.env.NEXT_PUBLIC_API_BASE_URL || '/api') + '/auth/refresh-token',
          { refreshToken },
          { withCredentials: true }
        );

        const newAccessToken = refreshRes.data?.data?.access_token;
        const newRefreshToken = refreshRes.data?.data?.refresh_token;

        if (newAccessToken) {
          setAuthToken(newAccessToken);

          try {
            const authRaw = localStorage.getItem('job-portal-auth');
            if (authRaw) {
              const parsed = JSON.parse(authRaw);
              if (parsed.state) {
                parsed.state.accessToken = newAccessToken;
                if (newRefreshToken) {
                  parsed.state.refreshToken = newRefreshToken;
                }
                parsed.state.isAuthenticated = true;
                localStorage.setItem('job-portal-auth', JSON.stringify(parsed));
              }
            }
          } catch {
            // ignore
          }

          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
}

function clearAuthToken() {
  delete api.defaults.headers.common.Authorization;
}

export { api, setAuthToken, clearAuthToken };
