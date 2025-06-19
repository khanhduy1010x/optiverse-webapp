import { useEffect, useState, useCallback } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "../../firebase";

/**
 * Hook để theo dõi và cập nhật trạng thái đang nhập trong hội thoại
 * @param conversationId ID của hội thoại
 * @param userId ID của người dùng cần kiểm tra
 */
export function useTypingStatus(conversationId: string, userId: string) {
  const [isTyping, setIsTyping] = useState(false);

  // Lắng nghe trạng thái đang nhập của người dùng khác
  useEffect(() => {
    if (!conversationId || !userId) return;
    
    const typingRef = ref(db, `typingStatus/${conversationId}/${userId}`);
    
    const unsubscribe = onValue(typingRef, (snapshot) => {
      setIsTyping(!!snapshot.val());
    });
    
    return () => unsubscribe();
  }, [conversationId, userId]);

  // Hàm cập nhật trạng thái đang nhập của người dùng hiện tại
  const setTyping = useCallback((typing: boolean) => {
    if (!conversationId) return;
    
    const currentUserId = localStorage.getItem("user_id");
    if (!currentUserId) return;
    
    const typingRef = ref(db, `typingStatus/${conversationId}/${currentUserId}`);
    set(typingRef, typing);
  }, [conversationId]);

  return { isTyping, setTyping };
} 