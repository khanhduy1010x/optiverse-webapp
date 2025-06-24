export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  start_time?: string | Date;
  end_time?: string | Date;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  tags?: any[]; // Virtual field for tags
  taskTagId?: string; // ID of the task-tag relation (for deletion)
}

export interface TaskTag {
  _id: string;
  name: string;
  color: string;
  taskTagId?: string;
}
