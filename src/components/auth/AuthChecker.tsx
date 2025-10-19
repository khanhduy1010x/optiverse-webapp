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

    // Helper function to decode base64 with UTF-8 support
    const decodeBase64UTF8 = (str: string): string => {
        try {
            // Decode base64 to bytes
            const binaryString = atob(str);
            // Convert to Uint8Array
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            // Decode UTF-8
            return new TextDecoder('utf-8').decode(bytes);
        } catch (error) {
            console.error('Error decoding base64 UTF-8:', error);
            // Fallback to regular atob
            return atob(str);
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            if (isAuthenticated) {
                try {
                    const response = await authService.verifyToken();
                    if (response && response.headers) {
                        const userInfo = response.headers['x-user-info'];

                        if (userInfo) {
                            // Decode UTF-8 properly for Vietnamese characters
                            const decodedUserInfo = decodeBase64UTF8(userInfo);
                            console.log('🔍 Decoded user info:', decodedUserInfo);
                            const userData = JSON.parse(decodedUserInfo);
                            console.log('👤 User data:', userData);
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