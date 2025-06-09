export interface FocusSession {
  _id: string;
  user_id: string;
  start_time: string; // ISO string nếu dùng fetch từ backend
  end_time: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FocusTimerResponse {
  _id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  createdAt?: string;
  updatedAt?: string;
}
