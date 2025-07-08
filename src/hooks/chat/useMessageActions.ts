import { useCallback, useState } from 'react';
import { ref, update, get, set, remove } from 'firebase/database';
import { db } from '../../firebase';
import { toast } from 'react-toastify';
import {
  ReactionType,
  MessageStatus,
  MessageType,
} from '../../types/chat/MessageType';

/**
 * Hook để quản lý các hành động với tin nhắn: reactions, xóa tin nhắn, ẩn tin nhắn
 * @param conversationId ID của hội thoại
 */
export function useMessageActions(conversationId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUserId = localStorage.getItem('user_id') || '';

  // Thêm reaction vào tin nhắn
  const addReaction = useCallback(
    async (messageId: string, reactionType: ReactionType) => {
      if (!conversationId || !messageId || !currentUserId) return false;
      try {
        setLoading(true);
        const messageRef = ref(db, `messages/${conversationId}/${messageId}`);
        const snapshot = await get(messageRef);
        if (!snapshot.exists()) {
          setError('Không tìm thấy tin nhắn');
          return false;
        }
        const message = snapshot.val() as MessageType;
        const reactions: Record<
          string,
          Record<string, number>
        > = migrateReactions(message.reactions) || {};
        if (!reactions[currentUserId]) reactions[currentUserId] = {};
        if (!reactions[currentUserId][reactionType as string])
          reactions[currentUserId][reactionType as string] = 0;
        reactions[currentUserId][reactionType as string] += 1;
        const status = message.status || MessageStatus.VISIBLE;
        await update(messageRef, { reactions, status });
        return true;
      } catch (err) {
        console.error('Error adding reaction:', err);
        setError('Không thể thêm reaction');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [conversationId, currentUserId]
  );

  // Xóa reaction khỏi tin nhắn
  const removeReaction = useCallback(
    async (messageId: string, reactionType?: ReactionType) => {
      if (!conversationId || !messageId || !currentUserId) return false;
      try {
        setLoading(true);
        const messageRef = ref(db, `messages/${conversationId}/${messageId}`);
        const snapshot = await get(messageRef);
        if (!snapshot.exists()) {
          setError('Không tìm thấy tin nhắn');
          return false;
        }
        const message = snapshot.val() as MessageType;
        const reactions: Record<
          string,
          Record<string, number>
        > = migrateReactions(message.reactions) || {};
        if (reactionType) {
          if (
            reactions[currentUserId] &&
            reactions[currentUserId][reactionType as string]
          ) {
            reactions[currentUserId][reactionType as string] -= 1;
            if (reactions[currentUserId][reactionType as string] <= 0) {
              delete reactions[currentUserId][reactionType as string];
            }
            if (Object.keys(reactions[currentUserId]).length === 0) {
              delete reactions[currentUserId];
            }
          }
        } else {
          // Xóa toàn bộ reaction của user
          delete reactions[currentUserId];
        }
        const status = message.status || MessageStatus.VISIBLE;
        await update(messageRef, { reactions, status });
        return true;
      } catch (err) {
        console.error('Error removing reaction:', err);
        setError('Không thể xóa reaction');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [conversationId, currentUserId]
  );

  // Đánh dấu tin nhắn đã xem
  const markMessageAsRead = useCallback(
    async (messageId: string) => {
      if (!conversationId || !messageId || !currentUserId) return false;

      try {
        // Lấy tin nhắn hiện tại
        const messageRef = ref(db, `messages/${conversationId}/${messageId}`);
        const snapshot = await get(messageRef);

        if (!snapshot.exists()) {
          return false;
        }

        const message = snapshot.val() as MessageType;

        // Cập nhật readBy
        const readBy = message.readBy || {};
        readBy[currentUserId] = true;

        // Đảm bảo trạng thái tin nhắn được định nghĩa
        const status = message.status || MessageStatus.VISIBLE;

        // Cập nhật tin nhắn
        await update(messageRef, {
          readBy,
          status,
        });

        return true;
      } catch (err) {
        console.error('Error marking message as read:', err);
        return false;
      }
    },
    [conversationId, currentUserId]
  );

  // Đánh dấu tất cả tin nhắn trong hội thoại đã xem
  const markAllMessagesAsRead = useCallback(async () => {
    if (!conversationId || !currentUserId) return false;

    try {
      setLoading(true);

      // Lấy tất cả tin nhắn trong hội thoại
      const messagesRef = ref(db, `messages/${conversationId}`);
      const snapshot = await get(messagesRef);

      if (!snapshot.exists()) return true;

      const updates: { [path: string]: any } = {};

      // Đánh dấu từng tin nhắn là đã đọc
      snapshot.forEach(childSnapshot => {
        const messageId = childSnapshot.key;
        if (messageId) {
          const message = childSnapshot.val() as MessageType;
          const readBy = message.readBy || {};
          readBy[currentUserId] = true;

          // Đảm bảo trạng thái tin nhắn được định nghĩa
          const status = message.status || MessageStatus.VISIBLE;

          updates[`messages/${conversationId}/${messageId}/readBy`] = readBy;
          updates[`messages/${conversationId}/${messageId}/status`] = status;
        }
      });

      // Cập nhật hàng loạt
      if (Object.keys(updates).length > 0) {
        await update(ref(db), updates);
      }

      // Đặt lại số tin nhắn chưa đọc về 0
      const unreadCountRef = ref(
        db,
        `unreadCount/${conversationId}/${currentUserId}`
      );
      await set(unreadCountRef, 0);

      return true;
    } catch (err) {
      console.error('Error marking all messages as read:', err);
      setError('Không thể đánh dấu tin nhắn đã đọc');
      return false;
    } finally {
      setLoading(false);
    }
  }, [conversationId, currentUserId]);

  // Xóa tin nhắn
  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!conversationId || !messageId || !currentUserId) return false;

      try {
        setLoading(true);

        // Lấy tin nhắn hiện tại
        const messageRef = ref(db, `messages/${conversationId}/${messageId}`);
        const snapshot = await get(messageRef);

        if (!snapshot.exists()) {
          setError('Không tìm thấy tin nhắn');
          return false;
        }

        const message = snapshot.val() as MessageType;

        // Cập nhật deletedBy
        const deletedBy = message.deletedBy || [];
        if (!deletedBy.includes(currentUserId)) {
          deletedBy.push(currentUserId);
        }

        // Nếu người gửi là người hiện tại, cập nhật trạng thái tin nhắn thành DELETED
        let status = message.status || MessageStatus.VISIBLE;
        if (message.senderId === currentUserId) {
          status = MessageStatus.DELETED;
        }

        // Cập nhật tin nhắn
        await update(messageRef, {
          deletedBy,
          status,
        });

        // Sau khi update message trong deleteMessage:
        const conversationRef = ref(db, `conversations/${conversationId}`);
        const conversationSnap = await get(conversationRef);
        if (conversationSnap.exists()) {
          const conversation = conversationSnap.val();
          if (conversation.lastMessageId === messageId) {
            // Cập nhật lastMessage là trạng thái đã xóa
            await update(conversationRef, {
              lastMessage: {
                text: '',
                senderId: message.senderId,
                createdAt: message.createdAt,
                deleted: true,
              },
              lastMessageId: messageId,
            });
          }
        }

        return true;
      } catch (err) {
        console.error('Error deleting message:', err);
        setError('Không thể xóa tin nhắn');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [conversationId, currentUserId]
  );

  // Ẩn tin nhắn
  const hideMessage = useCallback(
    async (messageId: string) => {
      if (!conversationId || !messageId || !currentUserId) return false;

      try {
        setLoading(true);

        // Lấy tin nhắn hiện tại
        const messageRef = ref(db, `messages/${conversationId}/${messageId}`);
        const snapshot = await get(messageRef);

        if (!snapshot.exists()) {
          setError('Không tìm thấy tin nhắn');
          return false;
        }

        const message = snapshot.val() as MessageType;

        // Cập nhật hiddenBy
        const hiddenBy = message.hiddenBy || [];
        if (!hiddenBy.includes(currentUserId)) {
          hiddenBy.push(currentUserId);
        }

        // Nếu người gửi là người hiện tại, cập nhật trạng thái tin nhắn thành HIDDEN
        let status = message.status || MessageStatus.VISIBLE;
        if (message.senderId === currentUserId) {
          status = MessageStatus.HIDDEN;
        }

        // Cập nhật tin nhắn
        await update(messageRef, {
          hiddenBy,
          status,
        });

        // Sau khi update message trong hideMessage:
        const conversationRef2 = ref(db, `conversations/${conversationId}`);
        const conversationSnap2 = await get(conversationRef2);
        if (conversationSnap2.exists()) {
          const conversation = conversationSnap2.val();
          if (conversation.lastMessageId === messageId) {
            // Cập nhật lastMessage: chỉ thêm hiddenBy, không set hidden:true toàn cục
            await update(conversationRef2, {
              lastMessage: {
                text: message.text,
                senderId: message.senderId,
                createdAt: message.createdAt,
                images: message.images || [],
                hasAudio: !!message.audio,
                isReply: !!message.replyTo,
                hiddenBy: message.hiddenBy
                  ? Array.from(new Set([...message.hiddenBy, currentUserId]))
                  : [currentUserId],
              },
              lastMessageId: messageId,
            });
          }
        }

        return true;
      } catch (err) {
        console.error('Error hiding message:', err);
        setError('Không thể ẩn tin nhắn');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [conversationId, currentUserId]
  );

  // Hiện lại tin nhắn đã ẩn
  const unhideMessage = useCallback(
    async (messageId: string) => {
      if (!conversationId || !messageId || !currentUserId) return false;

      try {
        setLoading(true);

        // Lấy tin nhắn hiện tại
        const messageRef = ref(db, `messages/${conversationId}/${messageId}`);
        const snapshot = await get(messageRef);

        if (!snapshot.exists()) {
          setError('Không tìm thấy tin nhắn');
          return false;
        }

        const message = snapshot.val() as MessageType;

        // Cập nhật hiddenBy
        let hiddenBy = message.hiddenBy || [];
        hiddenBy = hiddenBy.filter(id => id !== currentUserId);

        // Nếu người gửi là người hiện tại và không còn ai ẩn tin nhắn, cập nhật trạng thái tin nhắn thành VISIBLE
        let status = message.status || MessageStatus.VISIBLE;
        if (message.senderId === currentUserId && hiddenBy.length === 0) {
          status = MessageStatus.VISIBLE;
        }

        // Cập nhật tin nhắn
        await update(messageRef, {
          hiddenBy,
          status,
        });

        // Sau khi update message trong unhideMessage:
        const conversationRef3 = ref(db, `conversations/${conversationId}`);
        const conversationSnap3 = await get(conversationRef3);
        if (conversationSnap3.exists()) {
          const conversation = conversationSnap3.val();
          if (conversation.lastMessageId === messageId) {
            // Cập nhật lastMessage: xóa currentUserId khỏi hiddenBy
            let newHiddenBy = Array.isArray(message.hiddenBy)
              ? message.hiddenBy.filter((id: string) => id !== currentUserId)
              : [];
            const lastMessageUpdate: any = {
              text: message.text,
              senderId: message.senderId,
              createdAt: message.createdAt,
              images: message.images || [],
              hasAudio: !!message.audio,
              isReply: !!message.replyTo,
            };
            if (newHiddenBy.length > 0) {
              lastMessageUpdate.hiddenBy = newHiddenBy;
            }
            await update(conversationRef3, {
              lastMessage: lastMessageUpdate,
              lastMessageId: messageId,
            });
          }
        }

        return true;
      } catch (err) {
        console.error('Error unhiding message:', err);
        setError('Không thể hiện tin nhắn');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [conversationId, currentUserId]
  );

  // Kiểm tra xem tin nhắn có bị ẩn với người dùng hiện tại không
  const isMessageHidden = useCallback(
    (message: MessageType): boolean => {
      if (!message || !currentUserId) return false;

      // Kiểm tra nếu tin nhắn có trong danh sách hiddenBy
      return message.hiddenBy?.includes(currentUserId) || false;
    },
    [currentUserId]
  );

  // Kiểm tra xem tin nhắn có bị xóa với người dùng hiện tại không
  const isMessageDeleted = useCallback(
    (message: MessageType): boolean => {
      if (!message || !currentUserId) return false;

      // Kiểm tra nếu tin nhắn có trong danh sách deletedBy hoặc có trạng thái DELETED
      return (
        message.deletedBy?.includes(currentUserId) ||
        message.status === MessageStatus.DELETED ||
        false
      );
    },
    [currentUserId]
  );

  // Lấy reaction hiện tại của người dùng cho tin nhắn
  const getCurrentUserReaction = useCallback(
    (message: MessageType): ReactionType | null => {
      if (!message || !currentUserId) return null;

      // Lấy reaction của người dùng hiện tại
      return message.reactions?.[currentUserId] || null;
    },
    [currentUserId]
  );

  // Thêm hàm migrateReactions để chuyển đổi reactions kiểu cũ sang kiểu mới
  function migrateReactions(raw: any): Record<string, Record<string, number>> {
    if (!raw) return {};
    const migrated: Record<string, Record<string, number>> = {};
    Object.entries(raw).forEach(([userId, reacts]) => {
      if (typeof reacts === 'string') {
        // Kiểu cũ: userId: emoji string
        migrated[userId] = { [reacts]: 1 };
      } else if (typeof reacts === 'object' && reacts !== null) {
        migrated[userId] = { ...reacts };
      }
    });
    return migrated;
  }

  return {
    addReaction,
    removeReaction,
    markMessageAsRead,
    markAllMessagesAsRead,
    deleteMessage,
    hideMessage,
    unhideMessage,
    isMessageHidden,
    isMessageDeleted,
    getCurrentUserReaction,
    loading,
    error,
  };
}
