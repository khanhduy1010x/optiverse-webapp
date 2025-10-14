import { ApiResponse } from '../types/api/api.interface';
import {
  RegisterRequest,
  ResendCodeRequest,
  ResetPasswordRequest,
  VerifyRequest,
} from '../types/auth/request/auth.request';
import { LoginResponse } from '../types/auth/response/auth.reponse';
import { UserResponse } from '../types/auth/auth.types';
import { ErrorCode, ErrorDetails } from '../types/error-code.enum';
import api from './api.service';
class AuthService {
  private readonly authPath = '/core/auth';

  public async loginWithEmail(
    email: string,
    password: string,
    device_info?: any
  ): Promise<LoginResponse> {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>(
        'core/auth/login',
        { email, password, device_info }
      );

      if (
        !response.data ||
        !response.data.data ||
        !response.data.data.access_token
      ) {
        throw new Error('Invalid response format from server');
      }

      const { access_token, refresh_token } = response.data.data;
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);

      // Lấy thông tin user và lưu user_id
      const userInfo = await this.getUserInfo();
      localStorage.setItem('user_id', userInfo.user_id);

      return response.data.data;
    } catch (error: any) {
      console.error('Login failed:', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      if (error.response?.status === 401) {
        throw new Error('Invalid email or password. Please try again.');
      }
      if (error.response?.data.code === 1015) {
        throw error;
      }

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (typeof error.response?.data === 'string'
          ? error.response.data
          : null) ||
        error.message ||
        'Login failed. Please try again later.';

      throw new Error(errorMessage);
    }
  }

  public async loginWithGoogle(
    token: string,
    device_info?: any
  ): Promise<LoginResponse> {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>(
        'core/auth/google',
        { token: token, is_web: true, device_info }
      );
      const { access_token, refresh_token } = response.data.data;
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);

      // Lấy thông tin user và lưu user_id
      const userInfo = await this.getUserInfo();
      localStorage.setItem('user_id', userInfo.user_id);

      return response.data.data;
    } catch (error: any) {
      console.error('Google login failed:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Google login failed');
    }
  }

  public logout() {
    localStorage.clear();
  }

  public async getUserInfo(): Promise<UserResponse> {
    const response = await api.get<ApiResponse<UserResponse>>('core/auth/me');
    return response.data.data;
  }

  public async register(registerRequest: RegisterRequest): Promise<any> {
    try {
      const response = await api.post<ApiResponse<RegisterRequest>>(
        `${this.authPath}/register`,
        {
          email: registerRequest.email,
          full_name: registerRequest.full_name,
          password: registerRequest.password,
        } as RegisterRequest
      );
      const data = response.data.data;
      return data;
    } catch (error: any) {
      throw error;
    }
  }

  public async forgotPassword(email: string): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.authPath}/send-otp-reset-password`,
        {
          email,
          isVerify: false,
        }
      );
      const data = response.data.data;
      return data;
    } catch (e) {
      throw e;
    }
  }

  public async verifyCode(verifyRequest: VerifyRequest): Promise<any> {
    const response = await api.post<ApiResponse<any>>(
      `${this.authPath}/verify-account`,
      {
        email: verifyRequest.email,
        otp: verifyRequest.otp,
        isVerify: verifyRequest.type === 'register',
      }
    );
    const data = response.data;
    return data;
  }

  public async resetPassword(
    resetPassword: ResetPasswordRequest
  ): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.authPath}/reset-password`,
        {
          newPassword: resetPassword.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${resetPassword.token}`,
          },
        }
      );
      const data = response.data.data;
      return data;
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    }
    return null;
  }

  public async resendCode(request: ResendCodeRequest): Promise<any> {
    const response = await api.post<ApiResponse<any>>(
      `${this.authPath}/resend-otp`,
      {
        email: request.email,
        isVerify: request.type === 'register',
      }
    );
    const data = response.data;
    return data;
  }

  public async verifyToken() {
    try {
      const response = await api.get('/core/auth/verify');
      return response;
    } catch (error: any) {
      return null;
    }
  }

  public async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');
    const response = await api.post(
      '/core/auth/refresh-token',
      {},
      {
        headers: { Authorization: `Bearer ${refreshToken}` },
      }
    );
    const data = response.data?.data;
    if (!data?.access_token) throw new Error('Invalid refresh token response');
    localStorage.setItem('accessToken', data.access_token);
    localStorage.setItem('refreshToken', data.refresh_token);
  }
}

export default new AuthService();
