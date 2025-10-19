export interface CreateWorkspaceDto {
  name: string;
  description?: string;
  password?: string;
  memberIds?: string[];
}

export interface UpdateWorkspaceDto {
  name?: string;
  description?: string;
  password?: string;
}

export interface JoinWorkspaceDto {
  invite_code: string;
  message?: string;
}
