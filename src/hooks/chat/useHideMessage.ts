import { useCallback } from "react";
import { ref, update } from "firebase/database";
import { db } from "../../firebase";

/**
 * Hook để ẩn/hiện hội thoại cho người dùng hiện tại
 * @param conversationId ID của hội thoại
 */
export function useHideMessage(conversationId: string) {
  const currentUserId = localStorage.getItem("user_id") || "";

  // Hàm ẩn hội thoại
  const hideConversation = useCallback(() => {
    if (!conversationId || !currentUserId) return;
    
    const hiddenRef = ref(db, `conversations/${conversationId}/hiddenBy`);
    update(hiddenRef, { [currentUserId]: true });
  }, [conversationId, currentUserId]);

  // Hàm hiển thị lại hội thoại đã ẩn
  const showConversation = useCallback(() => {
    if (!conversationId || !currentUserId) return;
    
    const hiddenRef = ref(db, `conversations/${conversationId}/hiddenBy/${currentUserId}`);
    update(hiddenRef, null);
  }, [conversationId, currentUserId]);

  return { hideConversation, showConversation };
}