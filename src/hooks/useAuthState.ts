import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useAuthState = (requireAuth: boolean = true, redirectPath: string = '/login') => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        // User needs to be authenticated but isn't
        navigate(redirectPath);
      } else if (!requireAuth && isAuthenticated) {
        // User is authenticated but page doesn't require auth (like login page)
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, loading, requireAuth, redirectPath, navigate]);

  return { isAuthenticated, loading };
};

export const useRequireAuth = () => useAuthState(true, '/login');
export const useRequireGuest = () => useAuthState(false, '/dashboard'); 