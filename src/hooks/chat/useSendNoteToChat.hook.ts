import { useCallback } from 'react';
import { ref, push, update, get, set } from 'firebase/database';
import { db } from '../../firebase';
import { toast } from 'react-toastify';

export const useSendNoteToChat = () => {
  const sendNoteToChat = useCallback(
    async (
      friendId: string,
      noteTitle: string,
      noteContent: string,
      showToast = true
    ) => {
      try {
        const currentUserId = localStorage.getItem('user_id');
        if (!currentUserId) {
          if (showToast) toast.error('User not logged in');
          return false;
        }

        // Tìm conversation hiện có hoặc tạo mới
        const conversationsRef = ref(db, 'conversations');
        const conversationsSnapshot = await get(conversationsRef);

        let conversationId: string | null = null;

        if (conversationsSnapshot.exists()) {
          const conversations = conversationsSnapshot.val();
          // Tìm conversation giữa 2 người dùng
          for (const [id, conv] of Object.entries(conversations)) {
            const convData = conv as any;
            if (
              convData.members &&
              convData.members[currentUserId] &&
              convData.members[friendId] &&
              Object.keys(convData.members).length === 2
            ) {
              conversationId = id;
              break;
            }
          }
        }

        // Nếu chưa có conversation, tạo mới
        if (!conversationId) {
          const newConversationRef = push(conversationsRef);
          conversationId = newConversationRef.key;

          await set(newConversationRef, {
            members: {
              [currentUserId]: true,
              [friendId]: true,
            },
            createdAt: Date.now(),
          });
        }

        if (!conversationId) {
          if (showToast) toast.error('Could not create conversation');
          return false;
        }

        // Tạo nội dung tin nhắn với note
        const messageText = `📝 **${noteTitle}**\n\n${noteContent}`;

        // Gửi tin nhắn
        const messagesRef = ref(db, `messages/${conversationId}`);
        const timestamp = Date.now();

        const newMessageRef = push(messagesRef, {
          senderId: currentUserId,
          text: messageText,
          createdAt: timestamp,
        });

        // Cập nhật tin nhắn cuối cùng trong conversation
        const conversationRef = ref(db, `conversations/${conversationId}`);
        await update(conversationRef, {
          lastMessage: {
            text: messageText,
            senderId: currentUserId,
            createdAt: timestamp,
          },
          lastMessageId: newMessageRef.key,
        });

        // Đánh dấu đã đọc cho người gửi
        const selfUnreadCountRef = ref(
          db,
          `unreadCount/${conversationId}/${currentUserId}`
        );
        set(selfUnreadCountRef, 0);

        // Tăng số tin nhắn chưa đọc cho người nhận
        const unreadCountRef = ref(
          db,
          `unreadCount/${conversationId}/${friendId}`
        );
        const unreadSnapshot = await get(unreadCountRef);
        const currentCount = unreadSnapshot.val() || 0;
        set(unreadCountRef, currentCount + 1);

        if (showToast) toast.success('Note sent successfully!');
        return true;
      } catch (error) {
        console.error('Error sending note:', error);
        if (showToast) toast.error('An error occurred while sending the note');
        return false;
      }
    },
    []
  );

  return { sendNoteToChat };
};
