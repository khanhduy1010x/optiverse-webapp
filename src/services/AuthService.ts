import api from './api';
import { ApiResponse, LoginResponse } from '../types/api.types';

export const AuthService = {
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