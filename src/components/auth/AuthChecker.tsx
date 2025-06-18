import { useEffect, useState } from 'react';

interface AuthCheckerProps {
    children: React.ReactNode;
}

export const AuthChecker: React.FC<AuthCheckerProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');

            if (accessToken && refreshToken) {
            } else {
                localStorage.clear();
                console.log('User is not authenticated');
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return <>{children}</>;
}; 