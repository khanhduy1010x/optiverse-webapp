import api from './api';
import { decodeToken } from '../utils/jwt';

export interface ProfileData {
  _id: string;
  user_id?: string;
  email: string;
  full_name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileRequest {
  full_name: string;
}

export interface ChangePasswordRequest {
  newPassword: string;
}

export interface LogoutSessionRequest {
  session_id: string;
}

export interface UserSession {
  _id: string;
  user_id: string;
  device_info?: string;
  ip_address?: string;
  refresh_token?: string;
  createdAt?: string;
  updatedAt?: string;
  is_current?: boolean;
}

export interface UserSessionsResponse {
  current_session: UserSession;
  active_sessions: UserSession[];
  previous_sessions: UserSession[];
}

/**
 * Get the current user's profile information
 */
export async function getProfile(): Promise<ProfileData> {
  try {
    const response = await api.get('/core/profile');
    console.log('Profile response:', response.data);
    return response.data.data || response.data;
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
export async function updateProfile(data: UpdateProfileRequest): Promise<ProfileData> {
  try {
    // Ensure data is properly formatted
    const requestData = {
      full_name: data.full_name.toString()
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
 * @param data The new password data
 */
export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  try {
    await api.post('/core/auth/reset-password', data);
  } catch (error: any) {
    console.error('Error changing password:', error);
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Invalid password format. Password must be at least 6 characters.');
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
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODI5YTA3MDM5M2I1ODE3OTY4NjA2OTQiLCJlbWFpbCI6Im5ndXllbmtoYW5oZHV5QGdtYWlsLmNvbSIsImZ1bGxfbmFtZSI6IkxvaVRyYW4iLCJzZXNzaW9uX2lkIjoiNjgzZmVmMzc5MjBhYWIyYjlkZDJiMjI4IiwiaWF0IjoxNzQ5MDIwNDcxLCJleHAiOjE3NDkxMDY4NzF9.re3SfRuomaEUogyHeSV4sdfqzOkqASd7qta9W9isQ_4";

    const payload = decodeToken(token);
    if (!payload || !payload.session_id) {
      throw new Error('Invalid token format');
    }

    await api.post('/core/auth/log-out-single', { session_id: payload.session_id });

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
    const currentSession = sessions.find((s: UserSession) => s._id === currentSessionId);
    if (currentSession) {
      currentSession.is_current = true;
    }

    const otherSessions = sessions.filter((s: UserSession) => s._id !== currentSessionId);

    return {
      current_session: currentSession || otherSessions[0], // Fallback to first session if current not found
      active_sessions: otherSessions.filter((s: UserSession) => s.refresh_token), // Sessions with refresh tokens are active
      previous_sessions: otherSessions.filter((s: UserSession) => !s.refresh_token) // Sessions without refresh tokens are logged out
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

// Export as default object for compatibility with existing code
const profileService = {
  getProfile,
  updateProfile,
  changePassword,
  logout,
  getLoginSessions,
  logoutSession,
  logoutAllOtherSessions
};

export default profileService;
