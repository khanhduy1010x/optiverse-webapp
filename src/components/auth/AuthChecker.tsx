import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStatus } from '../../hooks/auth/useAuthStatus.hook';
import { useAppDispatch } from '../../store/hooks';
import { setUser } from '../../store/slices/auth.slice';
import authService from '../../services/auth.service';
import { useLoginStreak } from '../../hooks/streak/useLoginStreak.hook';

interface AuthCheckerProps {
    children: React.ReactNode;
}

export const AuthChecker: React.FC<AuthCheckerProps> = ({ children }) => {
    const { isAuthenticated } = useAuthStatus();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    
    // Use the login streak hook to update streak when user logs in
    useLoginStreak();

    useEffect(() => {
        const checkAuth = async () => {
            if (isAuthenticated) {
                try {
                    const response = await authService.verifyToken();
                    if (response && response.headers) {
                        const userInfo = response.headers['x-user-info'];

                        if (userInfo) {
                            const userData = JSON.parse(atob(userInfo));
                            dispatch(setUser(userData));

                            // Kiểm tra chuyển hướng từ server
                            const redirectUrl = response.headers['x-redirect-url'];
                            if (redirectUrl) {
                                navigate(redirectUrl);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error verifying token:', error);
                }
            }
        };

        checkAuth();
    }, [isAuthenticated, dispatch, navigate]);

    return <>{children}</>;
}; 