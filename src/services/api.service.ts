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
} from '../contexts/auth.context';

const api: AxiosInstance = axios.create({
  baseURL: 'https://api.optiverse.io.vn',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store pending requests that need to be retried after token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
  config: InternalAxiosRequestConfig;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
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

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
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

// Listen for token refresh success events
let tokenRefreshPromise: Promise<void> | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener(TOKEN_REFRESH_SUCCESS, () => {
    // Retry all requests in the queue with the new token
    const newToken = localStorage.getItem('accessToken');
    processQueue(null, newToken);
  });
}

// Add response interceptor for error handling and token refresh
api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;
    const requestUrl = originalRequest?.url || '';

    // Do not intercept auth/login errors - let them be handled by the components
    if (requestUrl.includes('auth/login')) {
      return Promise.reject(error);
    }

    // Check if error is due to authentication (Unauthenticated, code 1005)
    if (
      error.response?.status === 401 &&
      error.response?.data &&
      (error.response.data as any).code === 1005 &&
      !originalRequest?.headers['X-Retry']
    ) {
      // Dispatch auth error event for the AuthContext to handle
      window.dispatchEvent(new Event(AUTH_ERROR_EVENT));

      // Add this request to the queue
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    // Handle "Account is log out" error (code 1019) with HTTP status 400
    if (
      error.response?.status === 400 ||
      (error.response?.data &&
        (error.response.data as any).code === 1019 &&
        (error.response.data as any).message === 'Account is log out')
    ) {
      console.log('Session expired or logged out: clearing auth data');

      // Dispatch session expired event
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));

      // Clear all localStorage
      localStorage.clear();

      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/')) {
        window.location.href = '/';
      }

      return Promise.reject(error);
    }

    // Handle other errors
    // Don't redirect to login page if we're already on a login-related endpoint
    if (
      error.response?.status === 401 &&
      !requestUrl.includes('auth/login') &&
      !requestUrl.includes('auth/google')
    ) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
