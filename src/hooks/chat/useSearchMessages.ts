import { useCallback, useState } from 'react';
import { ref, get, query, orderByChild } from 'firebase/database';
import { db } from '../../firebase';
import { MessageType } from '../../types/chat/MessageType';

/**
 * Hook để tìm kiếm tin nhắn trong các hội thoại
 */
export function useSearchMessages() {
  const [searchResults, setSearchResults] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUserId = localStorage.getItem('user_id') || '';

  // Tìm kiếm tin nhắn theo từ khóa
  const searchMessages = useCallback(
    async (keyword: string) => {
      if (!keyword.trim() || !currentUserId) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Lấy danh sách hội thoại của người dùng
        const conversationsRef = ref(db, 'conversations');
        const conversationsSnapshot = await get(conversationsRef);

        if (!conversationsSnapshot.exists()) {
          setSearchResults([]);
          setLoading(false);
          return;
        }

        const conversations = conversationsSnapshot.val();
        const userConversationIds: string[] = [];

        // Lọc các hội thoại mà người dùng tham gia
        Object.entries(conversations).forEach(([id, conv]: [string, any]) => {
          if (conv.members && conv.members[currentUserId]) {
            userConversationIds.push(id);
          }
        });

        // Nếu không có hội thoại nào, trả về kết quả trống
        if (userConversationIds.length === 0) {
          setSearchResults([]);
          setLoading(false);
          return;
        }

        // Tìm kiếm tin nhắn trong từng hội thoại
        const results: MessageType[] = [];
        const keyword_lower = keyword.toLowerCase();

        for (const conversationId of userConversationIds) {
          const messagesRef = ref(db, `messages/${conversationId}`);
          const messagesSnapshot = await get(messagesRef);

          if (messagesSnapshot.exists()) {
            const messages = messagesSnapshot.val();

            // Lọc tin nhắn chứa từ khóa
            Object.entries(messages).forEach(([id, message]: [string, any]) => {
              if (
                message.text &&
                message.text.toLowerCase().includes(keyword_lower)
              ) {
                results.push({
                  id,
                  conversationId, // Thêm conversationId để biết tin nhắn thuộc hội thoại nào
                  ...message,
                });
              }
            });
          }
        }

        // Sắp xếp kết quả theo thời gian (mới nhất lên đầu)
        results.sort((a, b) => b.createdAt - a.createdAt);

        setSearchResults(results);
      } catch (err) {
        console.error('Error searching messages:', err);
        setError('Không thể tìm kiếm tin nhắn');
      } finally {
        setLoading(false);
      }
    },
    [currentUserId]
  );

  // Xóa kết quả tìm kiếm
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setError(null);
  }, []);

  return {
    searchResults,
    loading,
    error,
    searchMessages,
    clearSearch,
  };
}
