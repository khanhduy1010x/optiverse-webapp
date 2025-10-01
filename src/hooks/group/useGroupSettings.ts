import { useState, useEffect, useCallback } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../../firebase';
import { GroupSettingsData } from '../../types/group/GroupSettingsType';
import groupSettingsService from '../../services/groupSettings.service';
import { useGroupMembers } from '../chat/useGroupMembers';

export function useGroupSettings(groupId: string) {
  const [groupData, setGroupData] = useState<GroupSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  
  const currentUserId = localStorage.getItem('user_id') || '';
  const { members, isCurrentUserAdmin } = useGroupMembers(groupId);

  // Lấy thông tin nhóm từ Firebase
  useEffect(() => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const groupRef = ref(db, `groupConversations/${groupId}`);
    
    const unsubscribe = onValue(groupRef, (snapshot) => {
      try {
        const data = snapshot.val();
        
        if (!data) {
          setError('Nhóm không tồn tại');
          setLoading(false);
          return;
        }

        // Chuyển đổi dữ liệu Firebase thành GroupSettingsData
        const groupSettingsData: GroupSettingsData = {
          id: data.id || groupId,
          name: data.name || '',
          description: data.description || '',
          avatar: data.avatar,
          memberCount: data.stats?.activeMembers || 0,
          createdBy: data.createdBy || '',
          createdAt: data.createdAt || 0,
          settings: {
            allowMemberInvite: data.settings?.allowMemberInvite ?? true,
            allowMemberLeave: data.settings?.allowMemberLeave ?? true,
            requireApprovalToJoin: data.settings?.requireApprovalToJoin ?? false,
            maxMembers: data.settings?.maxMembers ?? 100,
            isPublic: data.settings?.isPublic ?? false
          }
        };

        setGroupData(groupSettingsData);
        setLoading(false);
      } catch (error: any) {
        console.error('Error loading group data:', error);
        setError(error.message || 'Có lỗi xảy ra khi tải thông tin nhóm');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [groupId]);

  // Rời nhóm
  const leaveGroup = useCallback(async (): Promise<boolean> => {
    if (!groupId || !currentUserId) return false;

    setIsLeaving(true);
    try {
      const result = await groupSettingsService.leaveGroup({
        groupId,
        userId: currentUserId
      });

      if (result.success) {
        // Có thể thêm notification hoặc redirect ở đây
        console.log('Left group successfully');
        return true;
      } else {
        setError(result.message || 'Không thể rời nhóm');
        return false;
      }
    } catch (error: any) {
      console.error('Error leaving group:', error);
      setError(error.message || 'Có lỗi xảy ra khi rời nhóm');
      return false;
    } finally {
      setIsLeaving(false);
    }
  }, [groupId, currentUserId]);

  // Cập nhật thông tin nhóm
  const updateGroupInfo = useCallback(async (updates: Partial<GroupSettingsData>): Promise<boolean> => {
    if (!groupId || !currentUserId || !isCurrentUserAdmin) return false;

    try {
      const result = await groupSettingsService.updateGroupInfo(groupId, currentUserId, updates);
      
      if (result) {
        console.log('Group info updated successfully');
        return true;
      } else {
        setError('Không thể cập nhật thông tin nhóm');
        return false;
      }
    } catch (error: any) {
      console.error('Error updating group info:', error);
      setError(error.message || 'Có lỗi xảy ra khi cập nhật thông tin nhóm');
      return false;
    }
  }, [groupId, currentUserId, isCurrentUserAdmin]);

  // Kiểm tra xem user hiện tại có thể rời nhóm không
  const canLeaveGroup = useCallback((): boolean => {
    if (!groupData || !members.length) return false;

    // Kiểm tra setting của nhóm
    if (!groupData.settings.allowMemberLeave) return false;

    // Kiểm tra xem có phải admin cuối cùng không
    const adminMembers = members.filter(m => m.role === 'admin' && m.status === 'active');
    const currentMember = members.find(m => m.userId === currentUserId);
    
    if (currentMember?.role === 'admin' && adminMembers.length === 1) {
      return false; // Admin cuối cùng không thể rời nhóm
    }

    return true;
  }, [groupData, members, currentUserId]);

  // Reset error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    groupData,
    loading,
    error,
    isLeaving,
    members,
    isCurrentUserAdmin,
    leaveGroup,
    updateGroupInfo,
    canLeaveGroup: canLeaveGroup(),
    clearError
  };
}