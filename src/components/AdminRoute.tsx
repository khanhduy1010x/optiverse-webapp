import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminRoute } from '../hooks/admin/useAdminRoute.hook';

interface AdminRouteProps {
    children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { isLoading, isAdmin } = useAdminRoute();



    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
    }

    if (!isAdmin) {
        console.log('AdminRoute: Redirecting to dashboard - not admin');
        return <Navigate to="/dashboard" replace />;
    }

    console.log('AdminRoute: Rendering admin content');
    return <>{children}</>;
}; 