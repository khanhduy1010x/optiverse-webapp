import { useState, useEffect } from 'react';
import authService from '../../services/auth.service';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { UserRole } from '../../types/admin/user.types';
import { setUser } from '../../store/slices/auth.slice';
import { decodeBase64Utf8 } from '../../utils/base64.utils';

export const useAuthStatus = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const user = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();

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

      try {
        let response = await authService.verifyToken();
        if (response) {
          setIsAuthenticated(true);

          // Lấy thông tin user từ response và cập nhật vào Redux store
          if (response.headers && response.headers['x-user-info']) {
            const userInfo = response.headers['x-user-info'];
            try {
              const userData = JSON.parse(decodeBase64Utf8(userInfo));
              dispatch(setUser(userData));
              if (userData && userData.role === UserRole.ADMIN) {
                setIsAdmin(true);
              } else {
                setIsAdmin(false);
              }
            } catch (e) {
              console.error('Failed to decode/parse x-user-info:', e);
            }
          }

          setIsLoading(false);
          return;
        }

        // Nếu token không hợp lệ, thử refresh token
        await authService.refreshToken();
        response = await authService.verifyToken();

        if (response) {
          setIsAuthenticated(true);

          // Lấy thông tin user từ response và cập nhật vào Redux store
          if (response.headers && response.headers['x-user-info']) {
            const userInfo = response.headers['x-user-info'];
            try {
              const userData = JSON.parse(decodeBase64Utf8(userInfo));
              dispatch(setUser(userData));
              if (userData && userData.role === UserRole.ADMIN) {
                setIsAdmin(true);
              } else {
                setIsAdmin(false);
              }
            } catch (e) {
              console.error(
                'Failed to decode/parse x-user-info (refresh path):',
                e
              );
            }
          }

          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error('Lỗi xác thực:', e);
      }

      localStorage.clear();
      setIsAuthenticated(false);
      setIsAdmin(false);
      setIsLoading(false);
    };

    checkAuthStatus();
  }, [dispatch]);

  useEffect(() => {
    if (user && user.role === UserRole.ADMIN) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return {
    isAuthenticated,
    isLoading,
    isAdmin,
    logout,
  };
};
