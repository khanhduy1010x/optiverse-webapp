import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  TOKEN_REFRESH_SUCCESS,
  SESSION_EXPIRED_EVENT,
} from '../constants/auth.constants';
import { logout } from '../store/slices/auth.slice';
import {
  achievementResponseInterceptor,
  achievementErrorInterceptor,
} from '../utils/achievementInterceptor';
import { BASE_URL } from '../config/env.config';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Hàm refresh token khi role thay đổi
const handleRoleChangeRefresh = async (config: InternalAxiosRequestConfig) => {
  try {
    console.log('Role changed, refreshing token...');

    // Gọi API refresh token
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(
      `${import.meta.env.VITE_URL_BASE}/auth/refresh`,
      {
        refresh_token: refreshToken,
      }
    );

    const { access_token, refresh_token } = response.data.data;

    // Cập nhật tokens
    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('refreshToken', refresh_token);

    // Cập nhật header cho request hiện tại
    config.headers.Authorization = `Bearer ${access_token}`;

    console.log('Token refreshed successfully after role change');
    return api(config);
  } catch (error) {
    console.error('Failed to refresh token after role change:', error);
    handleLogout();
    return Promise.reject(error);
  }
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

if (typeof window !== 'undefined') {
  window.addEventListener(TOKEN_REFRESH_SUCCESS, () => {
    resetRefreshState();

    const newToken = localStorage.getItem('accessToken');
    processQueue(null, newToken);
  });
}

api.interceptors.response.use(
  async response => {
    // Kiểm tra user banned
    if (
      response.headers['x-user-banned'] === 'true' ||
      response.data?.code === 'USER_IS_BANNED' ||
      response.data?.code === 1040
    ) {
      if (window.showUserBannedModal) window.showUserBannedModal();
      window.store?.dispatch?.(logout());
    }

    // Kiểm tra role change
    if (response.headers['x-role-changed'] === 'true') {
      console.log(
        'Role changed detected, new role:',
        response.headers['x-new-role']
      );

      // Dispatch event để thông báo role change
      window.dispatchEvent(
        new CustomEvent('ROLE_CHANGED', {
          detail: { newRole: response.headers['x-new-role'] },
        })
      );
    }

    // Gọi achievement interceptor để tự động đánh giá achievements
    return await achievementResponseInterceptor(response);
  },
  async error => {
    const originalRequest = error.config;

    // Kiểm tra user banned
    if (
      error?.response?.headers['x-user-banned'] === 'true' ||
      error?.response?.data?.code === 'USER_IS_BANNED' ||
      error?.response?.data?.code === 1040
    ) {
      if (window.showUserBannedModal) window.showUserBannedModal();
      window.store?.dispatch?.(logout());
    }

    // Kiểm tra role change trong error response
    if (error?.response?.headers['x-role-changed'] === 'true') {
      console.log(
        'Role changed detected in error response, new role:',
        error.response.headers['x-new-role']
      );

      // Thử refresh token và retry request
      try {
        const result = await handleRoleChangeRefresh(originalRequest);
        return result;
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // Gọi achievement error interceptor
    return achievementErrorInterceptor(error);
  }
);

declare global {
  interface Window {
    showUserBannedModal?: () => void;
    store: any;
  }
}

export default api;
