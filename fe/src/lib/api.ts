import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with every request
});

// Request interceptor - attach CSRF token for state-changing requests
api.interceptors.request.use(
  (config) => {
    // CSRF token will be read from meta tag or cookie (non-HttpOnly)
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
      || getCsrfFromCookie();
    if (csrfToken && config.method !== 'get') {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle token refresh via cookie
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint - cookies are sent automatically
        await axios.post('/api/v1/auth/refresh-token', {}, { withCredentials: true });

        // Retry the original request (new cookie is now set)
        return api(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

/**
 * Read CSRF token from a non-HttpOnly cookie (double-submit pattern)
 */
function getCsrfFromCookie(): string | null {
  const match = document.cookie.match(/(?:^|; )csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default api;
