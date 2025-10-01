import { useCallback, useState } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../../firebase';
import { MessageType } from '../../types/chat/MessageType';

/**
 * Hook để tìm kiếm tin nhắn trong group conversation
 */
export function useSearchGroupMessages() {
  const [searchResults, setSearchResults] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUserId = localStorage.getItem('user_id') || '';

  // Tìm kiếm tin nhắn theo từ khóa trong group conversation cụ thể
  const searchMessages = useCallback(
    async (keyword: string, groupId: string) => {
      if (!keyword.trim() || !currentUserId || !groupId) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Searching in group:', groupId, 'with keyword:', keyword);
        
        // Kiểm tra xem user có thuộc group này không
        const groupRef = ref(db, `groupConversations/${groupId}`);
        const groupSnapshot = await get(groupRef);

        if (!groupSnapshot.exists()) {
          console.log('Group not found:', groupId);
          setSearchResults([]);
          setLoading(false);
          return;
        }

        const groupData = groupSnapshot.val();
        if (!groupData.members || !groupData.members[currentUserId]) {
          console.log('User not member of group:', groupId);
          setSearchResults([]);
          setLoading(false);
          return;
        }

        // Tìm kiếm tin nhắn trong group
        const messagesRef = ref(db, `messages/${groupId}`);
        const messagesSnapshot = await get(messagesRef);

        if (!messagesSnapshot.exists()) {
          console.log('No messages found in group:', groupId);
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
            message.text.toLowerCase().includes(keyword_lower)
          ) {
            results.push({
              id,
              conversationId: groupId, // Thêm conversationId để biết tin nhắn thuộc group nào
              ...message,
            });
          }
        });

        // Sắp xếp kết quả theo thời gian (mới nhất lên đầu)
        // Group messages sử dụng timestamp thay vì createdAt
        results.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        console.log('Search results found:', results.length);
        setSearchResults(results);
      } catch (err) {
        console.error('Error searching group messages:', err);
        setError('Không thể tìm kiếm tin nhắn trong nhóm');
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