import { useEffect, useState, useRef } from 'react';
import {
  ref,
  onChildAdded,
  query,
  orderByKey,
  limitToLast,
  off,
} from 'firebase/database';
import { db } from '../../firebase';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import chatService from '../../services/chat.service';
import friendService from '../../services/friend.service';

// Khóa lưu trong localStorage
const NOTIFIED_MESSAGES_KEY = 'chat_notified_messages';

/**
 * Hook để lắng nghe tin nhắn mới và hiển thị thông báo
 * Chỉ hiển thị thông báo khi người dùng không ở trang chat
 */
export function useNewMessageNotification() {
  // Sử dụng useRef để tránh đăng ký nhiều listener
  const listenersRef = useRef<Record<string, boolean>>({});
  const [userCache, setUserCache] = useState<
    Record<string, { name: string; avatar?: string }>
  >({});
  const location = useLocation();
  const currentUserId = localStorage.getItem('user_id') || '';
  const isOnChatPage = location.pathname === '/chat';

  // Lấy danh sách các tin nhắn đã thông báo từ localStorage
  const getNotifiedMessages = (): Record<string, string> => {
    try {
      const saved = localStorage.getItem(NOTIFIED_MESSAGES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error('Lỗi khi đọc tin nhắn đã thông báo:', e);
      return {};
    }
  };

  // Lưu danh sách các tin nhắn đã thông báo vào localStorage
  const saveNotifiedMessage = (conversationId: string, messageId: string) => {
    try {
      const notifiedMessages = getNotifiedMessages();
      notifiedMessages[conversationId] = messageId;

      // Giới hạn số lượng tin nhắn lưu trữ
      const limitedMessages: Record<string, string> = {};
      const keys = Object.keys(notifiedMessages);

      // Chỉ lưu 50 hội thoại gần nhất
      if (keys.length > 50) {
        keys.slice(-50).forEach(key => {
          limitedMessages[key] = notifiedMessages[key];
        });
      } else {
        Object.assign(limitedMessages, notifiedMessages);
      }

      localStorage.setItem(
        NOTIFIED_MESSAGES_KEY,
        JSON.stringify(limitedMessages)
      );
    } catch (e) {
      console.error('Lỗi khi lưu tin nhắn đã thông báo:', e);
    }
  };

  // Hàm lấy thông tin người dùng
  const getUserInfo = async (userId: string) => {
    // Nếu đã có trong cache thì trả về luôn
    if (userCache[userId]) {
      return userCache[userId];
    }

    try {
      // Thử tìm trong danh sách bạn bè
      const friends = await friendService.viewAllFriends();
      const friend = friends.find(f => f.friend_id === userId);

      if (friend && friend.friendInfo) {
        const userInfo = {
          name:
            friend.friendInfo.full_name || friend.friendInfo.email || userId,
          avatar: friend.friendInfo.avatar_url,
        };

        // Cập nhật cache
        setUserCache(prev => ({
          ...prev,
          [userId]: userInfo,
        }));

        return userInfo;
      }

      // Nếu không tìm thấy trong danh sách bạn bè, gọi API lấy thông tin
      const users = await chatService.getUsersByIds([userId]);
      if (users.length > 0) {
        const user = users[0];
        const userInfo = {
          name: user.full_name || user.email || userId,
          avatar: user.avatar_url,
        };

        // Cập nhật cache
        setUserCache(prev => ({
          ...prev,
          [userId]: userInfo,
        }));

        return userInfo;
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
    }

    // Trả về ID nếu không tìm thấy thông tin
    return { name: userId };
  };

  useEffect(() => {
    if (!currentUserId || isOnChatPage) return;

    // Danh sách các unsubscribe functions
    const unsubscribes: (() => void)[] = [];

    // Lấy danh sách tin nhắn đã thông báo
    const notifiedMessages = getNotifiedMessages();

    // Lấy danh sách hội thoại của người dùng hiện tại
    const conversationsRef = ref(db, 'conversations');

    const unsubscribeConversation = onChildAdded(
      conversationsRef,
      async snapshot => {
        const conversation = snapshot.val();
        const conversationId = snapshot.key;

        // Kiểm tra xem người dùng hiện tại có trong hội thoại không
        if (
          !conversation?.members ||
          !conversation.members[currentUserId] ||
          !conversationId ||
          listenersRef.current[conversationId]
        ) {
          return;
        }

        // Đánh dấu đã đăng ký listener cho hội thoại này
        listenersRef.current[conversationId] = true;

        // Lắng nghe tin nhắn mới trong hội thoại này
        // Sử dụng orderByKey() thay vì orderByChild('createdAt') để tránh Firebase Index error
        const messagesRef = query(
          ref(db, `messages/${conversationId}`),
          orderByKey(),
          limitToLast(1)
        );

        const unsubscribeMessage = onChildAdded(
          messagesRef,
          async messageSnapshot => {
            const message = messageSnapshot.val();
            const messageId = messageSnapshot.key;

            // Kiểm tra xem tin nhắn này đã được thông báo chưa
            if (
              message &&
              messageId &&
              message.senderId !== currentUserId &&
              notifiedMessages[conversationId] !== messageId
            ) {
              // Lấy thông tin người gửi
              const sender = await getUserInfo(message.senderId);

              // Hiển thị thông báo
              toast.info(`${sender.name}: ${message.text}`, {
                autoClose: 3000,
                position: 'top-right',
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                onClick: () => {
                  window.location.href = '/chat';
                },
              });

              // Lưu thông tin tin nhắn đã thông báo
              saveNotifiedMessage(conversationId, messageId);
            }
          }
        );

        unsubscribes.push(unsubscribeMessage);
      }
    );

    unsubscribes.push(unsubscribeConversation);

    // Hủy đăng ký tất cả listeners khi component unmount
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
      listenersRef.current = {};
    };
  }, [currentUserId, isOnChatPage, userCache]);
}
