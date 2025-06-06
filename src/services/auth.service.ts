import api from './api.service';
import { ApiResponse, LoginResponse } from '../types/api.types';

export const AuthService = {
  loginWithEmail: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('core/auth/login', { email, password });
      
      // Check if response has the expected structure
      if (!response.data || !response.data.data || !response.data.data.access_token) {
        throw new Error('Invalid response format from server');
      }
      
      const { access_token, refresh_token } = response.data.data;
      
      // Save tokens to localStorage
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      
      return response.data.data;
    } catch (error: any) {
      console.error('Login failed:', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      
      // Throw specific error for 401 status (Unauthorized)
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password. Please try again.');
      }
      
      // Try to extract error message from different response formats
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        error.message ||
        'Login failed. Please try again later.';
        
      throw new Error(errorMessage);
    }
  },
  
  loginWithGoogle: async (token: string): Promise<LoginResponse> => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('core/auth/google', { token: token, is_web: true });
      const { access_token, refresh_token } = response.data.data;
      
      // Save tokens to localStorage
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      
      return response.data.data;
    } catch (error: any) {
      console.error('Google login failed:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Google login failed');
    }
  },
  
  refreshToken: async (): Promise<LoginResponse> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
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
      
      // Save tokens to localStorage
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      
      return response.data.data;
    } catch (error: any) {
      console.error('Token refresh failed:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Token refresh failed');
    }
  },
  
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}; 