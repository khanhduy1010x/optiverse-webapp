import { useEffect, useState, useCallback } from "react";
import { 
  ref, 
  onValue, 
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  query, 
  orderByKey, 
  limitToLast, 
  endBefore, 
  get,
  DataSnapshot
} from "firebase/database";
import { db } from "../../firebase";
import { MessageType } from "../../types/chat/MessageType";

interface UseGroupMessagesOptions {
  initialLimit?: number;
  loadMoreLimit?: number;
  enablePagination?: boolean;
}

interface UseGroupMessagesReturn {
  messages: MessageType[];
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  loadMoreMessages: () => Promise<void>;
  getMessageById: (messageId: string) => MessageType | undefined;
}

export function useGroupMessages(
  groupId: string | null, 
  options: UseGroupMessagesOptions = {}
): UseGroupMessagesReturn {
  const { 
    initialLimit = 10, 
    loadMoreLimit = 10, 
    enablePagination = true 
  } = options;

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load more messages function
  const loadMoreMessages = useCallback(async () => {
    if (!enablePagination || loadingMore || !hasMore || !cursor || !groupId) {
      console.log('🚫 [GROUP LAZY LOADING] Skipped - enablePagination:', enablePagination, 'loadingMore:', loadingMore, 'hasMore:', hasMore, 'cursor:', cursor, 'groupId:', groupId);
      return;
    }

    console.log('🔄 [GROUP LAZY LOADING] Starting to load more group messages...', {
      groupId,
      cursor,
      loadMoreLimit
    });

    setLoadingMore(true);
    
    try {
      // Query với cursor để lấy tin nhắn cũ hơn
      const messagesRef = query(
        ref(db, `messages/${groupId}`),
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
          newMessages.push(message);
          messageKeys.push(childSnapshot.key!);
        });

        if (newMessages.length > 0) {
          console.log('✅ [GROUP LAZY LOADING] Loaded', newMessages.length, 'older group messages');
          
          // Sort by timestamp
          newMessages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
          
          // Prepend new messages to existing array
          setMessages(prev => {
            const totalMessages = newMessages.length + prev.length;
            console.log('📊 [GROUP LAZY LOADING] Total group messages after load:', totalMessages);
            return [...newMessages, ...prev];
          });
          // Update cursor to the oldest message key
          setCursor(messageKeys[0]);
          console.log('🔄 [GROUP LAZY LOADING] Updated cursor to:', messageKeys[0]);
        }

        // Check if there are more messages
        if (newMessages.length < loadMoreLimit) {
          setHasMore(false);
          console.log('🏁 [GROUP LAZY LOADING] No more group messages to load');
        }
      } else {
        setHasMore(false);
        console.log('🏁 [GROUP LAZY LOADING] No more group messages found');
      }
    } catch (error) {
      console.error('Error loading more group messages:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [groupId, cursor, loadMoreLimit, hasMore, loadingMore, enablePagination]);

  useEffect(() => {
    if (!groupId) {
      console.log('🚫 [GROUP INITIAL] No groupId provided');
      setLoading(false);
      return;
    }

    console.log('🚀 [GROUP OPTIMIZATION] Starting 100% optimized group message loading for:', groupId);
    console.log('📍 [GROUP OPTIMIZATION] Firebase path:', `messages/${groupId}`);
    console.log('⚙️ [GROUP OPTIMIZATION] Settings:', { 
      enablePagination, 
      initialLimit: enablePagination ? initialLimit : 100 
    });
    
    // Reset state when group changes
    setMessages([]);
    setLoading(true);
    setHasMore(true);
    setLoadingMore(false);
    setCursor(null);
    setIsInitialLoad(true);

    let unsubscribeAdded: (() => void) | null = null;
    let unsubscribeChanged: (() => void) | null = null;
    let unsubscribeRemoved: (() => void) | null = null;
    let latestMessageKey: string | null = null;

    // 🎯 OPTION 1: COMPLETELY SEPARATE APPROACH FOR 100% GROUP OPTIMIZATION
    
    // STEP 1: Load initial group messages - ONE-TIME FETCH, NO LISTENERS
    const loadInitialMessages = async (): Promise<void> => {
      console.log('📥 [GROUP INITIAL] Step 1: Loading initial group messages with get() - ZERO LISTENERS');
      
      const initialMessagesRef = query(
        ref(db, `messages/${groupId}`),
        orderByKey(),
        limitToLast(enablePagination ? initialLimit : 100)
      );

      try {
        // Pure get() call - no listeners attached
        const snapshot = await get(initialMessagesRef);
        
        if (snapshot.exists()) {
          const initialMessages: MessageType[] = [];
          const messageKeys: string[] = [];
          
          snapshot.forEach((childSnapshot) => {
            const message = { id: childSnapshot.key!, ...childSnapshot.val() } as MessageType;
            initialMessages.push(message);
            messageKeys.push(childSnapshot.key!);
          });

          if (initialMessages.length > 0) {
            console.log('✅ [GROUP INITIAL] Successfully loaded', initialMessages.length, 'initial group messages');
            console.log('📊 [GROUP INITIAL] Group message range:', {
              oldest: messageKeys[0],
              newest: messageKeys[messageKeys.length - 1]
            });
            
            // Sort by timestamp
            initialMessages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
            
            // Set messages immediately
            setMessages(initialMessages);
            
            // Set pagination cursor
            if (enablePagination) {
              setCursor(messageKeys[0]);
              console.log('🔄 [GROUP INITIAL] Set pagination cursor to:', messageKeys[0]);
            }
            
            // Store latest message key for real-time setup
            latestMessageKey = messageKeys[messageKeys.length - 1];
            console.log('📌 [GROUP INITIAL] Latest message key stored:', latestMessageKey);
          }

          // Check pagination availability
          if (initialMessages.length < (enablePagination ? initialLimit : 100)) {
            setHasMore(false);
            console.log('🏁 [GROUP INITIAL] No more group messages for pagination');
          } else {
            console.log('📄 [GROUP INITIAL] More group messages available for lazy loading');
          }
        } else {
          console.log('📭 [GROUP INITIAL] No messages found for group:', groupId);
          setHasMore(false);
        }
        
        setLoading(false);
        setIsInitialLoad(false);
        console.log('✅ [GROUP INITIAL] Initial group load completed - NO LISTENERS ACTIVE YET');
        
        // STEP 2: Setup real-time listeners ONLY after initial load is complete
        setupRealTimeListeners();
        
      } catch (error) {
        console.error('❌ [GROUP INITIAL] Error loading initial group messages:', error);
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    // STEP 2: Setup real-time listeners - ONLY AFTER initial load
    const setupRealTimeListeners = (): void => {
      console.log('🔄 [GROUP REAL-TIME] Step 2: Setting up group real-time listeners AFTER initial load');
      console.log('📌 [GROUP REAL-TIME] Will only process messages newer than:', latestMessageKey);
      
      const messagesRef = ref(db, `messages/${groupId}`);
      
      // Listen for NEW group messages only
      unsubscribeAdded = onChildAdded(
        messagesRef,
        (snapshot: DataSnapshot) => {
          const messageKey = snapshot.key!;
          const message = { id: messageKey, ...snapshot.val() } as MessageType;
          
          // CRITICAL: Only process messages newer than our latest loaded message
          if (!latestMessageKey || messageKey > latestMessageKey) {
            console.log('🆕 [GROUP REAL-TIME] New group message detected:', {
              messageId: messageKey,
              content: message.content?.substring(0, 30) + '...',
              timestamp: message.timestamp
            });
            
            setMessages(prev => {
              // Prevent duplicates
              if (prev.find(m => m.id === message.id)) {
                console.log('⚠️ [GROUP REAL-TIME] Duplicate prevented:', messageKey);
                return prev;
              }
              console.log('✅ [GROUP REAL-TIME] Adding new group message to UI');
              const updated = [...prev, message];
              // Sort by timestamp to maintain order
              return updated.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
            });
            
            // Update latest message key
            latestMessageKey = messageKey;
            console.log('📌 [GROUP REAL-TIME] Updated latest key to:', latestMessageKey);
          } else {
            console.log('🔇 [GROUP REAL-TIME] Ignoring old message:', messageKey, 'vs latest:', latestMessageKey);
          }
        }
      );

      // Listen for group message updates
      unsubscribeChanged = onChildChanged(
        messagesRef,
        (snapshot: DataSnapshot) => {
          const message = { id: snapshot.key!, ...snapshot.val() } as MessageType;
          console.log('📝 [GROUP REAL-TIME] Group message updated:', snapshot.key);
          
          setMessages(prev => {
            const updated = prev.map(m => m.id === message.id ? message : m);
            console.log('✅ [GROUP REAL-TIME] Group message update applied');
            // Sort by timestamp to maintain order
            return updated.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
          });
        }
      );

      // Listen for group message removals
      unsubscribeRemoved = onChildRemoved(
        messagesRef,
        (snapshot: DataSnapshot) => {
          console.log('🗑️ [GROUP REAL-TIME] Group message removed:', snapshot.key);
          setMessages(prev => {
            const filtered = prev.filter(m => m.id !== snapshot.key);
            console.log('✅ [GROUP REAL-TIME] Group message removed from UI, remaining:', filtered.length);
            return filtered;
          });
        }
      );

      console.log('👂 [GROUP REAL-TIME] All group listeners setup completed');
    };

    // Start the completely separated process
    loadInitialMessages();

    // Cleanup function
    return () => {
      console.log('🧹 [GROUP CLEANUP] Removing all group listeners for:', groupId);
      if (unsubscribeAdded) {
        unsubscribeAdded();
        console.log('🧹 [GROUP CLEANUP] onChildAdded listener removed');
      }
      if (unsubscribeChanged) {
        unsubscribeChanged();
        console.log('🧹 [GROUP CLEANUP] onChildChanged listener removed');
      }
      if (unsubscribeRemoved) {
        unsubscribeRemoved();
        console.log('🧹 [GROUP CLEANUP] onChildRemoved listener removed');
      }
    };
  }, [groupId, enablePagination, initialLimit]);

  const getMessageById = useCallback((messageId: string) => {
    return messages.find(msg => msg.id === messageId);
  }, [messages]);

  return {
    messages,
    loading,
    hasMore,
    loadingMore,
    loadMoreMessages,
    getMessageById
  };
}