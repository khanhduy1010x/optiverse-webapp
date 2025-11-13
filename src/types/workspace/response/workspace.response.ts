export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  owner_id: string;
  invite_code: string;
  member_count: number;
  locked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  _id: string;
  workspace_id: string;
  user_id: string;
  role: 'admin' | 'user';
  status: 'active' | 'banned';
  joined_at: string;
}

export interface WorkspaceJoinRequest {
  _id: string;
  workspace_id: string;
  user_id: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface MyWorkspaceItem {
  role: 'admin' | 'user';
  status: 'accepted' | 'banned';
  joined_at: string;
  locked?: boolean;
  workspace: Workspace;
}

export interface MyWorkspacesResponse {
  owner_workspace: MyWorkspaceItem[];
  member_workspace: MyWorkspaceItem[];
}

export interface UserDetailDto {
  user_id: string;
  request_id?: string; // Optional request_id for requests and invitations
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  status: string;
  time: Date;
  permissions?: string[]; // User's combined workspace and note permissions
}

export interface WorkspaceDetailDto {
  name: string;
  description?: string;
  invite_code: string;
  hasPassword: boolean;
  permissions?: string[]; // Current user's permissions
  owner_id: string; // ID of workspace owner for frontend role detection
  role?: 'owner' | 'admin' | 'member' | null; // Current user's role in workspace
  members: {
    active: UserDetailDto[];
    request: UserDetailDto[];
    invite: UserDetailDto[];
    banned: UserDetailDto[];
  };
}

export interface OwnerInfo {
  user_id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

export interface WorkspaceSearchResult {
  id: string;
  name: string;
  description?: string;
  hasPassword: boolean;
  memberCount: number;
  owner: OwnerInfo;
  userStatus?:
    | 'none'
    | 'member'
    | 'pending_request'
    | 'pending_invitation'
    | 'banned'
    | 'owner';
}

export interface WorkspaceSearchResponse {
  workspace: WorkspaceSearchResult;
}
