import { useEffect, useState, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../../firebase';
import { GroupConversationType } from '../../types/chat/GroupConversationType';
import groupService from '../../services/group.service';
import chatService from '../../services/chat.service';
import { UserResponse } from '../../types/auth/auth.types';

/**
 * Hook để lấy workspace chat theo workspaceId
 * Reuse 100% group chat logic, chỉ filter theo workspaceId
 */
export function useWorkspaceChat(workspaceId: string | null) {
  const [workspaceChat, setWorkspaceChat] = useState<GroupConversationType | null>(null);
  const [users, setUsers] = useState<Record<string, UserResponse>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ FIX: Track đã fetch users chưa để tránh fetch lại liên tục
  const fetchedUsersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }

    console.log('📡 useWorkspaceChat: Listening for workspace:', workspaceId);

    // Listen to all group conversations
    const conversationsRef = ref(db, 'groupConversations');

    const unsubscribe = onValue(
      conversationsRef,
      (snapshot) => {
        console.log('🔥 useWorkspaceChat: Firebase onValue triggered');
        
        try {
          const data = snapshot.val();

          if (!data) {
            console.log('⚠️ useWorkspaceChat: No conversations found');
            setWorkspaceChat(null);
            setLoading(false);
            return;
          }

          // Find workspace chat - Simplified (chỉ cần check workspaceId)
          const workspaceChatEntry = Object.entries(data).find(
            ([_, conv]: [string, any]) => conv.workspaceId === workspaceId
          );

          if (workspaceChatEntry) {
            const [groupId, groupData] = workspaceChatEntry;
            const chat: GroupConversationType = {
              ...groupData as GroupConversationType,
              id: groupId
            };
            
            console.log('✅ useWorkspaceChat: Found workspace chat:', chat.name);
            setWorkspaceChat(chat);

            // ✅ Fetch user info CHỈ cho members MỚI (chưa fetch)
            const memberIds = Object.keys(chat.groupMembers || {});
            const newMemberIds = memberIds.filter(id => !fetchedUsersRef.current.has(id));
            
            if (newMemberIds.length > 0) {
              console.log('👥 Fetching new users:', newMemberIds);
              chatService.getUsersByIds(newMemberIds).then(usersList => {
                const userMap: Record<string, UserResponse> = {};
                usersList.forEach(user => {
                  userMap[user.user_id] = user;
                  fetchedUsersRef.current.add(user.user_id);
                });
                
                // Merge với users hiện tại
                setUsers(prev => ({ ...prev, ...userMap }));
                console.log('✅ Users fetched and merged');
              }).catch(err => {
                console.error('❌ Error fetching users:', err);
              });
            }
          } else {
            console.log('⚠️ useWorkspaceChat: No workspace chat found');
            setWorkspaceChat(null);
            setUsers({});
            fetchedUsersRef.current.clear();
          }

          setLoading(false);
        } catch (err: any) {
          console.error('❌ useWorkspaceChat: Error processing data:', err);
          setError(err.message);
          setLoading(false);
        }
      },
      (err) => {
        console.error('❌ useWorkspaceChat: Firebase error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      console.log('🔌 useWorkspaceChat: Unsubscribing');
      unsubscribe();
    };
  }, [workspaceId]);

  // Method để tạo workspace chat nếu chưa có
  const createWorkspaceChatIfNotExists = async (
    workspaceName: string,
    memberIds: string[]
  ): Promise<string | null> => {
    if (!workspaceId) return null;

    // Check if already exists
    if (workspaceChat) {
      console.log('useWorkspaceChat: Chat already exists');
      return workspaceChat.id;
    }

    console.log('useWorkspaceChat: Creating new workspace chat');
    const groupId = await groupService.createWorkspaceChat(
      workspaceId,
      workspaceName,
      memberIds
    );

    return groupId;
  };

  // Method để sync members
  const syncMembers = async (memberIds: string[]): Promise<boolean> => {
    if (!workspaceId) return false;

    console.log('useWorkspaceChat: Syncing members:', memberIds);
    return await groupService.syncWorkspaceMembers(workspaceId, memberIds);
  };

  return {
    workspaceChat,
    users,
    loading,
    error,
    createWorkspaceChatIfNotExists,
    syncMembers
  };
}
