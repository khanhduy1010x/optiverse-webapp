import { useEffect, useState, useCallback, useRef } from 'react';
import { ref, onValue, set, get, update } from 'firebase/database';
import { db } from '../../firebase';

/**
 * Hook để theo dõi và cập nhật số tin nhắn chưa đọc trong hội thoại
 * @param conversationId ID của hội thoại
 */
export function useUnreadCount(conversationId: string) {
  const [unreadCount, setUnreadCount] = useState(0);
  const currentUserId = localStorage.getItem('user_id') || '';
  const inputFocusedRef = useRef(false);

  // Lắng nghe số tin nhắn chưa đọc
  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    const unreadCountRef = ref(
      db,
      `unreadCount/${conversationId}/${currentUserId}`
    );

    const unsubscribe = onValue(unreadCountRef, snapshot => {
      const count = snapshot.val() || 0;
      setUnreadCount(count);
    });

    return () => unsubscribe();
  }, [conversationId, currentUserId]);

  // Đánh dấu đã đọc tất cả tin nhắn khi focus vào input
  const markAsRead = useCallback(async () => {
    if (!conversationId || !currentUserId) return;

    console.log(
      'markAsRead called for conversation:',
      conversationId,
      'user:',
      currentUserId
    );

    try {
      // Cập nhật unreadCount về 0
      const unreadCountRef = ref(
        db,
        `unreadCount/${conversationId}/${currentUserId}`
      );
      await set(unreadCountRef, 0);
      console.log('Updated unreadCount to 0');

      // Cập nhật trường readBy của tất cả tin nhắn chưa đọc
      const messagesRef = ref(db, `messages/${conversationId}`);
      const messagesSnapshot = await get(messagesRef);

      if (messagesSnapshot.exists()) {
        const messages = messagesSnapshot.val();
        console.log('All messages:', messages);
        const updates: { [key: string]: any } = {};

        // Duyệt qua tất cả tin nhắn
        Object.keys(messages).forEach(messageId => {
          const message = messages[messageId];
          console.log(
            'Checking message:',
            messageId,
            'sender:',
            message.senderId,
            'currentUser:',
            currentUserId
          );

          // Chỉ cập nhật tin nhắn của người khác gửi (người khác gửi cho mình)
          if (message.senderId !== currentUserId) {
            const readBy = message.readBy || {};
            console.log('Message readBy before:', readBy);

            // Nếu chưa có trường readBy hoặc chưa đánh dấu đã đọc
            if (!readBy[currentUserId]) {
              readBy[currentUserId] = Date.now();
              updates[`messages/${conversationId}/${messageId}/readBy`] =
                readBy;
              console.log('Will update message:', messageId, 'readBy:', readBy);
            } else {
              console.log('Message already read by current user');
            }
          } else {
            console.log('Skipping own message');
          }
        });

        // Thực hiện cập nhật hàng loạt nếu có tin nhắn cần cập nhật
        if (Object.keys(updates).length > 0) {
          console.log('Performing updates:', updates);
          await update(ref(db), updates);
          console.log('Updates completed successfully');
        } else {
          console.log('No updates needed');
        }
      } else {
        console.log('No messages found in conversation');
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [conversationId, currentUserId]);

  // Tăng số tin nhắn chưa đọc
  const incrementUnread = useCallback(
    (targetUserId: string) => {
      if (!conversationId || !targetUserId || targetUserId === currentUserId)
        return;

      // Kiểm tra xem người nhận có đang focus vào input không
      const typingRef = ref(
        db,
        `typingStatus/${conversationId}/${targetUserId}`
      );
      get(typingRef).then(snapshot => {
        // Nếu người nhận không đang focus vào input, tăng số tin nhắn chưa đọc
        if (!snapshot.exists() || !snapshot.val()) {
          const unreadCountRef = ref(
            db,
            `unreadCount/${conversationId}/${targetUserId}`
          );

          // Đọc giá trị hiện tại và tăng lên 1
          get(unreadCountRef).then(snapshot => {
            const currentCount = snapshot.val() || 0;
            set(unreadCountRef, currentCount + 1);
          });
        }
      });
    },
    [conversationId, currentUserId]
  );

  // Xử lý sự kiện focus và blur cho input
  const handleInputFocus = useCallback(() => {
    inputFocusedRef.current = true;
    // Luôn gọi markAsRead khi focus vào input, không cần kiểm tra unreadCount
    markAsRead();
  }, [markAsRead]);

  const handleInputBlur = useCallback(() => {
    inputFocusedRef.current = false;
  }, []);

  return {
    unreadCount,
    markAsRead,
    incrementUnread,
    handleInputFocus,
    handleInputBlur,
    isInputFocused: () => inputFocusedRef.current,
  };
}
