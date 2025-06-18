import { useState, useEffect } from 'react';

export const useAuthStatus = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      // Có cả 2 token = đang đăng nhập
      const authenticated = !!(accessToken && refreshToken);
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    };

    checkAuthStatus();

    // Lắng nghe sự thay đổi của localStorage
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
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
