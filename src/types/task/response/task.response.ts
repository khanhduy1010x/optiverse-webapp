export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  tags?: any[]; // Virtual field for tags
  taskTagId?: string; // ID of the task-tag relation (for deletion)
  start_time?: string | Date; // Thời gian bắt đầu task
  end_time?: string | Date; // Thời gian kết thúc task (deadline)
}

export interface TaskTag {
  _id: string;
  name: string;
  color: string;
  taskTagId?: string;
}
