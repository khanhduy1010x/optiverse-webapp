import { useEffect, useState, useCallback } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "../../firebase";

/**
 * Hook để theo dõi và cập nhật số tin nhắn chưa đọc trong hội thoại
 * @param conversationId ID của hội thoại
 */
export function useUnreadCount(conversationId: string) {
  const [unreadCount, setUnreadCount] = useState(0);
  const currentUserId = localStorage.getItem("user_id") || "";

  // Lắng nghe số tin nhắn chưa đọc
  useEffect(() => {
    if (!conversationId || !currentUserId) return;
    
    const unreadCountRef = ref(db, `unreadCount/${conversationId}/${currentUserId}`);
    
    const unsubscribe = onValue(unreadCountRef, (snapshot) => {
      const count = snapshot.val() || 0;
      setUnreadCount(count);
    });
    
    return () => unsubscribe();
  }, [conversationId, currentUserId]);

  // Đánh dấu đã đọc tất cả tin nhắn
  const markAsRead = useCallback(() => {
    if (!conversationId || !currentUserId) return;
    
    const unreadCountRef = ref(db, `unreadCount/${conversationId}/${currentUserId}`);
    set(unreadCountRef, 0);
  }, [conversationId, currentUserId]);

  // Tăng số tin nhắn chưa đọc
  const incrementUnread = useCallback((targetUserId: string) => {
    if (!conversationId || !targetUserId || targetUserId === currentUserId) return;
    
    const unreadCountRef = ref(db, `unreadCount/${conversationId}/${targetUserId}`);
    
    // Đọc giá trị hiện tại và tăng lên 1
    onValue(unreadCountRef, (snapshot) => {
      const currentCount = snapshot.val() || 0;
      set(unreadCountRef, currentCount + 1);
    }, { onlyOnce: true });
  }, [conversationId, currentUserId]);

  return { unreadCount, markAsRead, incrementUnread };
} 