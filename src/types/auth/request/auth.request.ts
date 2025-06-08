export interface RegisterRequest {
  email: string;
  full_name: string;
  password: string;
}

export interface VerifyRequest {
  email: string;
  otp: string;
  type: 'forgot' | 'register';
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
