import { useState, useEffect, useCallback } from 'react';
import { ref, set, get, onValue, remove } from 'firebase/database';
import { db } from '../../firebase';
import { MessageType } from '../../types/chat/MessageType';

/**
 * Hook để quản lý tin nhắn được ghim trong hội thoại
 * @param conversationId ID của hội thoại
 */
export function usePinMessage(conversationId: string) {
  const [pinnedMessages, setPinnedMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách tin nhắn được ghim
  useEffect(() => {
    if (!conversationId) return;

    setIsLoading(true);
    const pinnedMessagesRef = ref(db, `pinnedMessages/${conversationId}`);

    const unsubscribe = onValue(pinnedMessagesRef, async snapshot => {
      try {
        if (!snapshot.exists()) {
          setPinnedMessages([]);
          setIsLoading(false);
          return;
        }

        const pinnedMessagesData = snapshot.val();
        const messagesArray: MessageType[] = Object.values(pinnedMessagesData);

        // Sắp xếp theo thời gian
        messagesArray.sort((a: any, b: any) => a.timestamp - b.timestamp);

        setPinnedMessages(messagesArray);
      } catch (err) {
        setError('Không thể tải tin nhắn được ghim');
        console.error('Error fetching pinned messages:', err);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [conversationId]);

  // Ghim tin nhắn
  const pinMessage = useCallback(
    async (message: MessageType | string) => {
      if (!conversationId) return;

      try {
        setIsLoading(true);

        // Kiểm tra số lượng tin nhắn đã ghim
        const pinnedMessagesRef = ref(db, `pinnedMessages/${conversationId}`);
        const snapshot = await get(pinnedMessagesRef);

        if (snapshot.exists()) {
          const existingPins = Object.keys(snapshot.val());
          if (existingPins.length >= 5) {
            setError('Chỉ được ghim tối đa 5 tin nhắn');
            return false;
          }
        }

        // Nếu message là string (messageId), cần lấy thông tin tin nhắn trước
        let messageToPin: MessageType;
        if (typeof message === 'string') {
          const messageRef = ref(db, `messages/${conversationId}/${message}`);
          const messageSnapshot = await get(messageRef);

          if (!messageSnapshot.exists()) {
            setError('Không tìm thấy tin nhắn');
            return false;
          }

          messageToPin = {
            id: message,
            ...messageSnapshot.val(),
          };
        } else {
          messageToPin = message;
        }

        // Lưu tin nhắn được ghim vào database
        const messageRef = ref(
          db,
          `pinnedMessages/${conversationId}/${messageToPin.id}`
        );
        await set(messageRef, messageToPin);

        return true;
      } catch (err) {
        setError('Không thể ghim tin nhắn');
        console.error('Error pinning message:', err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId]
  );

  // Bỏ ghim tin nhắn
  const unpinMessage = useCallback(
    async (messageId: string) => {
      if (!conversationId || !messageId) return;

      try {
        setIsLoading(true);

        // Xóa tin nhắn khỏi danh sách ghim
        const messageRef = ref(
          db,
          `pinnedMessages/${conversationId}/${messageId}`
        );
        await remove(messageRef);

        return true;
      } catch (err) {
        setError('Không thể bỏ ghim tin nhắn');
        console.error('Error unpinning message:', err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId]
  );

  // Kiểm tra tin nhắn có được ghim không
  const isMessagePinned = useCallback(
    (messageId: string) => {
      return pinnedMessages.some(message => message.id === messageId);
    },
    [pinnedMessages]
  );

  return {
    pinnedMessages,
    pinMessage,
    unpinMessage,
    isMessagePinned,
    isLoading,
    error,
  };
}
