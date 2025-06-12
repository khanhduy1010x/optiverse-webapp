export interface RegisterRequest {
  email: string;
  full_name: string;
  password: string;
}

interface VerifyBase {
  email: string;
  type: 'forgot' | 'register';
}

export interface VerifyRequest extends VerifyBase {
  otp: string;
}

export interface ResendCodeRequest extends VerifyBase {}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
