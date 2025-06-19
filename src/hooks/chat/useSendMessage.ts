import { useCallback } from "react";
import { ref, push, serverTimestamp } from "firebase/database";
import { db } from "../../firebase";
import { MessageType } from "../../types/chat/MessageType";

/**
 * Hook để gửi tin nhắn mới vào hội thoại
 * @param conversationId ID của hội thoại
 * @returns Hàm gửi tin nhắn
 */
export function useSendMessage(conversationId: string) {
  return useCallback(
    (message: Omit<MessageType, "id" | "createdAt">) => {
      if (!conversationId) return;
      
      const messagesRef = ref(db, `messages/${conversationId}`);
      
      // Thêm tin nhắn mới vào database
      push(messagesRef, {
        ...message,
        createdAt: Date.now(),
      });
      
      // Cập nhật trạng thái đọc tin nhắn
      const userIdLocal = localStorage.getItem("user_id") || "";
      if (userIdLocal) {
        const unreadCountRef = ref(db, `unreadCount/${conversationId}/${userIdLocal}`);
        push(unreadCountRef, 0); // Đánh dấu đã đọc cho người gửi
      }
    },
    [conversationId]
  );
} 
 