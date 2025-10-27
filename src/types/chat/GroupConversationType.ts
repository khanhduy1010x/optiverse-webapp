import { ConversationType } from './ConversationType';

// Vai trò thành viên trong nhóm
export enum GroupMemberRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator', 
  MEMBER = 'member'
}

// Trạng thái thành viên trong nhóm
export enum GroupMemberStatus {
  ACTIVE = 'active',
  INVITED = 'invited',
  LEFT = 'left',
  REMOVED = 'removed'
}

// Thông tin thành viên trong nhóm
export interface GroupMember {
  userId: string;
  role: GroupMemberRole;
  status: GroupMemberStatus;
  joinedAt: number;
  invitedBy?: string;
  leftAt?: number;
  removedBy?: string;
  removedAt?: number;
}

// Cài đặt nhóm
export interface GroupSettings {
  allowMemberInvite: boolean; // Cho phép thành viên mời người khác
  allowMemberLeave: boolean; // Cho phép thành viên tự rời nhóm
  requireApprovalToJoin: boolean; // Yêu cầu phê duyệt khi tham gia
  maxMembers: number; // Số lượng thành viên tối đa
  isPublic: boolean; // Nhóm công khai hay riêng tư
}

// Lời mời tham gia nhóm
export interface GroupInvitation {
  id: string;
  groupId: string;
  inviterId: string;
  inviteeId: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: number;
  expiresAt?: number;
  message?: string;
}

// Hội thoại nhóm mở rộng từ ConversationType
export interface GroupConversationType extends ConversationType {
  type: 'group'; // Phân biệt với conversation 1-1
  name: string; // Tên nhóm
  description?: string; // Mô tả nhóm
  avatar?: string; // Ảnh đại diện nhóm
  groupMembers: { [userId: string]: GroupMember }; // Thông tin chi tiết thành viên
  settings: GroupSettings; // Cài đặt nhóm
  createdBy: string; // Người tạo nhóm
  updatedAt: number; // Thời gian cập nhật cuối
  
  // Workspace Integration - Simplified (bỏ isWorkspaceChat flag dư thừa)
  workspaceId?: string; // Nếu có workspaceId => đây là workspace chat
  
  // Thống kê nhóm
  stats?: {
    totalMessages: number;
    activeMembers: number;
    lastActivityAt: number;
  };
}

// Loại hoạt động trong nhóm (cho notification/activity log)
export enum GroupActivityType {
  MEMBER_JOINED = 'member_joined',
  MEMBER_LEFT = 'member_left', 
  MEMBER_REMOVED = 'member_removed',
  MEMBER_PROMOTED = 'member_promoted',
  MEMBER_DEMOTED = 'member_demoted',
  GROUP_CREATED = 'group_created',
  GROUP_UPDATED = 'group_updated',
  GROUP_DELETED = 'group_deleted',
  SETTINGS_CHANGED = 'settings_changed'
}

// Hoạt động trong nhóm
export interface GroupActivity {
  id: string;
  groupId: string;
  type: GroupActivityType;
  performedBy: string;
  targetUserId?: string; // Đối với các hoạt động liên quan đến thành viên
  details?: any; // Chi tiết bổ sung
  createdAt: number;
}

// Request types cho group operations
export interface CreateGroupRequest {
  name: string;
  description?: string;
  avatar?: string;
  memberIds: string[]; // Danh sách ID thành viên ban đầu
  settings?: Partial<GroupSettings>;
  
  // Workspace Integration - NEW
  workspaceId?: string; // ID workspace nếu tạo workspace chat
  isWorkspaceChat?: boolean; // Đánh dấu đây là workspace chat
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  avatar?: string;
  settings?: Partial<GroupSettings>;
}

export interface InviteMemberRequest {
  groupId: string;
  userIds: string[];
  message?: string;
}

export interface UpdateMemberRoleRequest {
  groupId: string;
  userId: string;
  newRole: GroupMemberRole;
}

export interface RemoveMemberRequest {
  groupId: string;
  userId: string;
  reason?: string;
}