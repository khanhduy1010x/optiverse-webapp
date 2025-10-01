import { useEffect, useState, useCallback } from "react";
import { ref, onValue, push, set, query, orderByChild, equalTo, get } from "firebase/database";
import { db } from "../../firebase";
import { ConversationType } from "../../types/chat/ConversationType";
import chatService from "../../services/chat.service";
import { UserResponse } from "../../types/auth/auth.types";
import friendService from "../../services/friend.service";
import { Friend } from "../../types/friend/response/friend.response";

/**
 * Hook để lấy và quản lý danh sách hội thoại của người dùng hiện tại
 */
export function useConversation() {
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [users, setUsers] = useState<Record<string, UserResponse>>({});
  const [loading, setLoading] = useState(true);
  const currentUserId = localStorage.getItem("user_id") || "";

  // Lấy danh sách hội thoại từ Firebase
  useEffect(() => {
    if (!currentUserId) {
      console.log('useConversation: No currentUserId found');
      return;
    }
    
    console.log('useConversation: Starting to load conversations for user:', currentUserId);
    const conversationsRef = ref(db, "conversations");
    
    const unsubscribe = onValue(conversationsRef, async (snapshot) => {
      const data = snapshot.val();
      console.log('useConversation: Firebase data received:', data);
      if (!data) {
        console.log('useConversation: No conversations data found');
        setLoading(false);
        return;
      }
      
      // Lọc các hội thoại mà user hiện tại tham gia và không bị ẩn hoặc xóa mềm (chỉ individual conversations)
      const userConversations = Object.entries(data)
        .filter(([_, conv]: [string, any]) => {
          const isParticipant = conv.members && conv.members[currentUserId];
          const isHidden = conv.hiddenBy && conv.hiddenBy[currentUserId];
          const isDeleted = conv.deletedBy && conv.deletedBy[currentUserId]; // Kiểm tra xóa mềm
          const isNotGroupConversation = conv.type !== 'group'; // Loại trừ group conversations
          return isParticipant && !isHidden && !isDeleted && isNotGroupConversation;
        })
        .map(([id, conv]: [string, any]) => ({
          id,
          ...conv
        })) as ConversationType[];
      
      setConversations(userConversations);
      
      // Thu thập tất cả userId để lấy thông tin người dùng
      const userIds = new Set<string>();
      userConversations.forEach(conv => {
        Object.keys(conv.members).forEach(userId => {
          if (userId !== currentUserId) {
            userIds.add(userId);
          }
        });
      });
      
      if (userIds.size > 0) {
        try {
          // Lấy danh sách bạn bè để tìm thông tin người dùng
          const friendsList = await friendService.viewAllFriends();
          
          // Tạo map để lưu thông tin người dùng từ danh sách bạn bè
          const userMap: Record<string, UserResponse> = {};
          
          // Lấy thông tin từ danh sách bạn bè trước
          friendsList.forEach(friend => {
            // Kiểm tra xem friend_id có trong danh sách userIds không
            if (userIds.has(friend.friend_id) && friend.friendInfo) {
              userMap[friend.friend_id] = {
                user_id: friend.friend_id,
                email: friend.friendInfo.email || '',
                full_name: friend.friendInfo.full_name || '',
                avatar_url: friend.friendInfo.avatar_url || '',
              };
              // Xóa ID đã tìm thấy
              userIds.delete(friend.friend_id);
            }
          });
          
          // Nếu vẫn còn userIds chưa tìm thấy trong danh sách bạn bè, gọi API để lấy thông tin
          if (userIds.size > 0) {
            const remainingUsers = await chatService.getUsersByIds(Array.from(userIds));
            remainingUsers.forEach(user => {
              userMap[user.user_id] = user;
            });
          }
          
          setUsers(userMap);
        } catch (error) {
          console.error('Lỗi khi lấy thông tin người dùng:', error);
          
          // Fallback: sử dụng API nếu có lỗi khi lấy từ friend service
          const userList = await chatService.getUsersByIds(Array.from(userIds));
          const userMap: Record<string, UserResponse> = {};
          userList.forEach(user => {
            userMap[user.user_id] = user;
          });
          setUsers(userMap);
        }
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [currentUserId]);

  // Tạo hội thoại mới hoặc lấy hội thoại hiện có
  const getOrCreateConversation = useCallback(async (targetUserId: string) => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
      console.log('getOrCreateConversation: Invalid parameters', { currentUserId, targetUserId });
      return null;
    }
    
    console.log('getOrCreateConversation: Searching for existing conversation', {
      currentUserId,
      targetUserId
    });
    
    try {
      // Truy vấn trực tiếp Firebase để tìm conversation đã tồn tại
      const conversationsRef = ref(db, "conversations");
      const snapshot = await get(conversationsRef);
      const allConversations = snapshot.val();
      
      console.log('getOrCreateConversation: Firebase data received', allConversations);
      
      if (allConversations) {
        // Tìm conversation 1-1 giữa hai user
        const existingConversationEntry = Object.entries(allConversations).find(([id, conv]: [string, any]) => {
          const hasCurrentUser = conv.members && conv.members[currentUserId];
          const hasTargetUser = conv.members && conv.members[targetUserId];
          const memberCount = conv.members ? Object.keys(conv.members).length : 0;
          const isOneOnOne = memberCount === 2;
          const isNotHidden = !conv.hiddenBy || !conv.hiddenBy[currentUserId];
          const isNotGroupConversation = conv.type !== 'group';
          
          console.log('getOrCreateConversation: Checking conversation', {
            conversationId: id,
            hasCurrentUser,
            hasTargetUser,
            memberCount,
            isOneOnOne,
            isNotHidden,
            isNotGroupConversation,
            members: conv.members,
            hiddenBy: conv.hiddenBy,
            type: conv.type
          });
          
          return hasCurrentUser && hasTargetUser && isOneOnOne && isNotHidden && isNotGroupConversation;
        });
        
        if (existingConversationEntry) {
          const [conversationId] = existingConversationEntry;
          console.log('getOrCreateConversation: Found existing conversation', conversationId);
          return conversationId;
        }
      }
      
      console.log('getOrCreateConversation: No existing conversation found, creating new one');
      
      // Nếu chưa có, tạo hội thoại mới
      const newConversationRef = push(conversationsRef);
      
      await set(newConversationRef, {
        members: {
          [currentUserId]: true,
          [targetUserId]: true
        },
        createdAt: Date.now(),
        type: 'individual' // Đảm bảo đây là conversation cá nhân
      });
      
      console.log('getOrCreateConversation: Created new conversation', newConversationRef.key);
      return newConversationRef.key;
    } catch (error) {
      console.error('getOrCreateConversation: Error', error);
      return null;
    }
  }, [currentUserId]);

  return { conversations, users, loading, getOrCreateConversation };
}