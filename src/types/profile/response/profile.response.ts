export interface MembershipPackage {
  _id: string;
  name: string;
  level: number;
  opBonusCredits: number;
  duration_days: number;
  price?: number;
}

export interface UserMembership {
  package_id: MembershipPackage;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'cancelled';
}

export interface ProfileData {
  _id: string;
  user_id?: string;
  email: string;
  full_name: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  has_password?: boolean;
  membership?: UserMembership;
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
