export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: 'pending' | 'completed' | 'overdue';
  priority?: 'low' | 'medium' | 'high';
  start_time?: string | Date;
  end_time?: string | Date;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'pending' | 'completed' | 'overdue';
  priority?: 'low' | 'medium' | 'high';
  start_time?: string | Date;
  end_time?: string | Date;
}
