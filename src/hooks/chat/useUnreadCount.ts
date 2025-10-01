import { useEffect, useState, useCallback, useRef } from 'react';
import { ref, onValue, set, get, update, query, orderByKey, limitToLast } from 'firebase/database';
import { db } from '../../firebase';

/**
 * Hook để theo dõi và cập nhật số tin nhắn chưa đọc trong hội thoại
 * Sử dụng cơ chế lastRead marker để tối ưu hóa hiệu suất
 * Sử dụng orderByKey() thay vì orderByChild('createdAt') để:
 * - Tránh Firebase Index error
 * - Tăng performance (orderByKey() nhanh hơn orderByChild())
 * - Key của Firebase push() được tạo theo thời gian, đảm bảo thứ tự chronological
 * @param conversationId ID của hội thoại
 */
export function useUnreadCount(conversationId: string) {
  const [unreadCount, setUnreadCount] = useState(0);
  const currentUserId = localStorage.getItem('user_id') || '';
  const inputFocusedRef = useRef(false);
  const lastCalculationRef = useRef<number>(0);
  const calculationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Lắng nghe lastRead marker và tính toán unread count
  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    // Lắng nghe lastRead marker của user hiện tại
    const lastReadRef = ref(
      db,
      `conversations/${conversationId}/lastRead/${currentUserId}`
    );

    const messagesRef = ref(db, `messages/${conversationId}`);

    const unsubscribeLastRead = onValue(lastReadRef, async (lastReadSnapshot) => {
      const lastReadTimestamp = lastReadSnapshot.val() || 0;
      
      // Tính toán chính xác unread count từ tất cả tin nhắn chưa đọc với debounce
      const calculateAccurateUnread = async (immediate = false) => {
        // Debounce để tránh tính toán quá nhiều lần
        if (!immediate) {
          const now = Date.now();
          if (now - lastCalculationRef.current < 1000) { // Chỉ tính toán tối đa 1 lần/giây
            if (calculationTimeoutRef.current) {
              clearTimeout(calculationTimeoutRef.current);
            }
            calculationTimeoutRef.current = setTimeout(() => calculateAccurateUnread(true), 500);
            return;
          }
        }
        
        lastCalculationRef.current = Date.now();
        
        try {
          // Lấy tất cả tin nhắn gần đây và filter theo lastReadTimestamp
          // Sử dụng orderByKey() để tránh Firebase Index error
          const allMessagesQuery = query(
            messagesRef,
            orderByKey(),
            limitToLast(100) // Lấy 100 tin nhắn gần nhất
          );
          
          const allMessagesSnapshot = await get(allMessagesQuery);
          
          if (!allMessagesSnapshot.exists()) {
            setUnreadCount(0);
            return;
          }

          const allMessages = allMessagesSnapshot.val() || {};
          let accurateUnreadCount = 0;

          // Đếm chính xác tất cả tin nhắn chưa đọc (có createdAt > lastReadTimestamp)
          Object.values(allMessages).forEach((message: any) => {
            if (
              message.senderId !== currentUserId && // Không phải tin nhắn của mình
              !message.deleted && // Tin nhắn chưa bị xóa
              (!message.hiddenBy || !message.hiddenBy.includes(currentUserId)) && // Tin nhắn chưa bị ẩn
              message.createdAt > lastReadTimestamp // Tin nhắn được tạo sau lastRead marker
            ) {
              accurateUnreadCount++;
            }
          });

          console.log(`Accurate unread count for conversation ${conversationId}:`, accurateUnreadCount, 'lastRead:', lastReadTimestamp);
          setUnreadCount(accurateUnreadCount);
        } catch (error) {
          console.error('Error calculating accurate unread count:', error);
          setUnreadCount(0);
        }
      };

      // Tính toán unread count ngay lập tức
      await calculateAccurateUnread(true);

      // Lắng nghe tin nhắn mới để cập nhật realtime (chỉ cần lắng nghe tin nhắn mới nhất)
      // Sử dụng orderByKey() thay vì orderByChild('createdAt') để tránh Firebase Index error
      // Key của Firebase push() được tạo theo thời gian, đảm bảo thứ tự chronological
      const latestMessagesQuery = query(messagesRef, orderByKey(), limitToLast(10));
      const unsubscribeMessages = onValue(latestMessagesQuery, async () => {
        // Khi có tin nhắn mới, tính lại unread count chính xác (với debounce)
        await calculateAccurateUnread();
      });

      return () => unsubscribeMessages();
    });

    return () => {
      unsubscribeLastRead();
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current);
      }
    };
  }, [conversationId, currentUserId]);

  // Đánh dấu đã đọc bằng cách cập nhật lastRead marker
  const markAsRead = useCallback(async () => {
    if (!conversationId || !currentUserId) return;

    console.log(
      'markAsRead called for conversation:',
      conversationId,
      'user:',
      currentUserId
    );

    try {
      // Lấy tin nhắn mới nhất để cập nhật lastRead marker
      const messagesRef = ref(db, `messages/${conversationId}`);
      const latestMessagesQuery = query(messagesRef, orderByKey(), limitToLast(1));
      const latestMessageSnapshot = await get(latestMessagesQuery);

      if (latestMessageSnapshot.exists()) {
        const messages = latestMessageSnapshot.val();
        const latestMessage = Object.values(messages)[0] as any;
        const latestTimestamp = latestMessage.createdAt;

        // Cập nhật lastRead marker với timestamp của tin nhắn mới nhất
        const lastReadRef = ref(
          db,
          `conversations/${conversationId}/lastRead/${currentUserId}`
        );
        await set(lastReadRef, latestTimestamp);
        
        console.log('Updated lastRead marker to:', latestTimestamp);

        // Cập nhật readBy cho tất cả tin nhắn chưa đọc để hiển thị trạng thái "đã đọc" realtime
        // Lấy tất cả tin nhắn để cập nhật readBy cho những tin nhắn chưa đọc
        const allMessagesQuery = query(messagesRef, orderByKey(), limitToLast(50));
        const allMessagesSnapshot = await get(allMessagesQuery);
        
        if (allMessagesSnapshot.exists()) {
          const allMessages = allMessagesSnapshot.val();
          const updates: { [key: string]: any } = {};
          const readTimestamp = Date.now();

          // Duyệt qua tất cả tin nhắn và đánh dấu readBy cho những tin nhắn chưa đọc
          Object.entries(allMessages).forEach(([messageId, message]: [string, any]) => {
            // Chỉ cập nhật tin nhắn của người khác và chưa được đánh dấu đã đọc
            if (message.senderId !== currentUserId && message.createdAt <= latestTimestamp) {
              const readBy = message.readBy || {};
              if (!readBy[currentUserId]) {
                readBy[currentUserId] = readTimestamp;
                updates[`messages/${conversationId}/${messageId}/readBy`] = readBy;
              }
            }
          });

          // Thực hiện cập nhật hàng loạt nếu có tin nhắn cần cập nhật
          if (Object.keys(updates).length > 0) {
            await update(ref(db), updates);
            console.log(`Updated readBy for ${Object.keys(updates).length} messages`);
          }
        }
      } else {
        console.log('No messages found in conversation');
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [conversationId, currentUserId]);

  // Tăng số tin nhắn chưa đọc (với cơ chế lastRead marker, việc này được tự động tính toán)
  const incrementUnread = useCallback(
    (targetUserId: string) => {
      if (!conversationId || !targetUserId || targetUserId === currentUserId)
        return;

      // Với cơ chế lastRead marker, unread count được tự động tính toán
      // dựa trên việc so sánh timestamp của tin nhắn với lastRead marker
      // Không cần thực hiện thêm action nào ở đây vì:
      // 1. Khi có tin nhắn mới, useEffect sẽ tự động tính lại unread count
      // 2. lastRead marker của người nhận vẫn giữ nguyên (không thay đổi)
      // 3. Tin nhắn mới sẽ có timestamp > lastRead marker => tự động được tính là chưa đọc
      
      console.log(`New message for user ${targetUserId} in conversation ${conversationId} - unread count will be auto-calculated`);
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
