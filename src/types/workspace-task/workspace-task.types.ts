// User type definition
export interface User {
  _id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

export interface WorkspaceTask {
  _id: string;
  workspace_id: string;
  title: string;
  description?: string;
  created_by: string;  // ObjectId from backend
  assigned_to?: string;  // ObjectId from backend (optional)
  status: 'to-do' | 'in-progress' | 'done';
  completed_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Request DTOs
export interface CreateTaskRequest {
  title: string;
  description?: string;
  assigned_to?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'to-do' | 'in-progress' | 'done';
  assigned_to?: string;
}

// Response DTOs
export interface WorkspaceTaskResponse {
  task: WorkspaceTask;
}

export interface WorkspaceTasksResponse {
  tasks: WorkspaceTask[];
}
