import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import {
  AUTH_ERROR_EVENT,
  TOKEN_REFRESH_SUCCESS,
  SESSION_EXPIRED_EVENT,
} from '../constants/auth.constants';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_URL_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let hasAttemptedRefresh = false;
let refreshSuccessTimestamp = 0;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
  config: InternalAxiosRequestConfig;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
  console.log(`Processing queue with ${failedQueue.length} pending requests`);
  failedQueue.forEach(request => {
    if (error) {
      request.reject(error);
    } else if (token) {
      request.config.headers.Authorization = `Bearer ${token}`;
      request.resolve(api(request.config));
    }
  });

  failedQueue = [];
};

const handleLogout = () => {
  console.log('Session expired: logging out');

  processQueue(new Error('Session expired'), null);

  localStorage.clear();
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));

  if (!window.location.pathname.includes('/')) {
    window.location.href = '/';
  }
};

const resetRefreshState = () => {
  console.log('Resetting refresh token state');
  hasAttemptedRefresh = false;
  refreshSuccessTimestamp = Date.now();
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

let tokenRefreshPromise: Promise<void> | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener(TOKEN_REFRESH_SUCCESS, () => {
    resetRefreshState();

    const newToken = localStorage.getItem('accessToken');
    processQueue(null, newToken);
  });
}

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest?.url || '';

    if (
      requestUrl.includes('auth/login') ||
      requestUrl.includes('refresh-token')
    ) {
      return Promise.reject(error);
    }

    if (
      error.response?.data &&
      ((error.response.data as any).code === 1019 ||
        (error.response.data as any).message === 'Account is log out')
    ) {
      handleLogout();
      return Promise.reject(error);
    }

    const shouldAttemptRefresh = () => {
      // Check for auth error header
      const hasAuthError = error.response?.headers?.['x-auth-error'] === 'true';

      // If we have a specific auth error header, we should attempt refresh
      if (hasAuthError) {
        console.log('Auth error detected from headers, attempting refresh');
        return true;
      }

      return false;
    };

    if (shouldAttemptRefresh() && !originalRequest?.headers['X-Retry']) {
      const now = Date.now();
      const MIN_REFRESH_INTERVAL = 5000;

      if (isRefreshing) {
        console.log('Another refresh is in progress, adding request to queue');
        return new Promise<unknown>((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
            config: originalRequest,
          });
        });
      }

      const retryRequest = new Promise<unknown>((resolve, reject) => {
        failedQueue.push({
          resolve,
          reject,
          config: originalRequest,
        });
      });

      console.log('Starting token refresh process');
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        console.log('Attempting to refresh token...');
        const response = await axios.post(
          `${import.meta.env.VITE_URL_BASE}/core/auth/refresh-token`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const data = response.data;

        if (!data?.data?.access_token) {
          throw new Error('Invalid refresh token response');
        }

        const newToken = data.data.access_token;
        const newRefreshToken = data.data.refresh_token;

        localStorage.setItem('accessToken', newToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        console.log('Token refreshed successfully, processing queue');

        window.dispatchEvent(new Event(TOKEN_REFRESH_SUCCESS));
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        handleLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        tokenRefreshPromise = null;
      }

      return retryRequest;
    }

    return Promise.reject(error);
  }
);

export default api;
