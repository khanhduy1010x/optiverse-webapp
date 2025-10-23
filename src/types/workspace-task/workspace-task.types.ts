// User type definition
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Subtask {
  _id: string;
  title: string;
  description?: string;
  assigned_to: User;
  status: 'to-do' | 'in-progress' | 'done';
  completed_by?: string;
  completed_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceTask {
  _id: string;
  workspace_id: string;
  title: string;
  description?: string;
  created_by: User;
  assigned_to?: User;
  status: 'to-do' | 'in-progress' | 'done';
  subtasks: Subtask[];
  subtask_completed_count: number;
  completed_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Request DTOs
export interface CreateTaskRequest {
  title: string;
  description?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'to-do' | 'in-progress' | 'done';
  assigned_to?: string;
}

export interface CreateSubtaskRequest {
  title: string;
  description?: string;
  assigned_to: string;
}

export interface UpdateSubtaskRequest {
  title?: string;
  description?: string;
  assigned_to?: string;
  status?: 'to-do' | 'in-progress' | 'done';
}

// Response DTOs
export interface WorkspaceTaskResponse {
  task: WorkspaceTask;
}

export interface WorkspaceTasksResponse {
  tasks: WorkspaceTask[];
}
