import { useState, useEffect } from 'react';
import authService from '../../services/auth.service';

export const useAuthStatus = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      if (!accessToken || !refreshToken) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      // Bước 1: verify token qua API
      let userInfo = await authService.verifyToken();
      if (userInfo) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }
      // Bước 2: refresh token nếu verify fail
      try {
        await authService.refreshToken();
        // Thử verify lại lần nữa
        userInfo = await authService.verifyToken();
        if (userInfo) {
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        // refresh token fail
      }
      // Nếu vẫn fail thì logout
      localStorage.clear();
      setIsAuthenticated(false);
      setIsLoading(false);
    };
    checkAuthStatus();
    // Có thể lắng nghe storage nếu muốn sync đa tab
  }, []);

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    logout,
  };
};
