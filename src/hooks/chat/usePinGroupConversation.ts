import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, update, off } from 'firebase/database';
import { db } from '../../firebase';
import { toast } from 'react-toastify';
import { useAppTranslate } from '../useAppTranslate';

export function usePinGroupConversation() {
  const { t } = useAppTranslate('chat');
  const currentUserId = localStorage.getItem('user_id') || '';

  // State để lưu trữ trạng thái pin của các group conversations
  const [pinnedGroupConversations, setPinnedGroupConversations] = useState<{ [groupId: string]: boolean }>({});

  // Lắng nghe thay đổi trạng thái pin từ Firebase
  useEffect(() => {
    if (!currentUserId) return;

    const groupConversationsRef = ref(db, 'groupConversations');
    
    const unsubscribe = onValue(groupConversationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const groupConversations = snapshot.val();
        const pinnedState: { [groupId: string]: boolean } = {};
        
        Object.entries(groupConversations).forEach(([groupId, groupData]: [string, any]) => {
          // Kiểm tra xem group có pinnedBy field và user hiện tại có pin không
          if (groupData.pinnedBy && groupData.pinnedBy[currentUserId]) {
            pinnedState[groupId] = true;
          } else {
            pinnedState[groupId] = false;
          }
        });
        
        setPinnedGroupConversations(pinnedState);
      }
    });

    return () => {
      off(groupConversationsRef, 'value', unsubscribe);
    };
  }, [currentUserId]);

  // Đếm số lượng group conversations đã được pin
  const getPinnedGroupCount = useCallback(() => {
    return Object.values(pinnedGroupConversations).filter(Boolean).length;
  }, [pinnedGroupConversations]);

  // Pin một group conversation
  const pinGroupConversation = useCallback(async (groupId: string) => {
    if (!currentUserId) {
      toast.error(t('please_login_first'));
      return;
    }

    try {
      // Kiểm tra giới hạn 5 group conversations được pin
      const currentPinnedCount = getPinnedGroupCount();
      if (currentPinnedCount >= 5) {
        toast.error(t('max_pinned_groups_reached'));
        return;
      }

      const groupRef = ref(db, `groupConversations/${groupId}/pinnedBy/${currentUserId}`);
      await update(ref(db, `groupConversations/${groupId}`), {
        [`pinnedBy/${currentUserId}`]: true
      });
      
      toast.success(t('group_pinned_successfully'));
    } catch (error) {
      console.error('Error pinning group conversation:', error);
      toast.error(t('error_pinning_group'));
    }
  }, [currentUserId, getPinnedGroupCount, t]);

  // Unpin một group conversation
  const unpinGroupConversation = useCallback(async (groupId: string) => {
    if (!currentUserId) {
      toast.error(t('please_login_first'));
      return;
    }

    try {
      await update(ref(db, `groupConversations/${groupId}`), {
        [`pinnedBy/${currentUserId}`]: null
      });
      
      toast.success(t('group_unpinned_successfully'));
    } catch (error) {
      console.error('Error unpinning group conversation:', error);
      toast.error(t('error_unpinning_group'));
    }
  }, [currentUserId, t]);

  // Kiểm tra xem một group conversation có được pin không
  const isGroupConversationPinned = useCallback((groupId: string): boolean => {
    return pinnedGroupConversations[groupId] || false;
  }, [pinnedGroupConversations]);

  return {
    pinnedGroupConversations,
    getPinnedGroupCount,
    pinGroupConversation,
    unpinGroupConversation,
    isGroupConversationPinned,
  };
}