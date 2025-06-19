import { useEffect, useState } from "react";
import { ref, onChildAdded, query, orderByChild, limitToLast, DataSnapshot } from "firebase/database";
import { db } from "../../firebase";
import { MessageType } from "../../types/chat/MessageType";

/**
 * Hook để lấy tin nhắn theo thời gian thực từ một hội thoại
 * @param conversationId ID của hội thoại
 * @param limit Số lượng tin nhắn tối đa cần lấy
 */
export function useMessages(conversationId: string, limit: number = 50) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    setMessages([]);
    setLoading(true);

    // Tạo query để lấy tin nhắn, sắp xếp theo thời gian tạo và giới hạn số lượng
    const messagesRef = query(
      ref(db, `messages/${conversationId}`),
      orderByChild("createdAt"),
      limitToLast(limit)
    );

    // Đăng ký lắng nghe sự kiện thêm tin nhắn mới
    const unsubscribe = onChildAdded(messagesRef, (snapshot: DataSnapshot) => {
      const message = {
        id: snapshot.key!,
        ...snapshot.val()
      } as MessageType;
      
      setMessages((prevMessages) => [...prevMessages, message]);
      setLoading(false);
    });

    // Clean up khi component unmount hoặc conversationId thay đổi
    return () => {
      unsubscribe();
    };
  }, [conversationId, limit]);

  return { messages, loading };
} 