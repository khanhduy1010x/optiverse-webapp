import { useCallback, useEffect, useState } from 'react';
import { ref, update, get, onValue } from 'firebase/database';
import { db } from '../../firebase';
import { toast } from 'react-toastify';

/**
 * Hook để quản lý tính năng ghim hội thoại
 */
export function usePinConversation() {
  const [pinnedConversations, setPinnedConversations] = useState<{
    [conversationId: string]: number;
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
      const pinned: { [conversationId: string]: number } = {};

      // Lọc các hội thoại được ghim bởi người dùng hiện tại
      Object.entries(data).forEach(([id, conv]: [string, any]) => {
        if (conv.pinnedBy && conv.pinnedBy[currentUserId]) {
          pinned[id] = conv.pinnedBy[currentUserId];
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

        // Tìm thứ tự ghim tiếp theo (từ 1-5)
        const pinnedOrders = Object.values(pinnedConversations);
        let nextOrder = 1;

        while (pinnedOrders.includes(nextOrder) && nextOrder <= 5) {
          nextOrder++;
        }

        // Cập nhật trạng thái ghim
        const pinnedRef = ref(
          db,
          `conversations/${conversationId}/pinnedBy/${currentUserId}`
        );
        await update(ref(db, `conversations/${conversationId}`), {
          [`pinnedBy/${currentUserId}`]: nextOrder,
        });

        toast.success('Đã ghim hội thoại');
        return true;
      } catch (error) {
        console.error('Error pinning conversation:', error);
        toast.error('Không thể ghim hội thoại');
        return false;
      }
    },
    [currentUserId, pinnedConversations, getPinnedCount]
  );

  // Bỏ ghim một hội thoại
  const unpinConversation = useCallback(
    async (conversationId: string) => {
      if (!currentUserId || !conversationId) return false;

      try {
        // Lấy thứ tự ghim của hội thoại cần bỏ ghim
        const removedOrder = pinnedConversations[conversationId];
        if (!removedOrder) return false;

        // Xóa trạng thái ghim
        await update(ref(db, `conversations/${conversationId}`), {
          [`pinnedBy/${currentUserId}`]: null,
        });

        // Sắp xếp lại thứ tự cho các hội thoại còn lại
        const updates: { [path: string]: number | null } = {};

        // Lấy danh sách hội thoại đã ghim và thứ tự ghim
        const pinnedItems = Object.entries(pinnedConversations)
          .filter(([id]) => id !== conversationId)
          .sort((a, b) => a[1] - b[1]);

        // Cập nhật lại thứ tự ghim cho các hội thoại còn lại
        pinnedItems.forEach(([id, order], index) => {
          const newOrder = index + 1; // Thứ tự mới bắt đầu từ 1
          if (order !== newOrder) {
            updates[`conversations/${id}/pinnedBy/${currentUserId}`] = newOrder;
          }
        });

        // Nếu có cập nhật, thực hiện cập nhật hàng loạt
        if (Object.keys(updates).length > 0) {
          await update(ref(db), updates);
        }

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

  // Lấy thứ tự ghim của một hội thoại
  const getPinOrder = useCallback(
    (conversationId: string) => {
      return pinnedConversations[conversationId] || 0;
    },
    [pinnedConversations]
  );

  return {
    pinnedConversations,
    pinConversation,
    unpinConversation,
    isConversationPinned,
    getPinOrder,
    getPinnedCount,
  };
}
