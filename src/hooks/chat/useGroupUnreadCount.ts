import { useEffect, useState, useCallback, useRef } from 'react';
import { ref, onValue, set, get, update, query, orderByKey, limitToLast } from 'firebase/database';
import { db } from '../../firebase';

/**
 * Hook để theo dõi và cập nhật số tin nhắn chưa đọc trong group chat
 * Sử dụng cơ chế lastRead marker đơn giản như chat 1-1
 * Tối ưu performance bằng cách chỉ lắng nghe 50 tin nhắn gần nhất
 * Sử dụng orderByKey() để tránh cần Firebase index, tin nhắn được sắp xếp theo key (thời gian tạo)
 * Key của Firebase push() được tạo theo thời gian, đảm bảo thứ tự chronological
 * @param groupId ID của group chat
 */
export function useGroupUnreadCount(groupId: string) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadTimestamp, setLastReadTimestamp] = useState(0);
  const currentUserId = localStorage.getItem('user_id') || '';
  const inputFocusedRef = useRef(false);
  const lastCalculationRef = useRef<number>(0);
  const calculationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Lắng nghe lastRead marker và tính toán unread count
  useEffect(() => {
    if (!groupId || !currentUserId) return;

    // Lắng nghe lastRead marker của user hiện tại trong group
    const lastReadRef = ref(
      db,
      `groupConversations/${groupId}/lastRead/${currentUserId}`
    );

    const messagesRef = ref(db, `messages/${groupId}`);

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

          // Đếm chính xác tất cả tin nhắn chưa đọc (có timestamp > lastReadTimestamp)
          Object.values(allMessages).forEach((message: any) => {
            // Group chat sử dụng timestamp
            const messageTimestamp = message.timestamp || 0;
            
            if (
              message.senderId !== currentUserId && // Không phải tin nhắn của mình
              messageTimestamp > lastReadTimestamp && // Tin nhắn mới hơn lastRead marker
              !message.deleted && // Tin nhắn chưa bị xóa
              (!message.hiddenBy || !message.hiddenBy.includes(currentUserId)) // Tin nhắn chưa bị ẩn
            ) {
              accurateUnreadCount++;
            }
          });

          console.log(`Accurate unread count for group ${groupId}:`, accurateUnreadCount, 'lastRead:', lastReadTimestamp);
          setUnreadCount(accurateUnreadCount);
        } catch (error) {
          console.error('Error calculating accurate unread count for group:', error);
          setUnreadCount(0);
        }
      };

      // Tính toán unread count ngay lập tức
      await calculateAccurateUnread(true);

      // Lắng nghe tin nhắn mới để cập nhật realtime (chỉ cần lắng nghe tin nhắn mới nhất)
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
  }, [groupId, currentUserId]);

  // Đánh dấu đã đọc bằng cách cập nhật lastRead marker
  const markAsRead = useCallback(async () => {
    if (!groupId || !currentUserId) return;

    console.log(
      'markAsRead called for group:',
      groupId,
      'user:',
      currentUserId,
      'unread count:',
      unreadCount
    );

    try {
      // Lấy tin nhắn mới nhất để cập nhật lastRead marker (tối ưu performance)
      const messagesRef = ref(db, `messages/${groupId}`);
      const latestMessagesQuery = query(messagesRef, orderByKey(), limitToLast(1));
      const latestMessageSnapshot = await get(latestMessagesQuery);

      if (latestMessageSnapshot.exists()) {
        const messages = latestMessageSnapshot.val();
        const latestMessage = Object.values(messages)[0] as any;
        // Group chat sử dụng timestamp
        const latestTimestamp = latestMessage?.timestamp;

        // Kiểm tra latestTimestamp có hợp lệ không
        if (!latestTimestamp || typeof latestTimestamp !== 'number') {
          console.log('Invalid latestTimestamp:', latestTimestamp, 'latestMessage:', latestMessage, 'for group:', groupId);
          return;
        }

        // Cập nhật lastRead marker với timestamp của tin nhắn mới nhất
        const lastReadRef = ref(
          db,
          `groupConversations/${groupId}/lastRead/${currentUserId}`
        );
        await set(lastReadRef, latestTimestamp);
        
        console.log(
          '✅ Updated lastRead marker for group:',
          groupId,
          'user:',
          currentUserId,
          'timestamp:',
          latestTimestamp
        );

        // Cập nhật readBy cho 50 tin nhắn gần nhất để hiển thị trạng thái "đã đọc" realtime
        const allMessagesQuery = query(messagesRef, orderByKey(), limitToLast(50));
        const allMessagesSnapshot = await get(allMessagesQuery);
        
        if (allMessagesSnapshot.exists()) {
          const allMessages = allMessagesSnapshot.val();
          const updates: { [key: string]: any } = {};
          const readTimestamp = Date.now();

          // Duyệt qua tất cả tin nhắn và đánh dấu readBy cho những tin nhắn chưa đọc
          Object.entries(allMessages).forEach(([messageId, message]: [string, any]) => {
            // Group chat sử dụng timestamp
            const messageTimestamp = message.timestamp || 0;
            
            // Chỉ cập nhật tin nhắn của người khác, chưa được đánh dấu đã đọc, và không bị xóa/ẩn
            if (
              message.senderId !== currentUserId && 
              messageTimestamp <= latestTimestamp &&
              !message.deleted &&
              (!message.hiddenBy || !message.hiddenBy.includes(currentUserId))
            ) {
              const readBy = message.readBy || {};
              if (!readBy[currentUserId]) {
                readBy[currentUserId] = readTimestamp;
                updates[`messages/${groupId}/${messageId}/readBy`] = readBy;
              }
            }
          });

          console.log(
            '📝 Preparing readBy updates for group:',
            groupId,
            'updates count:',
            Object.keys(updates).length,
            'latestTimestamp:',
            latestTimestamp
          );

          // Thực hiện cập nhật hàng loạt nếu có tin nhắn cần cập nhật
          if (Object.keys(updates).length > 0) {
            await update(ref(db), updates);
            console.log(`✅ Updated readBy for ${Object.keys(updates).length} group messages in group:`, groupId);
          } else {
            console.log('⚠️ No readBy updates needed for group:', groupId);
          }
        } else {
          console.log('⚠️ No messages found for readBy update in group:', groupId);
        }
      } else {
        console.log('No messages found in group');
      }
    } catch (error) {
      console.error('Error marking group messages as read:', error);
    }
  }, [groupId, currentUserId]);

  // Tăng số tin nhắn chưa đọc (với cơ chế lastRead marker, việc này được tự động tính toán)
  const incrementUnread = useCallback(
    (targetUserId: string) => {
      if (!groupId || !targetUserId || targetUserId === currentUserId)
        return;

      // Với cơ chế lastRead marker, unread count được tự động tính toán
      // dựa trên việc so sánh timestamp của tin nhắn với lastRead marker
      // Không cần thực hiện thêm action nào ở đây vì:
      // 1. Khi có tin nhắn mới, useEffect sẽ tự động tính lại unread count
      // 2. lastRead marker của người nhận vẫn giữ nguyên (không thay đổi)
      // 3. Tin nhắn mới sẽ có timestamp > lastRead marker => tự động được tính là chưa đọc
      
      console.log(`New group message for user ${targetUserId} in group ${groupId} - unread count will be auto-calculated`);
    },
    [groupId, currentUserId]
  );

  // Xử lý sự kiện focus và blur cho input
  const handleInputFocus = useCallback(() => {
    console.log('🎯 GROUP handleInputFocus called for group:', groupId, 'unreadCount:', unreadCount);
    inputFocusedRef.current = true;
    // Luôn gọi markAsRead khi focus vào input, không cần kiểm tra unreadCount
    markAsRead();
  }, [markAsRead, groupId, unreadCount]);

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