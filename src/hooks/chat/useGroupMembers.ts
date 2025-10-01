import { useEffect, useState, useCallback } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../../firebase';
import { GroupMember, GroupMemberStatus } from '../../types/chat/GroupConversationType';
import { UserResponse } from '../../types/auth/auth.types';
import chatService from '../../services/chat.service';

interface GroupMemberWithInfo extends GroupMember {
  userInfo?: UserResponse;
}

/**
 * Hook để quản lý thành viên của một group cụ thể
 */
export function useGroupMembers(groupId: string) {
  const [members, setMembers] = useState<GroupMemberWithInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUserId = localStorage.getItem("user_id") || "";

  // Lấy danh sách thành viên từ Firebase
  useEffect(() => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    console.log('useGroupMembers: Loading members for group:', groupId);
    setLoading(true);
    setError(null);

    const groupRef = ref(db, `groupConversations/${groupId}`);
    
    const unsubscribe = onValue(groupRef, async (snapshot) => {
      try {
        const groupData = snapshot.val();
        
        if (!groupData || !groupData.groupMembers) {
          console.log('useGroupMembers: No group data or members found');
          setMembers([]);
          setLoading(false);
          return;
        }

        const groupMembers = Object.values(groupData.groupMembers) as GroupMember[];
        
        // Lấy thông tin user cho tất cả thành viên
        const userIds = groupMembers.map(member => member.userId);
        
        if (userIds.length > 0) {
          const usersList = await chatService.getUsersByIds(userIds);
          const userMap: Record<string, UserResponse> = {};
          
          usersList.forEach(user => {
            userMap[user.user_id] = user;
          });

          // Kết hợp thông tin member với user info
          const membersWithInfo: GroupMemberWithInfo[] = groupMembers.map(member => ({
            ...member,
            userInfo: userMap[member.userId]
          }));

          // Sắp xếp: Admin -> Moderator -> Member, và theo thời gian tham gia
          membersWithInfo.sort((a, b) => {
            // Sắp xếp theo role
            const roleOrder = { admin: 0, moderator: 1, member: 2 };
            const roleComparison = roleOrder[a.role] - roleOrder[b.role];
            
            if (roleComparison !== 0) return roleComparison;
            
            // Nếu cùng role, sắp xếp theo thời gian tham gia
            return a.joinedAt - b.joinedAt;
          });

          setMembers(membersWithInfo);
        } else {
          setMembers([]);
        }
        
        setLoading(false);
      } catch (error: any) {
        console.error('useGroupMembers: Error loading members:', error);
        setError(error.message || 'Có lỗi xảy ra khi tải danh sách thành viên');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [groupId]);

  // Lấy thành viên active
  const getActiveMembers = useCallback(() => {
    return members.filter(member => member.status === GroupMemberStatus.ACTIVE);
  }, [members]);

  // Lấy danh sách admin
  const getAdmins = useCallback(() => {
    return members.filter(member => 
      member.role === 'admin' && member.status === GroupMemberStatus.ACTIVE
    );
  }, [members]);

  // Lấy danh sách moderator
  const getModerators = useCallback(() => {
    return members.filter(member => 
      member.role === 'moderator' && member.status === GroupMemberStatus.ACTIVE
    );
  }, [members]);

  // Lấy danh sách member thường
  const getRegularMembers = useCallback(() => {
    return members.filter(member => 
      member.role === 'member' && member.status === GroupMemberStatus.ACTIVE
    );
  }, [members]);

  // Kiểm tra xem user hiện tại có phải admin không
  const isCurrentUserAdmin = useCallback(() => {
    const currentMember = members.find(member => member.userId === currentUserId);
    return currentMember?.role === 'admin' && currentMember?.status === GroupMemberStatus.ACTIVE;
  }, [members, currentUserId]);

  // Kiểm tra xem user hiện tại có phải moderator không
  const isCurrentUserModerator = useCallback(() => {
    const currentMember = members.find(member => member.userId === currentUserId);
    return (currentMember?.role === 'admin' || currentMember?.role === 'moderator') && 
           currentMember?.status === GroupMemberStatus.ACTIVE;
  }, [members, currentUserId]);

  // Lấy thông tin member theo userId
  const getMemberById = useCallback((userId: string) => {
    return members.find(member => member.userId === userId);
  }, [members]);

  // Kiểm tra xem có thể thực hiện action với member không
  const canPerformActionOnMember = useCallback((targetUserId: string) => {
    const currentMember = members.find(member => member.userId === currentUserId);
    const targetMember = members.find(member => member.userId === targetUserId);
    
    if (!currentMember || !targetMember) return false;
    if (currentMember.status !== GroupMemberStatus.ACTIVE) return false;
    if (targetUserId === currentUserId) return false; // Không thể action với chính mình
    
    // Admin có thể action với tất cả
    if (currentMember.role === 'admin') return true;
    
    // Moderator chỉ có thể action với member thường
    if (currentMember.role === 'moderator' && targetMember.role === 'member') return true;
    
    return false;
  }, [members, currentUserId]);

  // Lấy số lượng thành viên theo trạng thái
  const getMemberCountByStatus = useCallback((status: GroupMemberStatus) => {
    return members.filter(member => member.status === status).length;
  }, [members]);

  // Lấy thành viên mới nhất
  const getNewestMembers = useCallback((limit: number = 5) => {
    return members
      .filter(member => member.status === GroupMemberStatus.ACTIVE)
      .sort((a, b) => b.joinedAt - a.joinedAt)
      .slice(0, limit);
  }, [members]);

  return {
    members,
    loading,
    error,
    getActiveMembers,
    getAdmins,
    getModerators,
    getRegularMembers,
    isCurrentUserAdmin,
    isCurrentUserModerator,
    getMemberById,
    canPerformActionOnMember,
    getMemberCountByStatus,
    getNewestMembers
  };
}