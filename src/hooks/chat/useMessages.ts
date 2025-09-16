import { useEffect, useState } from 'react';
import {
  ref,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  query,
  orderByChild,
  limitToLast,
  DataSnapshot,
} from 'firebase/database';
import { db } from '../../firebase';
import { MessageType } from '../../types/chat/MessageType';

/**
 * Hook để lấy tin nhắn theo thời gian thực từ một hội thoại
 * @param conversationId ID của hội thoại
 * @param limit Số lượng tin nhắn tối đa cần lấy
 */
export function useMessages(conversationId: string, limit: number = 50) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
      console.log('useMessages: No conversationId provided');
      setLoading(false);
      return;
    }

    console.log('useMessages: Loading messages for conversation:', conversationId);
    setMessages([]);
    setLoading(true);

    // Tạo query để lấy tin nhắn, sắp xếp theo thời gian tạo và giới hạn số lượng
    const messagesRef = query(
      ref(db, `messages/${conversationId}`),
      orderByChild('createdAt'),
      limitToLast(limit)
    );

    // Thêm mới
    const unsubscribeAdded = onChildAdded(
      messagesRef,
      (snapshot: DataSnapshot) => {
        const message = { id: snapshot.key!, ...snapshot.val() } as MessageType;
        console.log('useMessages: New message added:', message);
        setMessages(prev => {
          if (prev.find(m => m.id === message.id)) return prev;
          const newMessages = [...prev, message];
          console.log('useMessages: Updated messages array:', newMessages);
          return newMessages;
        });
        setLoading(false);
      }
    );

    // Sửa đổi
    const unsubscribeChanged = onChildChanged(
      messagesRef,
      (snapshot: DataSnapshot) => {
        const message = { id: snapshot.key!, ...snapshot.val() } as MessageType;
        setMessages(prev => prev.map(m => (m.id === message.id ? message : m)));
      }
    );

    // Xóa
    const unsubscribeRemoved = onChildRemoved(
      messagesRef,
      (snapshot: DataSnapshot) => {
        setMessages(prev => prev.filter(m => m.id !== snapshot.key));
      }
    );

    // Clean up khi component unmount hoặc conversationId thay đổi
    return () => {
      unsubscribeAdded();
      unsubscribeChanged();
      unsubscribeRemoved();
    };
  }, [conversationId, limit]);

  return { messages, loading };
}
