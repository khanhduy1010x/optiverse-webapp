import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth.context';

interface PublicRouteProps {
  children: ReactNode;
  restricted?: boolean; // True means this route is only for non-authenticated users
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  restricted = false 
}) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  // Show loading state while checking auth
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If authenticated and route is restricted (like login page), redirect to dashboard or original page
  if (isAuthenticated && restricted) {
    return <Navigate to={from} replace />;
  }

  // Route is public or user is not authenticated
  return <>{children}</>;
}; 