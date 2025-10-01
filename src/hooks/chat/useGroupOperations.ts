import { useState, useCallback } from 'react';
import groupService from '../../services/group.service';
import {
  CreateGroupRequest,
  UpdateGroupRequest,
  InviteMemberRequest,
  UpdateMemberRoleRequest,
  RemoveMemberRequest,
  GroupMemberRole
} from '../../types/chat/GroupConversationType';

/**
 * Hook để xử lý các thao tác với group chat
 */
export function useGroupOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tạo group mới
  const createGroup = useCallback(async (request: CreateGroupRequest): Promise<string | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const groupId = await groupService.createGroup(request);
      if (!groupId) {
        setError('Không thể tạo nhóm. Vui lòng thử lại.');
        return null;
      }
      return groupId;
    } catch (error: any) {
      console.error('Error creating group:', error);
      setError(error.message || 'Có lỗi xảy ra khi tạo nhóm');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cập nhật thông tin group
  const updateGroup = useCallback(async (groupId: string, request: UpdateGroupRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await groupService.updateGroup(groupId, request);
      if (!success) {
        setError('Không thể cập nhật thông tin nhóm. Vui lòng thử lại.');
      }
      return success;
    } catch (error: any) {
      console.error('Error updating group:', error);
      setError(error.message || 'Có lỗi xảy ra khi cập nhật nhóm');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mời thành viên vào group
  const inviteMembers = useCallback(async (request: InviteMemberRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await groupService.inviteMembers(request);
      if (!success) {
        setError('Không thể mời thành viên. Vui lòng thử lại.');
      }
      return success;
    } catch (error: any) {
      console.error('Error inviting members:', error);
      setError(error.message || 'Có lỗi xảy ra khi mời thành viên');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Xóa thành viên khỏi group
  const removeMember = useCallback(async (request: RemoveMemberRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await groupService.removeMember(request);
      if (!success) {
        setError('Không thể xóa thành viên. Vui lòng thử lại.');
      }
      return success;
    } catch (error: any) {
      console.error('Error removing member:', error);
      setError(error.message || 'Có lỗi xảy ra khi xóa thành viên');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Rời khỏi group
  const leaveGroup = useCallback(async (groupId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await groupService.leaveGroup(groupId);
      if (!success) {
        setError('Không thể rời khỏi nhóm. Vui lòng thử lại.');
      }
      return success;
    } catch (error: any) {
      console.error('Error leaving group:', error);
      setError(error.message || 'Có lỗi xảy ra khi rời nhóm');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cập nhật vai trò thành viên
  const updateMemberRole = useCallback(async (request: UpdateMemberRoleRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await groupService.updateMemberRole(request);
      if (!success) {
        setError('Không thể cập nhật vai trò thành viên. Vui lòng thử lại.');
      }
      return success;
    } catch (error: any) {
      console.error('Error updating member role:', error);
      setError(error.message || 'Có lỗi xảy ra khi cập nhật vai trò');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Thăng cấp thành viên lên admin
  const promoteToAdmin = useCallback(async (groupId: string, userId: string): Promise<boolean> => {
    return updateMemberRole({
      groupId,
      userId,
      newRole: GroupMemberRole.ADMIN
    });
  }, [updateMemberRole]);

  // Thăng cấp thành viên lên moderator
  const promoteToModerator = useCallback(async (groupId: string, userId: string): Promise<boolean> => {
    return updateMemberRole({
      groupId,
      userId,
      newRole: GroupMemberRole.MODERATOR
    });
  }, [updateMemberRole]);

  // Hạ cấp thành viên xuống member
  const demoteToMember = useCallback(async (groupId: string, userId: string): Promise<boolean> => {
    return updateMemberRole({
      groupId,
      userId,
      newRole: GroupMemberRole.MEMBER
    });
  }, [updateMemberRole]);

  // Tải lên avatar group
  const uploadGroupAvatar = useCallback(async (groupId: string, file: File): Promise<string | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const avatarUrl = await groupService.uploadGroupAvatar(groupId, file);
      if (!avatarUrl) {
        setError('Không thể tải lên ảnh đại diện. Vui lòng thử lại.');
      }
      return avatarUrl;
    } catch (error: any) {
      console.error('Error uploading group avatar:', error);
      setError(error.message || 'Có lỗi xảy ra khi tải lên ảnh đại diện');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy lịch sử hoạt động của group
  const getGroupActivities = useCallback(async (groupId: string, limit?: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const activities = await groupService.getGroupActivities(groupId, limit);
      return activities;
    } catch (error: any) {
      console.error('Error getting group activities:', error);
      setError(error.message || 'Có lỗi xảy ra khi lấy lịch sử hoạt động');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    createGroup,
    updateGroup,
    inviteMembers,
    removeMember,
    leaveGroup,
    updateMemberRole,
    promoteToAdmin,
    promoteToModerator,
    demoteToMember,
    uploadGroupAvatar,
    getGroupActivities,
    clearError
  };
}