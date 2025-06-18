export type AuthViewType =
  | 'login'
  | 'register'
  | 'forgot'
  | 'verify'
  | 'verify-register'
  | 'reset';

export interface AuthView {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export interface UserResponse {
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type RegisterForm = {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  code: string;
};
