import { useEffect, useState, useCallback } from 'react';
import {
  ref,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  query,
  orderByKey,
  limitToLast,
  endBefore,
  DataSnapshot,
  get,
  off,
} from 'firebase/database';
import { db } from '../../firebase';
import { MessageType } from '../../types/chat/MessageType';

interface UseMessagesOptions {
  initialLimit?: number;
  loadMoreLimit?: number;
  enablePagination?: boolean;
}

interface UseMessagesReturn {
  messages: MessageType[];
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  loadMoreMessages: () => Promise<void>;
}

/**
 * Hook để lấy tin nhắn theo thời gian thực từ một hội thoại với pagination
 * Sử dụng orderByKey() thay vì orderByChild('createdAt') để:
 * - Tránh Firebase Index error
 * - Tăng performance (orderByKey() nhanh hơn orderByChild())
 * - Key của Firebase push() được tạo theo thời gian, đảm bảo thứ tự chronological
 * @param conversationId ID của hội thoại
 * @param options Tùy chọn pagination
 */
export function useMessages(
  conversationId: string, 
  options: UseMessagesOptions = {}
): UseMessagesReturn {
  const { 
    initialLimit = 10, 
    loadMoreLimit = 10, 
    enablePagination = true 
  } = options;

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Kiểm tra thời điểm xóa conversation của user hiện tại
  const checkDeletionTimestamp = useCallback(async () => {
    const currentUserId = localStorage.getItem('user_id');
    if (!currentUserId) return null;

    try {
      const conversationRef = ref(db, `conversations/${conversationId}`);
      const snapshot = await get(conversationRef);
      
      if (snapshot.exists()) {
        const conversation = snapshot.val();
        // Sử dụng messagesDeletedAt thay vì deletedBy để filter tin nhắn
        const deletedMessagesTimestamp = conversation.messagesDeletedAt?.[currentUserId];
        return deletedMessagesTimestamp || null;
      }
    } catch (error) {
      console.error('Error checking deletion timestamp:', error);
    }
    return null;
  }, [conversationId]);

  // Hàm kiểm tra xem tin nhắn có nên được hiển thị không
  const shouldShowMessage = useCallback((message: MessageType, deletionTimestamp: number | null): boolean => {
    if (!deletionTimestamp || !message.createdAt) return true;
    return message.createdAt >= deletionTimestamp;
  }, []);

  // Load more messages function
  const loadMoreMessages = useCallback(async () => {
    if (!enablePagination || loadingMore || !hasMore || !cursor) {
      console.log('🚫 [LAZY LOADING] Skipped - enablePagination:', enablePagination, 'loadingMore:', loadingMore, 'hasMore:', hasMore, 'cursor:', cursor);
      return;
    }

    console.log('🔄 [LAZY LOADING] Starting to load more messages...', {
      conversationId,
      cursor,
      loadMoreLimit
    });

    setLoadingMore(true);
    
    try {
      const deletionTimestamp = await checkDeletionTimestamp();
      
      // Query với cursor để lấy tin nhắn cũ hơn
      const messagesRef = query(
        ref(db, `messages/${conversationId}`),
        orderByKey(),
        endBefore(cursor),
        limitToLast(loadMoreLimit)
      );

      const snapshot = await get(messagesRef);
      
      if (snapshot.exists()) {
        const newMessages: MessageType[] = [];
        const messageKeys: string[] = [];
        
        snapshot.forEach((childSnapshot) => {
          const message = { id: childSnapshot.key!, ...childSnapshot.val() } as MessageType;
          if (shouldShowMessage(message, deletionTimestamp)) {
            newMessages.push(message);
            messageKeys.push(childSnapshot.key!);
          }
        });

        if (newMessages.length > 0) {
          console.log('✅ [LAZY LOADING] Loaded', newMessages.length, 'older messages');
          // Prepend new messages to existing array
          setMessages(prev => {
            const totalMessages = newMessages.length + prev.length;
            console.log('📊 [LAZY LOADING] Total messages after load:', totalMessages);
            return [...newMessages, ...prev];
          });
          // Update cursor to the oldest message key
          setCursor(messageKeys[0]);
          console.log('🔄 [LAZY LOADING] Updated cursor to:', messageKeys[0]);
        }

        // Check if there are more messages
        if (newMessages.length < loadMoreLimit) {
          setHasMore(false);
          console.log('🏁 [LAZY LOADING] No more messages to load');
        }
      } else {
        setHasMore(false);
        console.log('🏁 [LAZY LOADING] No more messages found');
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [conversationId, cursor, loadMoreLimit, hasMore, loadingMore, enablePagination, checkDeletionTimestamp, shouldShowMessage]);

  useEffect(() => {
    if (!conversationId) {
      console.log('🚫 [INITIAL LOAD] No conversationId provided');
      setLoading(false);
      return;
    }

    console.log('🚀 [OPTIMIZATION] Starting 100% optimized message loading for conversation:', conversationId);
    console.log('📍 [OPTIMIZATION] Firebase path:', `messages/${conversationId}`);
    console.log('⚙️ [OPTIMIZATION] Settings:', { 
      enablePagination, 
      initialLimit: enablePagination ? initialLimit : 50 
    });
    
    // Reset state when conversation changes
    setMessages([]);
    setLoading(true);
    setHasMore(true);
    setLoadingMore(false);
    setCursor(null);
    setIsInitialLoad(true);

    let deletionTimestamp: number | null = null;
    let unsubscribeAdded: (() => void) | null = null;
    let unsubscribeChanged: (() => void) | null = null;
    let unsubscribeRemoved: (() => void) | null = null;
    let latestMessageKey: string | null = null;

    // 🎯 OPTION 1: COMPLETELY SEPARATE APPROACH FOR 100% OPTIMIZATION
    
    // STEP 1: Load initial messages - ONE-TIME FETCH, NO LISTENERS
    const loadInitialMessages = async (): Promise<void> => {
      console.log('📥 [INITIAL] Step 1: Loading initial messages with get() - ZERO LISTENERS');
      
      deletionTimestamp = await checkDeletionTimestamp();
      
      const initialMessagesRef = query(
        ref(db, `messages/${conversationId}`),
        orderByKey(),
        limitToLast(enablePagination ? initialLimit : 50)
      );

      try {
        // Pure get() call - no listeners attached
        const snapshot = await get(initialMessagesRef);
        
        if (snapshot.exists()) {
          const initialMessages: MessageType[] = [];
          const messageKeys: string[] = [];
          
          snapshot.forEach((childSnapshot) => {
            const message = { id: childSnapshot.key!, ...childSnapshot.val() } as MessageType;
            if (shouldShowMessage(message, deletionTimestamp)) {
              initialMessages.push(message);
              messageKeys.push(childSnapshot.key!);
            }
          });

          if (initialMessages.length > 0) {
            console.log('✅ [INITIAL] Successfully loaded', initialMessages.length, 'initial messages');
            console.log('📊 [INITIAL] Message range:', {
              oldest: messageKeys[0],
              newest: messageKeys[messageKeys.length - 1]
            });
            
            // Set messages immediately
            setMessages(initialMessages);
            
            // Set pagination cursor
            if (enablePagination) {
              setCursor(messageKeys[0]);
              console.log('🔄 [INITIAL] Set pagination cursor to:', messageKeys[0]);
            }
            
            // Store latest message key for real-time setup
            latestMessageKey = messageKeys[messageKeys.length - 1];
            console.log('📌 [INITIAL] Latest message key stored:', latestMessageKey);
          }

          // Check pagination availability
          if (initialMessages.length < (enablePagination ? initialLimit : 50)) {
            setHasMore(false);
            console.log('🏁 [INITIAL] No more messages for pagination');
          } else {
            console.log('📄 [INITIAL] More messages available for lazy loading');
          }
        } else {
          console.log('📭 [INITIAL] No messages found');
          setHasMore(false);
        }
        
        setLoading(false);
        setIsInitialLoad(false);
        console.log('✅ [INITIAL] Initial load completed - NO LISTENERS ACTIVE YET');
        
        // STEP 2: Setup real-time listeners ONLY after initial load is complete
        setupRealTimeListeners();
        
      } catch (error) {
        console.error('❌ [INITIAL] Error loading initial messages:', error);
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    // STEP 2: Setup real-time listeners - ONLY AFTER initial load
    const setupRealTimeListeners = (): void => {
      console.log('🔄 [REAL-TIME] Step 2: Setting up real-time listeners AFTER initial load');
      console.log('📌 [REAL-TIME] Will only process messages newer than:', latestMessageKey);
      
      const messagesRef = ref(db, `messages/${conversationId}`);
      
      // Listen for NEW messages only
      unsubscribeAdded = onChildAdded(
        messagesRef,
        (snapshot: DataSnapshot) => {
          const messageKey = snapshot.key!;
          const message = { id: messageKey, ...snapshot.val() } as MessageType;
          
          // CRITICAL: Only process messages newer than our latest loaded message
          if (!latestMessageKey || messageKey > latestMessageKey) {
            console.log('🆕 [REAL-TIME] New message detected:', {
              messageId: messageKey,
              content: message.content?.substring(0, 30) + '...',
              timestamp: message.timestamp
            });
            
            if (shouldShowMessage(message, deletionTimestamp)) {
              setMessages(prev => {
                // Prevent duplicates
                if (prev.find(m => m.id === message.id)) {
                  console.log('⚠️ [REAL-TIME] Duplicate prevented:', messageKey);
                  return prev;
                }
                console.log('✅ [REAL-TIME] Adding new message to UI');
                return [...prev, message];
              });
              
              // Update latest message key
              latestMessageKey = messageKey;
              console.log('📌 [REAL-TIME] Updated latest key to:', latestMessageKey);
            } else {
              console.log('🚫 [REAL-TIME] Message filtered (deletion):', messageKey);
            }
          } else {
            console.log('🔇 [REAL-TIME] Ignoring old message:', messageKey, 'vs latest:', latestMessageKey);
          }
        }
      );

      // Listen for message updates
      unsubscribeChanged = onChildChanged(
        messagesRef,
        (snapshot: DataSnapshot) => {
          const message = { id: snapshot.key!, ...snapshot.val() } as MessageType;
          console.log('📝 [REAL-TIME] Message updated:', snapshot.key);
          
          if (shouldShowMessage(message, deletionTimestamp)) {
            setMessages(prev => prev.map(m => m.id === message.id ? message : m));
            console.log('✅ [REAL-TIME] Message update applied');
          } else {
            console.log('🚫 [REAL-TIME] Updated message filtered (deletion)');
            setMessages(prev => prev.filter(m => m.id !== message.id));
          }
        }
      );

      // Listen for message removals
      unsubscribeRemoved = onChildRemoved(
        messagesRef,
        (snapshot: DataSnapshot) => {
          console.log('🗑️ [REAL-TIME] Message removed:', snapshot.key);
          setMessages(prev => {
            const filtered = prev.filter(m => m.id !== snapshot.key);
            console.log('✅ [REAL-TIME] Message removed from UI, remaining:', filtered.length);
            return filtered;
          });
        }
      );

      console.log('👂 [REAL-TIME] All listeners setup completed');
    };

    // Start the completely separated process
    loadInitialMessages();

    // Cleanup function
    return () => {
      console.log('🧹 [CLEANUP] Removing all listeners for conversation:', conversationId);
      if (unsubscribeAdded) {
        unsubscribeAdded();
        console.log('🧹 [CLEANUP] onChildAdded listener removed');
      }
      if (unsubscribeChanged) {
        unsubscribeChanged();
        console.log('🧹 [CLEANUP] onChildChanged listener removed');
      }
      if (unsubscribeRemoved) {
        unsubscribeRemoved();
        console.log('🧹 [CLEANUP] onChildRemoved listener removed');
      }
    };
  }, [conversationId, enablePagination, initialLimit, checkDeletionTimestamp, shouldShowMessage]);

  return { 
    messages, 
    loading, 
    hasMore, 
    loadingMore, 
    loadMoreMessages 
  };
}
