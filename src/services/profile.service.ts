import api from './api.service';
import { decodeToken } from '../utils/jwt';
import {
  ProfileData,
  UserSession,
  UserSessionsResponse,
} from '../types/profile/response/profile.response';
import {
  ChangePasswordRequest,
  UpdateProfileRequest,
} from '../types/profile/request/profile.request';

class ProfileService {
  /**
   * Get the current user's profile information
   */
  public async getProfile(): Promise<ProfileData> {
    try {
      const response = await api.get('/core/profile');
      console.log('Profile response:', response.data);
      const profileData = response.data.data || response.data;
      console.log('Profile data:', profileData.has_password);
      // Ensure avatar field is included in the response
      return {
        _id: profileData._id,
        email: profileData.email,
        full_name: profileData.full_name,
        avatar: profileData.avatar_url,
        has_password: profileData.has_password,
        membership: profileData.membership,
      };
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw error;
    }
  }

  /**
   * Update the current user's profile information
   * @param data The profile data to update (currently only supports full_name)
   */
  public async updateProfile(data: UpdateProfileRequest): Promise<ProfileData> {
    try {
      // Ensure data is properly formatted
      const requestData = {
        full_name: data.full_name.toString(),
      };
      console.log('Updating profile:', requestData);
      const response = await api.patch('/core/profile', requestData);
      console.log('Update profile response:', response.data);
      // Handle different response structures that might come from the backend
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error updating profile:', error);

      // Handle specific error codes from backend
      if (error.response?.data?.code) {
        switch (error.response.data.code) {
          case 1022:
            throw new Error('Name cannot contain numbers');
          case 1023:
            throw new Error('Name cannot contain special characters');
          case 1024:
            throw new Error('Name is too long');
          case 1025:
            throw new Error('Name cannot be blank');
          default:
            throw new Error(
              error.response.data.message || 'Failed to update profile'
            );
        }
      }

      // Handle authentication error
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }

      // Handle other errors
      throw new Error('Failed to update profile. Please try again.');
    }
  }

  /**
   * Change user's password
   * @param data The password data containing current and new password
   */
  public async changePassword(data: ChangePasswordRequest): Promise<void> {
    try {
      await api.post('/core/auth/change-password', data);
    } catch (error: any) {
      console.error('Error changing password:', error);

      // Handle specific error codes from backend
      if (error.response?.data?.code) {
        switch (error.response.data.code) {
          case 1001:
            throw new Error('Current password is incorrect');
          case 1002:
            throw new Error(
              'New password must be different from current password'
            );
          case 1003:
            throw new Error('Password must be at least 8 characters long');
          case 1004:
            throw new Error(
              'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
            );
          default:
            throw new Error(
              error.response.data.message || 'Failed to change password'
            );
        }
      }

      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error('Failed to change password. Please try again.');
    }
  }

  /**
   * Logout from current session
   */
  public async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const payload = decodeToken(token);
      if (!payload || !payload.session_id) {
        throw new Error('Invalid token format');
      }

      await api.post('/core/auth/log-out-single', {
        session_id: payload.session_id,
      });

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken'); // If you store user data
      sessionStorage.clear(); // Clear any session storage data

      window.location.href = '/';
    } catch (error: any) {
      console.error('Error logging out:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.clear();

        window.location.href = '/';
        return;
      }
      throw new Error('Failed to logout. Please try again.');
    }
  }

  /**
   * Get all login sessions for the current user
   */
  public async getLoginSessions(): Promise<UserSessionsResponse> {
    try {
      const response = await api.get('/core/profile/sessions');
      const sessions = response.data.data;

      // Identify current session using the token's session_id
      const token = localStorage.getItem('accessToken');
      const currentSessionId = token ? decodeToken(token)?.session_id : null;

      // Transform the data to match our frontend structure
      const currentSession = sessions.find(
        (s: UserSession) => s._id === currentSessionId
      );
      if (currentSession) {
        currentSession.is_current = true;
      }

      const otherSessions = sessions.filter(
        (s: UserSession) => s._id !== currentSessionId
      );
      console.log(otherSessions);

      return {
        current_session: currentSession || otherSessions[0], // Fallback to first session if current not found
        active_sessions: otherSessions.filter(
          (s: UserSession) => s.refresh_token
        ), // Sessions with refresh tokens are active
        previous_sessions: otherSessions.filter(
          (s: UserSession) => !s.refresh_token
        ), // Sessions without refresh tokens are logged out
      };
    } catch (error: any) {
      console.error('Error fetching login sessions:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error('Failed to fetch login sessions. Please try again.');
    }
  }

  /**
   * Logout from a specific session
   * @param sessionId The ID of the session to logout from
   */
  public async logoutSession(sessionId: string): Promise<void> {
    try {
      await api.post('/core/auth/log-out-single', { session_id: sessionId });
    } catch (error: any) {
      console.error('Error logging out session:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      if (error.response?.status === 404) {
        throw new Error('Session not found.');
      }
      throw new Error('Failed to logout session. Please try again.');
    }
  }

  /**
   * Logout from all sessions except the current one
   */
  public async logoutAllOtherSessions(): Promise<void> {
    try {
      await api.post('/core/auth/log-out-multi');
    } catch (error: any) {
      console.error('Error logging out all sessions:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error('Failed to logout all sessions. Please try again.');
    }
  }

  /**
   * Update user's avatar
   * @param file The image file to upload
   */
  public async updateAvatar(file: File): Promise<{ avatar: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/core/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data;
    } catch (error: any) {
      console.error('Error updating avatar:', error);

      // Handle specific error codes from backend
      if (error.response?.data?.code) {
        switch (error.response.data.code) {
          case 2001:
            throw new Error('File size too large. Maximum size is 5MB');
          case 2002:
            throw new Error(
              'Invalid file type. Only JPG, PNG and GIF are allowed'
            );
          case 2003:
            throw new Error('Image dimensions too large. Maximum size is 50MB');

          default:
            throw new Error(
              error.response.data.message || 'Failed to update avatar'
            );
        }
      }

      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error('Failed to update avatar. Please try again.');
    }
  }

  /**
   * Delete user's account (soft delete)
   */
  public async deleteAccount(): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const payload = decodeToken(token);
      if (!payload || !payload.sub) {
        throw new Error('Invalid token format');
      }

      await api.delete(`/core/users/${payload.sub}/delete-account`);

      // Clear all authentication data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.clear();

      // Redirect to home page
      window.location.href = '/';
    } catch (error: any) {
      console.error('Error deleting account:', error);

      // Handle specific error codes from backend
      if (error.response?.data?.code) {
        switch (error.response.data.code) {
          case 1045:
            throw new Error('User not found');
          case 1046:
            throw new Error('User account has already been deleted');
          default:
            throw new Error(
              error.response.data.message || 'Failed to delete account'
            );
        }
      }

      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete this account');
      }
      throw new Error('Failed to delete account. Please try again.');
    }
  }
}

export default new ProfileService();
