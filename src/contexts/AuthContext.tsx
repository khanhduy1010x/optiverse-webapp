import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { ApiResponse, LoginResponse } from '../types/api.types';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (googleToken: string) => Promise<LoginResponse>;
  logout: () => void;
  refreshTokens: () => Promise<boolean>;
  user: any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a custom event for auth errors
export const AUTH_ERROR_EVENT = 'auth_error';
export const TOKEN_REFRESH_SUCCESS = 'token_refresh_success';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any | null>(null);

  // Check token validity on mount
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        // Verify token by making an authenticated request
        // This could be a lightweight endpoint like "verify-token" or "me" endpoint
        // For now we'll just check if there's a token and assume it's valid
        setIsAuthenticated(true);
        
        // Optional: get user profile if you have an endpoint for it
        // const userProfile = await UserService.getProfile();
        // setUser(userProfile);
      } catch (error) {
        // If verification fails, try to refresh token
        try {
          const refreshSuccess = await refreshTokens();
          setIsAuthenticated(refreshSuccess);
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          setIsAuthenticated(false);
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Listen for auth errors
  useEffect(() => {
    const handleAuthError = async (event: Event) => {
      // Try to refresh token
      try {
        const success = await refreshTokens();
        if (success) {
          // Dispatch success event to retry failed requests
          window.dispatchEvent(new CustomEvent(TOKEN_REFRESH_SUCCESS));
        } else {
          logout();
        }
      } catch (error) {
        logout();
      }
    };

    // Add event listener for auth errors
    window.addEventListener(AUTH_ERROR_EVENT, handleAuthError);

    return () => {
      window.removeEventListener(AUTH_ERROR_EVENT, handleAuthError);
    };
  }, []);

  const login = async (googleToken: string): Promise<LoginResponse> => {
    try {
      const response = await AuthService.loginWithGoogle(googleToken);
      setIsAuthenticated(true);
      // Optional: get user info if available in response
      // setUser(response.user);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  // Function to refresh tokens
  const refreshTokens = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        return false;
      }

      const response = await api.post<ApiResponse<LoginResponse>>(
        'core/auth/refresh-token',
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`
          }
        }
      );

      const { access_token, refresh_token } = response.data.data;
      
      // Save new tokens
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      // If refresh fails, clear tokens and require re-login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsAuthenticated(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      loading, 
      login, 
      logout, 
      refreshTokens, 
      user 
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 