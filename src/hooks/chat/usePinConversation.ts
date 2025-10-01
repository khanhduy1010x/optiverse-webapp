import { useCallback, useEffect, useState } from 'react';
import { ref, update, get, onValue } from 'firebase/database';
import { db } from '../../firebase';
import { toast } from 'react-toastify';

/**
 * Hook để quản lý tính năng ghim hội thoại
 */
export function usePinConversation() {
  const [pinnedConversations, setPinnedConversations] = useState<{
    [conversationId: string]: boolean;
  }>({});
  const currentUserId = localStorage.getItem('user_id') || '';

  // Lắng nghe danh sách hội thoại được ghim
  useEffect(() => {
    if (!currentUserId) return;

    // Tạo một reference để lắng nghe tất cả các hội thoại được ghim
    const conversationsRef = ref(db, 'conversations');

    const unsubscribe = onValue(conversationsRef, snapshot => {
      if (!snapshot.exists()) return;

      const data = snapshot.val();
      const pinned: { [conversationId: string]: boolean } = {};

      // Lọc các hội thoại được ghim bởi người dùng hiện tại
      Object.entries(data).forEach(([id, conv]: [string, any]) => {
        if (conv.pinnedBy && conv.pinnedBy[currentUserId]) {
          pinned[id] = true;
        }
      });

      setPinnedConversations(pinned);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // Đếm số lượng hội thoại đã được ghim
  const getPinnedCount = useCallback(() => {
    return Object.keys(pinnedConversations).length;
  }, [pinnedConversations]);

  // Ghim một hội thoại
  const pinConversation = useCallback(
    async (conversationId: string) => {
      if (!currentUserId || !conversationId) return false;

      try {
        // Kiểm tra số lượng hội thoại đã ghim
        if (getPinnedCount() >= 5) {
          toast.warning(
            'Bạn đã ghim tối đa 5 hội thoại. Vui lòng bỏ ghim một hội thoại khác trước.'
          );
          return false;
        }

        // Cập nhật trạng thái ghim
        await update(ref(db, `conversations/${conversationId}`), {
          [`pinnedBy/${currentUserId}`]: true,
        });

        toast.success('Đã ghim hội thoại');
        return true;
      } catch (error) {
        console.error('Error pinning conversation:', error);
        toast.error('Không thể ghim hội thoại');
        return false;
      }
    },
    [currentUserId, getPinnedCount]
  );

  // Bỏ ghim một hội thoại
  const unpinConversation = useCallback(
    async (conversationId: string) => {
      if (!currentUserId || !conversationId) return false;

      try {
        // Kiểm tra xem hội thoại có được ghim không
        if (!pinnedConversations[conversationId]) return false;

        // Xóa trạng thái ghim
        await update(ref(db, `conversations/${conversationId}`), {
          [`pinnedBy/${currentUserId}`]: null,
        });

        toast.success('Đã bỏ ghim hội thoại');
        return true;
      } catch (error) {
        console.error('Error unpinning conversation:', error);
        toast.error('Không thể bỏ ghim hội thoại');
        return false;
      }
    },
    [currentUserId, pinnedConversations]
  );

  // Kiểm tra xem một hội thoại có được ghim không
  const isConversationPinned = useCallback(
    (conversationId: string) => {
      return !!pinnedConversations[conversationId];
    },
    [pinnedConversations]
  );

  return {
    pinnedConversations,
    pinConversation,
    unpinConversation,
    isConversationPinned,
    getPinnedCount,
  };
}
