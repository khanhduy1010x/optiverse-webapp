import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStatus } from '../hooks/auth/useAuthStatus.hook';

interface PublicRouteProps {
  children: ReactNode;
  restricted?: boolean; // True means this route is only for non-authenticated users
}

export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  restricted = false
}) => {
  const { isAuthenticated, isLoading } = useAuthStatus();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (isAuthenticated && restricted) {
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}; 