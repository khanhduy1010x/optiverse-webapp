import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStatus } from '../../hooks/auth/useAuthStatus.hook';
import { useAppDispatch } from '../../store/hooks';
import { setUser } from '../../store/slices/auth.slice';
import authService from '../../services/auth.service';
import { useLoginStreak } from '../../hooks/streak/useLoginStreak.hook';
import { decodeBase64Utf8 } from '../../utils/base64.utils';

interface AuthCheckerProps {
    children: React.ReactNode;
}

export const AuthChecker: React.FC<AuthCheckerProps> = ({ children }) => {
    const { isAuthenticated } = useAuthStatus();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // Use the login streak hook to update streak when user logs in
    useLoginStreak();

    // Use shared decoder to avoid mojibake for Vietnamese names

    useEffect(() => {
        const checkAuth = async () => {
            if (isAuthenticated) {
                try {
                    const response = await authService.verifyToken();
                    if (response && response.headers) {
                        const userInfo = response.headers['x-user-info'];

                        if (userInfo) {
                            // Decode UTF-8 properly for Vietnamese characters
                            const decodedUserInfo = decodeBase64Utf8(userInfo);
                            console.log('🔍 Decoded user info:', decodedUserInfo);
                            try {
                                const userData = JSON.parse(decodedUserInfo);
                                console.log('👤 User data:', userData);
                                // Only dispatch if object looks valid
                                if (userData && (userData.full_name || userData.email || userData.user_id)) {
                                    dispatch(setUser(userData));
                                }
                            } catch (parseErr) {
                                console.error('Failed to parse decoded user info JSON:', parseErr);
                            }

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