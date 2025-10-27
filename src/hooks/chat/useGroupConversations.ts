import { useEffect, useState, useCallback } from "react";
import { ref, onValue, query, orderByChild, equalTo } from "firebase/database";
import { db } from "../../firebase";
import { GroupConversationType } from "../../types/chat/GroupConversationType";
import { ConversationType } from "../../types/chat/ConversationType";
import chatService from "../../services/chat.service";
import { UserResponse } from "../../types/auth/auth.types";

/**
 * Hook để lấy và quản lý danh sách group conversations của người dùng hiện tại
 */
export function useGroupConversations() {
  const [groupConversations, setGroupConversations] = useState<GroupConversationType[]>([]);
  const [users, setUsers] = useState<Record<string, UserResponse>>({});
  const [loading, setLoading] = useState(true);
  const currentUserId = localStorage.getItem("user_id") || "";

  // Lấy danh sách group conversations từ Firebase
  useEffect(() => {
    if (!currentUserId) {
      console.log('useGroupConversations: No currentUserId found');
      setLoading(false);
      return;
    }
    
    console.log('useGroupConversations: Starting to load group conversations for user:', currentUserId);
    const conversationsRef = ref(db, "groupConversations");
    
    const unsubscribe = onValue(conversationsRef, async (snapshot) => {
      const data = snapshot.val();
      console.log('useGroupConversations: Firebase data received:', data);
      
      if (!data) {
        console.log('useGroupConversations: No conversations data found');
        setLoading(false);
        return;
      }
      
      // Lọc các group conversations mà user hiện tại tham gia và không bị ẩn
      // EXCLUDE workspace chats (chỉ lấy regular group chats)
      const userGroupConversations = Object.entries(data)
        .filter(([_, conv]: [string, any]) => {
          const isGroupConversation = conv.type === 'group';
          const isParticipant = conv.members && conv.members[currentUserId];
          const isHidden = conv.hiddenBy && conv.hiddenBy[currentUserId];
          const isActiveMember = conv.groupMembers && 
            conv.groupMembers[currentUserId] && 
            conv.groupMembers[currentUserId].status === 'active';
          
          // EXCLUDE workspace chats - Simplified (chỉ cần check workspaceId)
          const isWorkspaceChat = !!conv.workspaceId;
          
          return isGroupConversation && isParticipant && !isHidden && isActiveMember && !isWorkspaceChat;
        })
        .map(([id, conv]: [string, any]) => ({
          id,
          ...conv
        })) as GroupConversationType[];
      
      // Sắp xếp theo thời gian cập nhật gần nhất
      userGroupConversations.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      
      setGroupConversations(userGroupConversations);
      
      // Thu thập tất cả userId để lấy thông tin người dùng (bao gồm cả currentUserId)
      const userIds = new Set<string>();
      userGroupConversations.forEach(conv => {
        Object.keys(conv.groupMembers || {}).forEach(userId => {
          userIds.add(userId);
        });
      });
      
      if (userIds.size > 0) {
        try {
          const usersList = await chatService.getUsersByIds(Array.from(userIds));
          const userMap: Record<string, UserResponse> = {};
          
          usersList.forEach(user => {
            userMap[user.user_id] = user;
          });
          
          setUsers(userMap);
        } catch (error) {
          console.error('useGroupConversations: Error fetching users:', error);
        }
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [currentUserId]);

  // Lấy thông tin thành viên của một group
  const getGroupMembers = useCallback((groupId: string) => {
    const group = groupConversations.find(g => g.id === groupId);
    if (!group) return [];

    return Object.values(group.groupMembers || {})
      .filter(member => member.status === 'active')
      .map(member => ({
        ...member,
        userInfo: users[member.userId]
      }));
  }, [groupConversations, users]);

  // Lấy số lượng thành viên active của một group
  const getActiveMembers = useCallback((groupId: string) => {
    const group = groupConversations.find(g => g.id === groupId);
    if (!group) return 0;

    return Object.values(group.groupMembers || {})
      .filter(member => member.status === 'active').length;
  }, [groupConversations]);

  // Kiểm tra quyền admin của user hiện tại trong một group
  const isAdmin = useCallback((groupId: string) => {
    const group = groupConversations.find(g => g.id === groupId);
    if (!group || !group.groupMembers[currentUserId]) return false;

    const member = group.groupMembers[currentUserId];
    return member.role === 'admin' && member.status === 'active';
  }, [groupConversations, currentUserId]);

  // Kiểm tra quyền moderator của user hiện tại trong một group
  const isModerator = useCallback((groupId: string) => {
    const group = groupConversations.find(g => g.id === groupId);
    if (!group || !group.groupMembers[currentUserId]) return false;

    const member = group.groupMembers[currentUserId];
    return (member.role === 'admin' || member.role === 'moderator') && member.status === 'active';
  }, [groupConversations, currentUserId]);

  // Lấy thông tin group theo ID
  const getGroupById = useCallback((groupId: string) => {
    return groupConversations.find(g => g.id === groupId);
  }, [groupConversations]);

  // Lấy danh sách group mà user là admin
  const getAdminGroups = useCallback(() => {
    return groupConversations.filter(group => {
      const member = group.groupMembers[currentUserId];
      return member && member.role === 'admin' && member.status === 'active';
    });
  }, [groupConversations, currentUserId]);

  return {
    groupConversations,
    users,
    loading,
    getGroupMembers,
    getActiveMembers,
    isAdmin,
    isModerator,
    getGroupById,
    getAdminGroups
  };
}