// Types cho hiển thị thành viên group trong UI components

/**
 * Interface cho hiển thị thông tin thành viên trong UI
 * Khác với GroupMember trong GroupConversationType (dành cho business logic)
 */
export interface GroupMemberUI {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  is_admin?: boolean;
  is_online?: boolean;
}

/**
 * Props cho component hiển thị một thành viên
 */
export interface GroupMemberItemProps {
  member: GroupMemberUI;
  isCurrentUser: boolean;
  canManageMembers: boolean;
  onMemberClick?: (member: GroupMemberUI) => void;
  onRemoveMember?: (memberId: string) => void;
  onPromoteToAdmin?: (memberId: string) => void;
  onDemoteFromAdmin?: (memberId: string) => void;
}