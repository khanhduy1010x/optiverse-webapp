import { useCallback, useState } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../../firebase';
import { MessageType } from '../../types/chat/MessageType';

/**
 * Hook để tìm kiếm tin nhắn trong một cuộc trò chuyện cụ thể
 */
export function useSearchConversationMessages() {
  const [searchResults, setSearchResults] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUserId = localStorage.getItem('user_id') || '';

  // Tìm kiếm tin nhắn theo từ khóa trong cuộc trò chuyện cụ thể
  const searchMessages = useCallback(
    async (keyword: string, conversationId: string) => {
      if (!keyword.trim() || !currentUserId || !conversationId) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Searching in conversation:', conversationId, 'with keyword:', keyword);
        
        // Kiểm tra xem user có thuộc cuộc trò chuyện này không
        const conversationRef = ref(db, `conversations/${conversationId}`);
        const conversationSnapshot = await get(conversationRef);

        if (!conversationSnapshot.exists()) {
          console.log('Conversation not found:', conversationId);
          setSearchResults([]);
          setLoading(false);
          return;
        }

        const conversationData = conversationSnapshot.val();
        if (!conversationData.members || !conversationData.members[currentUserId]) {
          console.log('User not member of conversation:', conversationId);
          setSearchResults([]);
          setLoading(false);
          return;
        }

        // Tìm kiếm tin nhắn trong cuộc trò chuyện
        const messagesRef = ref(db, `messages/${conversationId}`);
        const messagesSnapshot = await get(messagesRef);

        if (!messagesSnapshot.exists()) {
          console.log('No messages found in conversation:', conversationId);
          setSearchResults([]);
          setLoading(false);
          return;
        }

        const messages = messagesSnapshot.val();
        const results: MessageType[] = [];
        const keyword_lower = keyword.toLowerCase();

        // Lọc tin nhắn chứa từ khóa
        Object.entries(messages).forEach(([id, message]: [string, any]) => {
          if (
            message.text &&
            message.text.toLowerCase().includes(keyword_lower) &&
            // Chỉ hiển thị tin nhắn không bị ẩn hoặc xóa với user hiện tại
            !message.hiddenBy?.includes(currentUserId) &&
            !message.deletedBy?.includes(currentUserId) &&
            message.status !== 'DELETED'
          ) {
            results.push({
              id,
              conversationId, // Thêm conversationId để biết tin nhắn thuộc cuộc trò chuyện nào
              ...message,
            });
          }
        });

        // Sắp xếp kết quả theo thời gian (mới nhất lên đầu)
        results.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        console.log('Search results found:', results.length);
        setSearchResults(results);
      } catch (err) {
        console.error('Error searching conversation messages:', err);
        setError('Không thể tìm kiếm tin nhắn trong cuộc trò chuyện');
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