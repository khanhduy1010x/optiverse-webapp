export interface UserInfo {
  id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
}

export interface SharedWithUser {
  user_id: string;
  permission: 'view' | 'edit';
  shared_at: string;
  user_info?: UserInfo | null;
}

export interface ShareResource {
  resource_type: 'note' | 'folder';
  resource_id: string;
  shared_with: SharedWithUser[];
}

export interface ShareResponse {
  id: string;
  owner_id: string;
  resource_type: 'note' | 'folder';
  resource_id: string;
  shared_with: SharedWithUser[];
  createdAt: string;
  updatedAt: string;
  title?: string;
  name?: string;
}

export interface SelectedUser {
  _id: string;
  fullname: string;
  email: string;
  avatar?: string;
  permission?: 'view' | 'edit';
}
