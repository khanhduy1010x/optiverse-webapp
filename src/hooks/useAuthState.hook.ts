import { useState, useEffect } from 'react';
import authService from '../services/auth.service';
import profileService from '../services/profile.service';
import api from '../services/api.service';
import { decodeToken } from '../utils/jwt-decode';
import { useNavigate } from 'react-router-dom';
import SocketService from '../services/socket.service';

export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = localStorage.getItem('accessToken');
    return !!token;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const navigate = useNavigate();

  // Check if user is authenticated and get user info
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('accessToken');

        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Get user data
        try {
          const userData = await profileService.getProfile();
          setUser(userData);
          setIsAuthenticated(true);

          // Lưu user_id vào localStorage
          if (userData && userData.user_id) {
            localStorage.setItem('user_id', userData.user_id);
            // Thiết lập currentUserId cho SocketService
            SocketService.setCurrentUserId(userData.user_id);
          }

          // Get active session based on the current token
          const decodedToken = decodeToken(token);
          if (decodedToken && decodedToken.session_id) {
            const activeSessions = await profileService.getActiveSessions();
            const currentSession = activeSessions.find(
              (session: any) => session._id === decodedToken.session_id
            );
            setActiveSession(currentSession);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);

          // Try refreshing the token if authentication fails
          try {
            await authService.refreshToken();
            const userData = await profileService.getProfile();
            setUser(userData);
            setIsAuthenticated(true);

            // Lưu user_id vào localStorage sau khi refresh token
            if (userData && userData.user_id) {
              localStorage.setItem('user_id', userData.user_id);
              // Thiết lập currentUserId cho SocketService
              SocketService.setCurrentUserId(userData.user_id);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            handleLogout();
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle refresh token
  useEffect(() => {
    // Setup interceptors for automatic token refresh
    const interceptor = api.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        // If error is 401 and we haven't already tried to refresh
        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            await authService.refreshToken();

            // Update token in the original request
            const token = localStorage.getItem('accessToken');
            originalRequest.headers['Authorization'] = `Bearer ${token}`;

            // Retry the original request
            return api(originalRequest);
          } catch (refreshError) {
            console.error('Auto token refresh failed:', refreshError);
            handleLogout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    // Xóa user_id khi đăng xuất
    localStorage.removeItem('user_id');
    setIsAuthenticated(false);
    setUser(null);
    setActiveSession(null);
    navigate('/login');
  };

  const handleLogin = async (
    email: string,
    password: string,
    deviceInfo: string
  ) => {
    try {
      await authService.loginWithEmail(email, password, deviceInfo);
      const userData = await profileService.getProfile();
      setUser(userData);
      setIsAuthenticated(true);

      // Lưu user_id vào localStorage khi đăng nhập
      if (userData && userData.user_id) {
        localStorage.setItem('user_id', userData.user_id);
        // Thiết lập currentUserId cho SocketService
        SocketService.setCurrentUserId(userData.user_id);
      }

      // Get active session
      const token = localStorage.getItem('accessToken');
      if (token) {
        const decodedToken = decodeToken(token);
        if (decodedToken && decodedToken.session_id) {
          const activeSessions = await profileService.getActiveSessions();
          const currentSession = activeSessions.find(
            (session: any) => session._id === decodedToken.session_id
          );
          setActiveSession(currentSession);
        }
      }

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const refreshSessionData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const decodedToken = decodeToken(token);
      if (decodedToken && decodedToken.session_id) {
        const activeSessions = await profileService.getActiveSessions();
        const currentSession = activeSessions.find(
          (session: any) => session._id === decodedToken.session_id
        );
        setActiveSession(currentSession);
      }
    } catch (error) {
      console.error('Failed to refresh session data:', error);
    }
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    activeSession,
    refreshSessionData,
    login: handleLogin,
    logout: handleLogout,
  };
}

// Hook wrapper cho trang yêu cầu đăng nhập
export const useRequireAuth = () => {
  const auth = useAuthState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      navigate('/login');
    }
  }, [auth.isLoading, auth.isAuthenticated, navigate]);

  return auth;
};

// Hook wrapper cho trang không yêu cầu đăng nhập (như trang login)
export const useRedirectIfAuthenticated = () => {
  const auth = useAuthState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated) {
      navigate('/task');
    }
  }, [auth.isLoading, auth.isAuthenticated, navigate]);

  return auth;
};
