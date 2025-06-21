import { useCallback } from 'react';
import { ref, push, serverTimestamp, update } from 'firebase/database';
import { db } from '../../firebase';
import { MessageType } from '../../types/chat/MessageType';

/**
 * Hook để gửi tin nhắn mới vào hội thoại
 * @param conversationId ID của hội thoại
 * @returns Hàm gửi tin nhắn
 */
export function useSendMessage(conversationId: string) {
  return useCallback(
    (message: Omit<MessageType, 'id' | 'createdAt'>) => {
      if (!conversationId) return;

      const messagesRef = ref(db, `messages/${conversationId}`);
      const timestamp = Date.now();

      // Thêm tin nhắn mới vào database
      const newMessageRef = push(messagesRef, {
        ...message,
        createdAt: timestamp,
      });

      // Cập nhật tin nhắn cuối cùng trong conversation
      const conversationRef = ref(db, `conversations/${conversationId}`);
      update(conversationRef, {
        lastMessage: {
          text: message.text,
          senderId: message.senderId,
          createdAt: timestamp,
        },
        lastMessageId: newMessageRef.key,
      });

      // Cập nhật trạng thái đọc tin nhắn
      const userIdLocal = localStorage.getItem('user_id') || '';
      if (userIdLocal) {
        const unreadCountRef = ref(
          db,
          `unreadCount/${conversationId}/${userIdLocal}`
        );
        push(unreadCountRef, 0); // Đánh dấu đã đọc cho người gửi
      }
    },
    [conversationId]
  );
}
