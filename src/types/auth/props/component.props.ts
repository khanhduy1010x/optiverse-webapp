export interface LoginFormProps {
  onSwitch: (view: string) => void;
}
export interface UseForgotPasswordOptions {
  onSuccess: (email: string) => void;
}
export interface RegisterFormData {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
export interface UseRegisterFormProps {
  onSuccess: (email: string) => void;
}
export type ResetMessage = {
  type: 'success' | 'error';
  text: string;
} | null;

export interface UseResetPasswordFormProps {
  token: string;
  onSuccess: () => void;
}

export type VerifyOtpType = 'register' | 'forgot';

export interface VerifyOtpOptions {
  email: string;
  type: VerifyOtpType;
  onSuccess?: () => void;
  onToken?: (token: string) => void;
}

export interface VerifyMessage {
  type: 'info' | 'error' | 'success';
  text: string;
}

export interface VerifyOtpFormValues {
  code: string;
}

export interface VerifyOtpScreenProps {
  email: string;
  type: VerifyOtpType;
  onChangeEmail: () => void;
  onSuccess: () => void;
  onToken?: (token: string) => void;
}
