export interface UpdateProfileRequest {
  full_name: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface LogoutSessionRequest {
  session_id: string;
}
