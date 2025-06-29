import { useEffect, useState, useCallback, useRef } from 'react';
import { ref, onValue, set, get } from 'firebase/database';
import { db } from '../../firebase';

/**
 * Hook để theo dõi và cập nhật trạng thái đang nhập trong hội thoại
 * @param conversationId ID của hội thoại (có thể null hoặc undefined)
 * @param userId ID của người dùng cần kiểm tra (có thể undefined)
 */
export function useTypingStatus(
  conversationId: string | null | undefined,
  userId?: string
) {
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isInputFocusedRef = useRef<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentUserIdRef = useRef<string | null>(
    localStorage.getItem('user_id')
  );

  // Lắng nghe trạng thái đang nhập của người dùng khác
  useEffect(() => {
    if (!conversationId) return;

    // Lấy ID của tất cả người dùng khác trong hội thoại
    const getOtherUsers = async () => {
      try {
        const conversationRef = ref(
          db,
          `conversations/${conversationId}/members`
        );
        const snapshot = await get(conversationRef);

        if (!snapshot.exists()) return [];

        const members = snapshot.val();
        const currentUserId = currentUserIdRef.current;
        if (!currentUserId) return [];

        return Object.keys(members).filter(id => id !== currentUserId);
      } catch (error) {
        console.error('Error getting other users:', error);
        return [];
      }
    };

    // Thiết lập lắng nghe trạng thái typing
    const setupTypingListener = async () => {
      // Nếu có userId cụ thể, chỉ lắng nghe người dùng đó
      if (userId) {
        const typingRef = ref(db, `typingStatus/${conversationId}/${userId}`);
        return onValue(typingRef, snapshot => {
          setIsTyping(!!snapshot.val());
        });
      }

      // Nếu không có userId, lắng nghe tất cả người dùng khác
      const otherUsers = await getOtherUsers();
      if (otherUsers.length === 0) return null;

      // Nếu chỉ có một người dùng khác, lắng nghe trực tiếp
      if (otherUsers.length === 1) {
        const typingRef = ref(
          db,
          `typingStatus/${conversationId}/${otherUsers[0]}`
        );
        return onValue(typingRef, snapshot => {
          setIsTyping(!!snapshot.val());
        });
      }

      // Nếu có nhiều người dùng, lắng nghe cả thư mục
      const typingRef = ref(db, `typingStatus/${conversationId}`);
      return onValue(typingRef, snapshot => {
        if (!snapshot.exists()) {
          setIsTyping(false);
          return;
        }

        const typingData = snapshot.val();
        const currentUserId = currentUserIdRef.current;
        if (!currentUserId) {
          setIsTyping(false);
          return;
        }

        // Kiểm tra xem có người dùng nào khác đang nhập không
        const someoneTyping = Object.entries(typingData).some(
          ([userId, isTyping]) => userId !== currentUserId && !!isTyping
        );

        setIsTyping(someoneTyping);
      });
    };

    // Thiết lập listener và lưu hàm unsubscribe
    let unsubscribe: (() => void) | null = null;
    setupTypingListener().then(unsub => {
      if (unsub) unsubscribe = unsub;
    });

    // Cleanup khi unmount hoặc conversationId thay đổi
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [conversationId, userId]);

  // Xóa trạng thái typing khi component unmount hoặc conversationId thay đổi
  useEffect(() => {
    // Khi conversationId thay đổi, đặt lại trạng thái typing cho cuộc trò chuyện cũ
    const resetTypingStatus = () => {
      const currentUserId = currentUserIdRef.current;
      if (currentUserId && conversationId) {
        const typingRef = ref(
          db,
          `typingStatus/${conversationId}/${currentUserId}`
        );
        set(typingRef, false);
      }
    };

    // Đặt lại trạng thái typing khi unmount hoặc conversationId thay đổi
    return () => {
      resetTypingStatus();

      // Xóa timeout nếu có
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [conversationId]);

  // Thêm một effect để theo dõi window blur event
  useEffect(() => {
    const handleWindowBlur = () => {
      // Khi người dùng chuyển tab hoặc rời khỏi trang, đặt lại trạng thái typing
      if (conversationId && currentUserIdRef.current) {
        const typingRef = ref(
          db,
          `typingStatus/${conversationId}/${currentUserIdRef.current}`
        );
        set(typingRef, false);
        isInputFocusedRef.current = false;
      }
    };

    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [conversationId]);

  // Hàm cập nhật trạng thái đang nhập của người dùng hiện tại
  const setTyping = useCallback(
    (typing: boolean) => {
      if (!conversationId) return;

      const currentUserId = currentUserIdRef.current;
      if (!currentUserId) return;

      // Chỉ cập nhật trạng thái typing khi input đang được focus
      if (isInputFocusedRef.current) {
        const typingRef = ref(
          db,
          `typingStatus/${conversationId}/${currentUserId}`
        );
        set(typingRef, typing);

        // Nếu đang typing, đặt timeout để tự động reset sau một khoảng thời gian
        if (typing && typingTimeoutRef.current === null) {
          typingTimeoutRef.current = setTimeout(() => {
            // Kiểm tra xem input có còn focus không trước khi reset
            if (
              !document.hasFocus() ||
              document.activeElement !== inputRef.current
            ) {
              const typingRef = ref(
                db,
                `typingStatus/${conversationId}/${currentUserId}`
              );
              set(typingRef, false);
            }
            typingTimeoutRef.current = null;
          }, 10000); // Reset sau 10 giây nếu không có hoạt động
        }
      } else {
        // Nếu input không được focus, đảm bảo trạng thái typing là false
        const typingRef = ref(
          db,
          `typingStatus/${conversationId}/${currentUserId}`
        );
        set(typingRef, false);
      }
    },
    [conversationId]
  );

  // Xử lý sự kiện focus và blur
  const handleFocus = useCallback(() => {
    isInputFocusedRef.current = true;

    const currentUserId = currentUserIdRef.current;
    if (!currentUserId || !conversationId) return;

    // Nếu có text trong input, set typing = true
    if (inputRef.current && inputRef.current.value.trim().length > 0) {
      const typingRef = ref(
        db,
        `typingStatus/${conversationId}/${currentUserId}`
      );
      set(typingRef, true);
    }
  }, [conversationId]);

  const handleBlur = useCallback(() => {
    isInputFocusedRef.current = false;

    const currentUserId = currentUserIdRef.current;
    if (!currentUserId || !conversationId) return;

    // Khi blur, set typing = false ngay lập tức
    const typingRef = ref(
      db,
      `typingStatus/${conversationId}/${currentUserId}`
    );
    set(typingRef, false);

    // Xóa timeout nếu có
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [conversationId]);

  // Hàm để đăng ký ref cho input element
  const registerInputRef = useCallback((ref: HTMLInputElement | null) => {
    inputRef.current = ref;
  }, []);

  // Debug
  useEffect(() => {
    console.log('isTyping state:', isTyping);
  }, [isTyping]);

  return {
    isTyping,
    setTyping,
    handleFocus,
    handleBlur,
    registerInputRef,
  };
}
