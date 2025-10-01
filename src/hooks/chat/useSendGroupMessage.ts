import { useCallback } from 'react';
import {
  ref,
  push,
  update,
  get,
  set,
} from 'firebase/database';
import { db } from '../../firebase';
import { MessageType } from '../../types/chat/MessageType';
import chatService from '../../services/chat.service';

/**
 * Hook để gửi tin nhắn mới vào group conversation
 * @param groupId ID của group conversation
 * @returns Hàm gửi tin nhắn group
 */
export function useSendGroupMessage(groupId: string) {
  /**
   * Gửi tin nhắn văn bản đơn giản cho group
   */
  const sendGroupTextMessage = useCallback(
    async (message: Omit<MessageType, 'id' | 'createdAt'>) => {
      console.log('=== SEND GROUP TEXT MESSAGE STARTED ===');
      console.log('groupId:', groupId);
      console.log('message:', message);
      
      if (!groupId) {
        console.error('No groupId provided');
        return false;
      }

      try {
        console.log('Creating Firebase references for group...');
        const messagesRef = ref(db, `messages/${groupId}`);
        const timestamp = Date.now();
        
        console.log('messagesRef path:', `messages/${groupId}`);
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

        // Thêm tin nhắn mới vào database với timestamp thay vì createdAt
        console.log('Pushing group message to Firebase...');
        
        // Khởi tạo readBy với người gửi đã đọc
        const currentUserId = localStorage.getItem('user_id') || '';
        const readBy: { [userId: string]: number } = {};
        if (currentUserId) {
          readBy[currentUserId] = timestamp;
        }
        
        const newMessageRef = push(messagesRef, {
          ...message,
          timestamp: timestamp, // Sử dụng timestamp cho group messages
          readBy: readBy, // Thêm readBy field cho group messages
          senderInfo: senderInfo,
        });
        
        console.log('Group message pushed with key:', newMessageRef.key);

        // Cập nhật tin nhắn cuối cùng trong group conversation
        console.log('Updating group conversation lastMessage...');
        const groupConversationRef = ref(db, `groupConversations/${groupId}`);
        await update(groupConversationRef, {
          lastMessage: {
            text: message.text,
            senderId: message.senderId,
            timestamp: timestamp,
            images: message.images || [],
            hasAudio: !!message.audio,
            isReply: !!message.replyTo,
          },
          lastMessageId: newMessageRef.key,
          lastActivity: timestamp,
        });
        
        console.log('Group conversation updated successfully');

        // Cập nhật lastRead marker cho người gửi (đánh dấu đã đọc tin nhắn vừa gửi)
        if (currentUserId) {
          const lastReadRef = ref(
            db,
            `groupConversations/${groupId}/lastRead/${currentUserId}`
          );
          await set(lastReadRef, timestamp);
          console.log('Updated sender lastRead marker to:', timestamp);
        }

        // Với cơ chế lastRead marker, unread count sẽ được tự động tính toán
        // cho các thành viên khác dựa trên việc so sánh timestamp tin nhắn mới
        // với lastRead marker của họ. Không cần tăng unread count thủ công nữa.
        console.log('Group message sent - unread count will be auto-calculated for other members');

        console.log('=== SEND GROUP TEXT MESSAGE COMPLETED SUCCESSFULLY ===');
        return true;
      } catch (error) {
        console.error('=== SEND GROUP TEXT MESSAGE FAILED ===');
        console.error('Error sending group message:', error);
        return false;
      }
    },
    [groupId]
  );

  /**
   * Gửi tin nhắn có hình ảnh cho group
   */
  const sendGroupMessageWithImages = useCallback(
    async (text: string, files: File[]) => {
      if (!groupId) return false;

      try {
        const currentUserId = localStorage.getItem('user_id');
        if (!currentUserId) return false;

        // Tải lên các hình ảnh
        const imageUrls = await chatService.uploadMessageImages(files);

        // Gửi tin nhắn với các URL hình ảnh
        return await sendGroupTextMessage({
          senderId: currentUserId,
          text: text,
          images: imageUrls,
        });
      } catch (error) {
        console.error('Error sending group message with images:', error);
        return false;
      }
    },
    [groupId, sendGroupTextMessage]
  );

  /**
   * Gửi tin nhắn thoại cho group
   */
  const sendGroupAudioMessage = useCallback(
    async (audioFile: File, text: string = '') => {
      if (!groupId) return false;

      try {
        const currentUserId = localStorage.getItem('user_id');
        if (!currentUserId) return false;

        // Tải lên file âm thanh
        const audioData = await chatService.uploadAudioMessage(audioFile);

        // Gửi tin nhắn với URL âm thanh
        return await sendGroupTextMessage({
          senderId: currentUserId,
          text: text,
          audio: audioData,
        });
      } catch (error) {
        console.error('Error sending group audio message:', error);
        return false;
      }
    },
    [groupId, sendGroupTextMessage]
  );

  /**
   * Gửi tin nhắn trả lời cho group
   */
  const sendGroupReplyMessage = useCallback(
    async (
      text: string,
      replyTo: { messageId: string; text: string; senderId: string }
    ) => {
      if (!groupId) return false;

      try {
        const currentUserId = localStorage.getItem('user_id');
        if (!currentUserId) return false;

        // Gửi tin nhắn trả lời
        return await sendGroupTextMessage({
          senderId: currentUserId,
          text: text,
          replyTo: replyTo,
        });
      } catch (error) {
        console.error('Error sending group reply message:', error);
        return false;
      }
    },
    [groupId, sendGroupTextMessage]
  );

  /**
   * Gửi tin nhắn trả lời kèm hình ảnh cho group
   */
  const sendGroupReplyWithImages = useCallback(
    async (
      text: string,
      files: File[],
      replyTo: { messageId: string; text: string; senderId: string }
    ) => {
      if (!groupId) return false;

      try {
        const currentUserId = localStorage.getItem('user_id');
        if (!currentUserId) return false;

        // Tải lên các hình ảnh
        const imageUrls = await chatService.uploadMessageImages(files);

        // Gửi tin nhắn với các URL hình ảnh và thông tin trả lời
        return await sendGroupTextMessage({
          senderId: currentUserId,
          text: text,
          images: imageUrls,
          replyTo: replyTo,
        });
      } catch (error) {
        console.error('Error sending group reply with images:', error);
        return false;
      }
    },
    [groupId, sendGroupTextMessage]
  );

  return {
    sendGroupTextMessage,
    sendGroupMessageWithImages,
    sendGroupAudioMessage,
    sendGroupReplyMessage,
    sendGroupReplyWithImages,
  };
}