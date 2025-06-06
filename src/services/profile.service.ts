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

/**
 * Get the current user's profile information
 */
export async function getProfile(): Promise<ProfileData> {
  try {
    const response = await api.get('/core/profile');
    console.log('Profile response:', response.data);
    const profileData = response.data.data || response.data;

    // Ensure avatar field is included in the response
    return {
      _id: profileData._id,
      email: profileData.email,
      full_name: profileData.full_name,
      avatar: profileData.avatar_url,
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
export async function updateProfile(
  data: UpdateProfileRequest
): Promise<ProfileData> {
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
    // Check if it's an authentication error
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    }
    throw error;
  }
}

/**
 * Change user's password
 * @param data The password data containing current and new password
 */
export async function changePassword(
  data: ChangePasswordRequest
): Promise<void> {
  try {
    await api.post('/core/auth/change-password', data);
  } catch (error: any) {
    console.error('Error changing password:', error);
    if (error.response?.status === 400) {
      throw new Error(
        error.response.data.message ||
          'Current password is incorrect or invalid password format.'
      );
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
export async function logout(): Promise<void> {
  try {
    // Production code (uncomment when authentication is properly implemented)
    // const token = localStorage.getItem('authToken');
    // if (!token) {
    //   throw new Error('No authentication token found');
    // }

    // Development code (remove in production)
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODI5YTA3MDM5M2I1ODE3OTY4NjA2OTQiLCJlbWFpbCI6Im5ndXllbmtoYW5oZHV5QGdtYWlsLmNvbSIsImZ1bGxfbmFtZSI6IkxhZG8iLCJzZXNzaW9uX2lkIjoiNjg0MTNlNzY2YjBjNzgxZWFkMWYxNjU5IiwiaWF0IjoxNzQ5MTA2Mjk0LCJleHAiOjE3NDkxOTI2OTR9.qGwrujvelYY6QhXaa598OuxsVfJWsLq3ARM7SMHnDvE';

    const payload = decodeToken(token);
    if (!payload || !payload.session_id) {
      throw new Error('Invalid token format');
    }

    await api.post('/core/auth/log-out-single', {
      session_id: payload.session_id,
    });

    // Production code (uncomment when authentication is properly implemented)
    // localStorage.removeItem('authToken');
    // localStorage.removeItem('user');  // If you store user data
    // sessionStorage.clear();  // Clear any session storage data

    // Development code (remove in production)
    window.location.href = '/';
  } catch (error: any) {
    console.error('Error logging out:', error);
    if (error.response?.status === 401) {
      // Production code (uncomment when authentication is properly implemented)
      // localStorage.removeItem('authToken');
      // localStorage.removeItem('user');
      // sessionStorage.clear();

      window.location.href = '/';
      return;
    }
    throw new Error('Failed to logout. Please try again.');
  }
}

/**
 * Get all login sessions for the current user
 */
export async function getLoginSessions(): Promise<UserSessionsResponse> {
  try {
    const response = await api.get('/core/profile/sessions');
    const sessions = response.data.data;

    // Identify current session using the token's session_id
    const token = localStorage.getItem('authToken');
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
export async function logoutSession(sessionId: string): Promise<void> {
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
export async function logoutAllOtherSessions(): Promise<void> {
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
export async function updateAvatar(file: File): Promise<{ avatar: string }> {
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
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    }
    throw new Error('Failed to update avatar. Please try again.');
  }
}

// Export as default object for compatibility with existing code
const profileService = {
  getProfile,
  updateProfile,
  changePassword,
  logout,
  getLoginSessions,
  logoutSession,
  logoutAllOtherSessions,
  updateAvatar,
};

export default profileService;
