import { useCallback } from 'react';
import {
  ref,
  push,
  serverTimestamp,
  update,
  get,
  set,
  remove,
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
      console.log('=== SEND TEXT MESSAGE STARTED ===');
      console.log('conversationId:', conversationId);
      console.log('message:', message);
      
      if (!conversationId) {
        console.error('No conversationId provided');
        return false;
      }

      try {
        console.log('Creating Firebase references...');
        const messagesRef = ref(db, `messages/${conversationId}`);
        const timestamp = Date.now();
        
        console.log('messagesRef path:', `messages/${conversationId}`);
        console.log('timestamp:', timestamp);

        // Lấy thông tin người gửi để lưu vào senderInfo
        let senderInfo = null;
        if (message.senderId) {
          try {
            const users = await chatService.getUsersByIds([message.senderId]);
            if (users.length > 0) {
              const user = users[0];
              senderInfo = {
                full_name: user.full_name,
                avatar_url: user.avatar_url,
                email: user.email
              };
            }
          } catch (error) {
            console.error('Error fetching sender info:', error);
          }
        }

        // Thêm tin nhắn mới vào database
        console.log('Pushing message to Firebase...');
        const newMessageRef = push(messagesRef, {
          ...message,
          createdAt: timestamp,
          senderInfo: senderInfo,
        });
        
        console.log('Message pushed with key:', newMessageRef.key);

        // Cập nhật tin nhắn cuối cùng trong conversation và khôi phục cuộc trò chuyện nếu bị xóa mềm
        console.log('Updating conversation lastMessage...');
        const conversationRef = ref(db, `conversations/${conversationId}`);
        
        // Kiểm tra xem cuộc trò chuyện có bị xóa mềm không
        const conversationSnapshot = await get(conversationRef);
        const conversationData = conversationSnapshot.val();
        const currentUserId = localStorage.getItem('user_id') || '';
        
        const updateData: any = {
          lastMessage: {
            text: message.text,
            senderId: message.senderId,
            createdAt: timestamp,
            images: message.images || [],
            hasAudio: !!message.audio,
            isReply: !!message.replyTo,
          },
          lastMessageId: newMessageRef.key,
        };
        
        // Cập nhật conversation trước
        await update(conversationRef, updateData);
        
        // Nếu cuộc trò chuyện bị xóa mềm bởi user hiện tại, khôi phục nó
        if (conversationData?.deletedBy?.[currentUserId]) {
          console.log('Restoring soft-deleted conversation for user:', currentUserId);
          const deletedByUserRef = ref(db, `conversations/${conversationId}/deletedBy/${currentUserId}`);
          await remove(deletedByUserRef);
          console.log('Successfully removed deletedBy field for user:', currentUserId);
        }
        
        // KHÔNG xóa messagesDeletedAt - giữ timestamp để tiếp tục filter tin nhắn cũ
        // Điều này đảm bảo rằng sau khi user xóa conversation và gửi tin mới,
        // chỉ có tin nhắn mới (sau timestamp xóa) mới hiển thị
        console.log('Keeping messagesDeletedAt timestamp to filter old messages');
        
        console.log('Conversation updated successfully');

        // Cập nhật lastRead marker cho người gửi (đánh dấu đã đọc tin nhắn vừa gửi)
        if (currentUserId) {
          const lastReadRef = ref(
            db,
            `conversations/${conversationId}/lastRead/${currentUserId}`
          );
          await set(lastReadRef, timestamp);
          console.log('Updated sender lastRead marker to:', timestamp);
        }

        // Với cơ chế lastRead marker, unread count sẽ được tự động tính toán
        // cho người nhận dựa trên việc so sánh timestamp tin nhắn mới
        // với lastRead marker của họ. Không cần tăng unread count thủ công nữa.
        console.log('Message sent - unread count will be auto-calculated for recipient');

        console.log('=== SEND TEXT MESSAGE COMPLETED SUCCESSFULLY ===');
        return true;
      } catch (error) {
        console.error('=== SEND TEXT MESSAGE FAILED ===');
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
