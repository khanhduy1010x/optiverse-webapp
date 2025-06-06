export interface ProfileData {
  _id: string;
  user_id?: string;
  email: string;
  full_name: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
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
