//AuthView type definition
export type AuthView =
  | 'login'
  | 'register'
  | 'forgot'
  | 'verify'
  | 'verify-register'
  | 'reset';
//other types here nhe anh em...
export interface FocusSession {
  _id: string;
  user_id: string;
  start_time: string; // ISO string nếu dùng fetch từ backend
  end_time: string;
  createdAt?: string;
  updatedAt?: string;
}