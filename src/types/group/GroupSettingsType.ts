// Types và interfaces cho chức năng cài đặt nhóm

export interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupData: GroupSettingsData;
}

export interface GroupSettingsData {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  memberCount: number;
  createdBy: string;
  createdAt: number;
  settings: {
    allowMemberInvite: boolean;
    allowMemberLeave: boolean;
    requireApprovalToJoin: boolean;
    maxMembers: number;
    isPublic: boolean;
  };
}

export interface GroupMembersListProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  members: GroupMemberWithInfo[];
  currentUserId: string;
  isCurrentUserAdmin: boolean;
  onRemoveMember?: (memberId: string) => void;
  onPromoteToAdmin?: (memberId: string) => void;
  onDemoteFromAdmin?: (memberId: string) => void;
}

export interface GroupMemberWithInfo {
  userId: string;
  role: 'admin' | 'moderator' | 'member';
  status: 'active' | 'inactive' | 'banned';
  joinedAt: number;
  invitedBy: string;
  userInfo?: {
    user_id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    is_online?: boolean;
  };
}

export interface LeaveGroupRequest {
  groupId: string;
  userId: string;
  reason?: string;
}

export interface LeaveGroupResponse {
  success: boolean;
  message?: string;
}

export interface GroupSettingsActions {
  onLeaveGroup: (groupId: string) => Promise<boolean>;
  onUpdateGroupInfo: (groupId: string, data: Partial<GroupSettingsData>) => Promise<boolean>;
  onViewMembers: (groupId: string) => void;
  onManageMembers: (groupId: string) => void;
}

// Types cho chức năng đổi avatar và tên group
export interface UpdateGroupAvatarRequest {
  groupId: string;
  file: File;
}

export interface UpdateGroupAvatarResponse {
  success: boolean;
  avatarUrl?: string;
  message?: string;
}

export interface UpdateGroupNameRequest {
  groupId: string;
  name: string;
}

export interface UpdateGroupNameResponse {
  success: boolean;
  message?: string;
}

export interface GroupEditingState {
  isEditingName: boolean;
  isEditingAvatar: boolean;
  isUploadingAvatar: boolean;
  tempName: string;
  avatarPreview?: string;
  error?: string;
}

export interface GroupEditingActions {
  startEditingName: () => void;
  cancelEditingName: () => void;
  updateTempName: (name: string) => void;
  saveGroupName: () => Promise<boolean>;
  
  startEditingAvatar: () => void;
  cancelEditingAvatar: () => void;
  selectAvatarFile: (file: File) => void;
  saveGroupAvatar: () => Promise<boolean>;
  removeGroupAvatar: () => Promise<boolean>;
}

export interface GroupAvatarUploadProps {
  groupId: string;
  currentAvatar?: string;
  isEditing: boolean;
  isUploading: boolean;
  previewUrl?: string;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onFileSelect: (file: File) => void;
  onSave: () => Promise<boolean>;
  onRemove: () => Promise<boolean>;
}

export interface GroupNameEditProps {
  groupId: string;
  currentName: string;
  isEditing: boolean;
  tempName: string;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onNameChange: (name: string) => void;
  onSave: () => Promise<boolean>;
}
