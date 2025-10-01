import { useState, useEffect, useCallback } from 'react';
import { ref, set, get, onValue, remove } from 'firebase/database';
import { db } from '../../firebase';
import { MessageType } from '../../types/chat/MessageType';

/**
 * Hook để quản lý tin nhắn được ghim trong group chat
 * @param groupConversationId ID của group conversation
 */
export function usePinGroupMessage(groupConversationId: string) {
  const [pinnedMessages, setPinnedMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách tin nhắn được ghim trong group
  useEffect(() => {
    if (!groupConversationId) return;

    setIsLoading(true);
    const pinnedGroupMessagesRef = ref(db, `pinnedGroupMessages/${groupConversationId}`);

    const unsubscribe = onValue(pinnedGroupMessagesRef, async snapshot => {
      try {
        if (!snapshot.exists()) {
          setPinnedMessages([]);
          setIsLoading(false);
          return;
        }

        const pinnedMessagesData = snapshot.val();
        const messagesArray: MessageType[] = Object.values(pinnedMessagesData);

        // Sắp xếp theo thời gian (sử dụng timestamp cho group chat)
        messagesArray.sort((a: any, b: any) => a.timestamp - b.timestamp);

        setPinnedMessages(messagesArray);
      } catch (err) {
        setError('Không thể tải tin nhắn được ghim');
        console.error('Error fetching pinned group messages:', err);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [groupConversationId]);

  // Ghim tin nhắn trong group
  const pinGroupMessage = useCallback(
    async (message: MessageType | string) => {
      if (!groupConversationId) return;

      console.log('pinGroupMessage called with:', { message, groupConversationId });

      try {
        setIsLoading(true);

        // Kiểm tra số lượng tin nhắn đã ghim (tối đa 10 cho group chat)
        const pinnedGroupMessagesRef = ref(db, `pinnedGroupMessages/${groupConversationId}`);
        const snapshot = await get(pinnedGroupMessagesRef);

        if (snapshot.exists()) {
          const existingPins = Object.keys(snapshot.val());
          if (existingPins.length >= 10) {
            setError('Chỉ được ghim tối đa 10 tin nhắn trong group chat');
            return false;
          }
        }

        // Nếu message là string (messageId), cần lấy thông tin tin nhắn trước
        let messageToPin: MessageType;
        if (typeof message === 'string') {
          const messageRef = ref(db, `messages/${groupConversationId}/${message}`);
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

        // Lưu tin nhắn được ghim vào database với collection riêng cho group
        const messageRef = ref(
          db,
          `pinnedGroupMessages/${groupConversationId}/${messageToPin.id}`
        );
        await set(messageRef, messageToPin);

        console.log('Message pinned successfully:', messageToPin.id);
        return true;
      } catch (err) {
        setError('Không thể ghim tin nhắn');
        console.error('Error pinning group message:', err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [groupConversationId]
  );

  // Bỏ ghim tin nhắn trong group
  const unpinGroupMessage = useCallback(
    async (messageId: string) => {
      if (!groupConversationId || !messageId) return;

      try {
        setIsLoading(true);

        // Xóa tin nhắn khỏi danh sách ghim trong group
        const messageRef = ref(
          db,
          `pinnedGroupMessages/${groupConversationId}/${messageId}`
        );
        await remove(messageRef);

        return true;
      } catch (err) {
        setError('Không thể bỏ ghim tin nhắn');
        console.error('Error unpinning group message:', err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [groupConversationId]
  );

  // Kiểm tra tin nhắn có được ghim không trong group
  const isGroupMessagePinned = useCallback(
    (messageId: string) => {
      return pinnedMessages.some(message => message.id === messageId);
    },
    [pinnedMessages]
  );

  return {
    pinnedMessages,
    pinGroupMessage,
    unpinGroupMessage,
    isGroupMessagePinned,
    isLoading,
    error,
  };
}