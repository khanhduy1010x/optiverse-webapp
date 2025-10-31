// User type definition
export interface User {
  _id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

// Task Permission Types
export enum TaskPermissionType {
  VIEW_ALL = 'VIEW_ALL',
  VIEW_ASSIGNED = 'VIEW_ASSIGNED',
  EDIT_ALL = 'EDIT_ALL',
  EDIT_ASSIGNED = 'EDIT_ASSIGNED',
  EDIT_OWN = 'EDIT_OWN',
  DELETE_ALL = 'DELETE_ALL',
  DELETE_ASSIGNED = 'DELETE_ASSIGNED',
  DELETE_OWN = 'DELETE_OWN',
  CREATE_TASK = 'CREATE_TASK',
  ASSIGN_TASK = 'ASSIGN_TASK',
  TRANSFER_OWNERSHIP = 'TRANSFER_OWNERSHIP',
}

export enum TaskRolePreset {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
  RESTRICTED = 'RESTRICTED',
}

export interface TaskMemberPermission {
  _id: string;
  task_id: string;
  member_id: string;
  role: TaskRolePreset;
  permissions: TaskPermissionType[];
  is_owner: boolean;
  granted_by?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceTask {
  _id: string;
  workspace_id: string;
  title: string;
  description?: string;
  created_by: string;  // ObjectId from backend
  assigned_to?: string;  // ObjectId from backend (optional) - primary assignee
  assigned_to_list?: string[];  // Array of ObjectIds for multiple assignees
  status: 'to-do' | 'in-progress' | 'done';
  completed_at?: Date;
  end_time?: Date;  // Deadline for the task
  createdAt: Date;
  updatedAt: Date;
}

// Request DTOs
export interface CreateTaskRequest {
  title: string;
  description?: string;
  assigned_to?: string;  // Primary assignee
  assigned_to_list?: string[];  // Multiple assignees
  end_time?: string | Date;  // ISO 8601 or Date object
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'to-do' | 'in-progress' | 'done';
  assigned_to?: string;  // Primary assignee
  assigned_to_list?: string[];  // Multiple assignees
  end_time?: string | Date;  // ISO 8601 or Date object
}

// Response DTOs
export interface WorkspaceTaskResponse {
  task: WorkspaceTask;
}

export interface WorkspaceTasksResponse {
  tasks: WorkspaceTask[];
}
