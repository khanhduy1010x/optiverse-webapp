import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStatus } from '../auth/useAuthStatus.hook';

export const useAdminRoute = () => {
  const { isAuthenticated, isLoading, isAdmin } = useAuthStatus();
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/');
      } else if (!isAdmin) {
        navigate('/dashboard');
      }

      setIsChecking(false);
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  return { isLoading: isLoading || isChecking, isAdmin };
};
