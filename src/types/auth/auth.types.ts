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
export interface AuthState {
  user: { userId: string; email: string } | null;
}

export type RegisterForm = {
  full_name: string;
  email: string;
  password: string;
};
