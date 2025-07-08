import { useCallback } from 'react';
import {
  ref,
  push,
  serverTimestamp,
  update,
  get,
  set,
} from 'firebase/database';
import { db } from '../../firebase';
import { MessageContentType, MessageType } from '../../types/chat/MessageType';
import chatService from '../../services/chat.service';

/**
 * Hook để gửi tin nhắn mới vào hội thoại
 * @param conversationId ID của hội thoại
 * @returns Hàm gửi tin nhắn
 */
export function useSendMessage(conversationId: string) {
  /**
   * Gửi tin nhắn văn bản đơn giản
   */
  const sendTextMessage = useCallback(
    async (message: Omit<MessageType, 'id' | 'createdAt'>) => {
      if (!conversationId) return false;

      try {
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
            images: message.images || [],
            hasAudio: !!message.audio,
            isReply: !!message.replyTo,
          },
          lastMessageId: newMessageRef.key,
        });

        // Đánh dấu đã đọc cho người gửi
        const currentUserId = localStorage.getItem('user_id') || '';
        if (currentUserId) {
          const selfUnreadCountRef = ref(
            db,
            `unreadCount/${conversationId}/${currentUserId}`
          );
          set(selfUnreadCountRef, 0);
        }

        // Tăng số tin nhắn chưa đọc cho người nhận
        try {
          // Lấy thông tin về các thành viên trong hội thoại
          const membersRef = ref(db, `conversations/${conversationId}/members`);
          const membersSnapshot = await get(membersRef);

          if (membersSnapshot.exists()) {
            const members = membersSnapshot.val();

            // Tìm ID của người nhận (khác với người gửi)
            Object.keys(members).forEach(async memberId => {
              if (memberId !== currentUserId) {
                // Kiểm tra xem người nhận có đang focus vào input không
                const typingRef = ref(
                  db,
                  `typingStatus/${conversationId}/${memberId}`
                );
                const typingSnapshot = await get(typingRef);

                // Nếu người nhận không đang focus vào input, tăng số tin nhắn chưa đọc
                if (!typingSnapshot.exists() || !typingSnapshot.val()) {
                  const unreadCountRef = ref(
                    db,
                    `unreadCount/${conversationId}/${memberId}`
                  );
                  const unreadSnapshot = await get(unreadCountRef);
                  const currentCount = unreadSnapshot.val() || 0;

                  set(unreadCountRef, currentCount + 1);
                }
              }
            });
          }
        } catch (error) {
          console.error('Error updating unread count:', error);
        }

        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        return false;
      }
    },
    [conversationId]
  );

  /**
   * Gửi tin nhắn có hình ảnh
   */
  const sendMessageWithImages = useCallback(
    async (text: string, files: File[]) => {
      if (!conversationId) return false;

      try {
        const currentUserId = localStorage.getItem('user_id');
        if (!currentUserId) return false;

        // Tải lên các hình ảnh
        const imageUrls = await chatService.uploadMessageImages(files);

        // Gửi tin nhắn với các URL hình ảnh
        return await sendTextMessage({
          senderId: currentUserId,
          text: text,
          images: imageUrls,
        });
      } catch (error) {
        console.error('Error sending message with images:', error);
        return false;
      }
    },
    [conversationId, sendTextMessage]
  );

  /**
   * Gửi tin nhắn thoại
   */
  const sendAudioMessage = useCallback(
    async (audioFile: File, text: string = '') => {
      if (!conversationId) return false;

      try {
        const currentUserId = localStorage.getItem('user_id');
        if (!currentUserId) return false;

        // Tải lên file âm thanh
        const audioData = await chatService.uploadAudioMessage(audioFile);

        // Gửi tin nhắn với URL âm thanh
        return await sendTextMessage({
          senderId: currentUserId,
          text: text,
          audio: audioData,
        });
      } catch (error) {
        console.error('Error sending audio message:', error);
        return false;
      }
    },
    [conversationId, sendTextMessage]
  );

  /**
   * Gửi tin nhắn trả lời
   */
  const sendReplyMessage = useCallback(
    async (
      text: string,
      replyTo: { messageId: string; text: string; senderId: string }
    ) => {
      if (!conversationId) return false;

      try {
        const currentUserId = localStorage.getItem('user_id');
        if (!currentUserId) return false;

        // Gửi tin nhắn trả lời
        return await sendTextMessage({
          senderId: currentUserId,
          text: text,
          replyTo: replyTo,
        });
      } catch (error) {
        console.error('Error sending reply message:', error);
        return false;
      }
    },
    [conversationId, sendTextMessage]
  );

  /**
   * Gửi tin nhắn trả lời kèm hình ảnh
   */
  const sendReplyWithImages = useCallback(
    async (
      text: string,
      files: File[],
      replyTo: { messageId: string; text: string; senderId: string }
    ) => {
      if (!conversationId) return false;

      try {
        const currentUserId = localStorage.getItem('user_id');
        if (!currentUserId) return false;

        // Tải lên các hình ảnh
        const imageUrls = await chatService.uploadMessageImages(files);

        // Gửi tin nhắn với các URL hình ảnh và thông tin trả lời
        return await sendTextMessage({
          senderId: currentUserId,
          text: text,
          images: imageUrls,
          replyTo: replyTo,
        });
      } catch (error) {
        console.error('Error sending reply with images:', error);
        return false;
      }
    },
    [conversationId, sendTextMessage]
  );

  return {
    sendTextMessage,
    sendMessageWithImages,
    sendAudioMessage,
    sendReplyMessage,
    sendReplyWithImages,
  };
}
