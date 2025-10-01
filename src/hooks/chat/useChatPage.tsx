import React, { useState, useEffect, useRef, useCallback } from 'react';
import MessageItem from '../../pages/chat/MessageItem.screen';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConversation } from './useConversation';
import { useMessages } from './useMessages';
import { useSendMessage } from './useSendMessage';
import { useTypingStatus } from './useTypingStatus';
import { useUnreadCount } from './useUnreadCount';
import { useConversationTheme } from './useConversationTheme';
import { usePinConversation } from './usePinConversation';
import { usePinMessage } from './usePinMessage';
import { useSearchConversationMessages } from './useSearchConversationMessages';
import { useSearchMessages } from './useSearchMessages';
import { UserResponse } from '../../types/auth/auth.types';
import friendService from '../../services/friend.service';
import { Friend } from '../../types/friend/response/friend.response';
import { ref, get } from 'firebase/database';
import { db } from '../../firebase';
import { MessageType } from '../../types/chat/MessageType';
import { toast } from 'react-toastify';
import { useAppTranslate } from '../useAppTranslate';
import chatService from '../../services/chat.service';

interface LocationState {
  friendId?: string;
}

export interface UseChatPageReturn {
  // State
  activeConversationId: string | null;
  messageText: string;
  friends: Friend[];
  friendsLoading: boolean;
  searchQuery: string;
  filteredFriends: Friend[];
  uniqueFriends: Friend[];
  showFriendsList: boolean;
  showThemeSelector: boolean;
  showEmojiPicker: boolean;
  messageSearchQuery: string;
  showMessageSearch: boolean;
  showPinnedMessages: boolean;
  globalSearchQuery: string;
  globalSearchResults: MessageType[];
  isGlobalSearching: boolean;
  showGlobalSearch: boolean;
  selectedImages: File[];
  shouldScrollToBottom: boolean;
  isScrolledUp: boolean;
  replyToMessage: MessageType | null;
  highlightedMessageId: string | null;
  showDeleteModal: boolean;
  selectedConversation: any;

  // Pagination state
  hasMore: boolean;
  loadingMore: boolean;

  // Refs
  fileInputRef: React.RefObject<HTMLInputElement>;
  messageContainerRef: React.RefObject<HTMLDivElement>;
  messageInputRef: React.RefObject<HTMLInputElement>;
  searchContainerRef: React.RefObject<HTMLDivElement>;
  emojiPickerRef: React.RefObject<HTMLDivElement>;
  messageRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;

  // Hooks data
  conversations: any[];
  users: Record<string, UserResponse>;
  loading: boolean;
  messages: MessageType[];
  messagesLoading: boolean;
  theme: any;
  isTyping: boolean;
  unreadCount: number;
  pinnedConversations: any[];
  pinnedMessages: MessageType[];
  searchResults: MessageType[];
  searchLoading: boolean;
  searchError: string | null;

  // Handlers
  setActiveConversationId: (id: string | null) => void;
  setMessageText: (text: string) => void;
  setSearchQuery: (query: string) => void;
  setShowFriendsList: (show: boolean) => void;
  setShowThemeSelector: (show: boolean) => void;
  setShowEmojiPicker: (show: boolean) => void;
  setMessageSearchQuery: (query: string) => void;
  setShowMessageSearch: (show: boolean) => void;
  setShowPinnedMessages: (show: boolean) => void;
  setGlobalSearchQuery: (query: string) => void;
  setShowGlobalSearch: (show: boolean) => void;
  setSelectedImages: (images: File[] | ((prev: File[]) => File[])) => void;
  setShouldScrollToBottom: (should: boolean) => void;
  setReplyToMessage: (message: MessageType | null) => void;
  setHighlightedMessageId: (id: string | null) => void;
  setShowDeleteModal: (show: boolean) => void;
  setSelectedConversation: (conversation: any) => void;

  // Functions
  getOtherUserInChat: () => UserResponse | undefined;
  handleSelectConversation: (conversationId: string) => void;
  handleStartChat: (friendId: string) => Promise<void>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasteImage: (files: File[]) => void;
  handleRemoveImage: (index: number) => void;
  handleOpenFileDialog: () => void;
  handleReplyToMessage: (message: MessageType) => void;
  handleCancelReply: () => void;
  handleSendMessage: () => void;
  handleMessageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearchFocus: () => void;
  handleEmojiClick: (emojiData: any) => void;
  handleMessageSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMessageSearchSubmit: (e: React.FormEvent) => void;
  handleTogglePinConversation: (conversationId: string) => Promise<void>;
  handleTogglePinMessage: (messageId: string) => Promise<void>;
  handleGlobalSearch: (e: React.FormEvent) => Promise<void>;
  clearGlobalSearch: () => void;
  handleSearchResultClick: (messageId: string) => void;
  handleScroll: () => void;
  scrollToBottom: () => void;
  handleDeleteConversation: (conversationId: string) => void;
  confirmDeleteConversation: () => Promise<void>;
  formatMessageTime: (timestamp: number) => { time: string; date: string };
  getInitials: (name: string) => string;
  handleInputFocusEvent: () => void;
  handleInputBlurEvent: () => void;
  renderMessages: () => React.ReactNode;
  renderReplyPreview: () => React.ReactNode;
  loadMoreMessages: () => void;

  // Hook functions
  getOrCreateConversation: (friendId: string) => Promise<string | null>;
  sendTextMessage: any;
  sendMessageWithImages: any;
  sendReplyMessage: any;
  sendReplyWithImages: any;
  setTyping: (typing: boolean) => void;
  handleFocus: () => void;
  handleBlur: () => void;
  registerInputRef: (ref: HTMLInputElement | null) => void;
  markAsRead: () => void;
  handleInputFocus: () => void;
  handleInputBlur: () => void;
  pinConversation: (id: string) => Promise<void>;
  unpinConversation: (id: string) => Promise<void>;
  isConversationPinned: (id: string) => boolean;
  pinMessage: (id: string) => Promise<void>;
  unpinMessage: (id: string) => Promise<void>;
  isMessagePinned: (id: string) => boolean;
  searchMessages: (query: string) => void;
  clearSearch: () => void;
}

export const useChatPage = (): UseChatPageReturn => {
  const { t } = useAppTranslate('chat');
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  
  // Ref to track if friendId from navigation state has been processed
  const processedFriendIdRef = useRef<string | null>(null);

  // Get conversation list and user information
  const { conversations, users, loading, getOrCreateConversation } = useConversation();

  // State to manage active conversation
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // State to manage message content
  const [messageText, setMessageText] = useState('');

  // State to save friends list for creating new conversations
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [showFriendsList, setShowFriendsList] = useState(false);

  // State for theme selector
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  // State for emoji picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // State for message search
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [showMessageSearch, setShowMessageSearch] = useState(false);

  // State for pinned messages display
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);

  // State cho tìm kiếm tổng
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);

  // State for image selection
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  // State for current conversation user (for restored conversations)
  const [currentConversationUser, setCurrentConversationUser] = useState<UserResponse | undefined>(undefined);

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get theme for active conversation
  const { theme } = useConversationTheme(activeConversationId || '');

  // Ref for message container to scroll to bottom
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Ref for message input to auto focus
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Ref for search container to handle click outside
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Ref for emoji picker to handle click outside
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Get messages for current conversation
  console.log('useChatPage: activeConversationId for individual messages:', activeConversationId);
  const { 
    messages, 
    loading: messagesLoading, 
    hasMore, 
    loadingMore, 
    loadMoreMessages 
  } = useMessages(activeConversationId || '', {
    initialLimit: 10,
    loadMoreLimit: 10,
    enablePagination: true
  });

  // Hook to send new messages
  const {
    sendTextMessage,
    sendMessageWithImages,
    sendAudioMessage,
    sendReplyMessage,
    sendReplyWithImages,
  } = useSendMessage(activeConversationId || '');

  // Hook to manage typing status with focus handling
  const { isTyping, setTyping, handleFocus, handleBlur, registerInputRef } = useTypingStatus(activeConversationId);

  // Hook to mark messages as read
  const {
    unreadCount,
    markAsRead,
    incrementUnread,
    handleInputFocus,
    handleInputBlur,
  } = useUnreadCount(activeConversationId || '');

  // Hook to manage pinned conversations
  const {
    pinnedConversations,
    pinConversation,
    unpinConversation,
    isConversationPinned,
    getPinOrder,
  } = usePinConversation();

  // Hook to manage pinned messages
  const { pinnedMessages, pinMessage, unpinMessage, isMessagePinned } = usePinMessage(activeConversationId || '');

  // Hook to search messages in current conversation
  const {
    searchResults,
    loading: searchLoading,
    error: searchError,
    searchMessages,
    clearSearch: clearSearchResults,
  } = useSearchConversationMessages();

  // Hook for global search across all conversations
  const {
    searchResults: globalSearchResults,
    loading: isGlobalSearching,
    error: globalSearchError,
    searchMessages: globalSearchMessages,
    clearSearch: clearGlobalSearchResults,
  } = useSearchMessages();

  // State to track if we should scroll to bottom
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const prevMessagesLengthRef = useRef<number>(0);

  // State to track if user has scrolled up
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  // State for reply
  const [replyToMessage, setReplyToMessage] = useState<MessageType | null>(null);

  // State và ref cho highlight message
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // State cho delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  // Get other user info in chat from friends list instead of users
  const getOtherUserInChat = useCallback((): UserResponse | undefined => {
    if (!activeConversationId) return undefined;

    const conversation = conversations.find(conv => conv.id === activeConversationId);
    
    // If conversation not in filtered array, use currentConversationUser state
    if (!conversation) {
      return currentConversationUser;
    }

    const currentUserId = localStorage.getItem('user_id');
    if (!currentUserId) return undefined;

    const otherUserId = Object.keys(conversation.members).find(id => id !== currentUserId);
    if (!otherUserId) return undefined;

    // Find user info from friends list
    const friend = friends.find(f => f.friend_id === otherUserId);
    if (friend && friend.friendInfo) {
      return {
        user_id: otherUserId,
        email: friend.friendInfo.email || '',
        full_name: friend.friendInfo.full_name || '',
        avatar_url: friend.friendInfo.avatar_url || '',
      };
    }

    // Fallback: use info from users object
    const userFromAPI = users[otherUserId];
    if (userFromAPI) {
      return userFromAPI;
    }

    return {
      user_id: otherUserId,
      email: '',
      full_name: otherUserId,
      avatar_url: '',
    };
  }, [activeConversationId, conversations, friends, users, currentConversationUser]);

  // Effect to fetch conversation user info when conversation is not in filtered array
  useEffect(() => {
    const fetchConversationUserInfo = async () => {
      if (!activeConversationId) {
        setCurrentConversationUser(undefined);
        return;
      }

      const currentUserId = localStorage.getItem('user_id');
      if (!currentUserId) return;

      // Check if conversation exists in filtered array
      const conversation = conversations.find(conv => conv.id === activeConversationId);
      if (conversation) {
        // Conversation exists in filtered array, clear the state
        setCurrentConversationUser(undefined);
        return;
      }

      // Conversation not in filtered array, fetch from Firebase
      try {
        const conversationRef = ref(db, `conversations/${activeConversationId}`);
        const snapshot = await get(conversationRef);
        if (snapshot.exists()) {
          const conversationData = snapshot.val();
          const otherUserId = Object.keys(conversationData.members).find(id => id !== currentUserId);
          
          if (otherUserId) {
            // Find user info from friends list
            const friend = friends.find(f => f.friend_id === otherUserId);
            if (friend && friend.friendInfo) {
              setCurrentConversationUser({
                user_id: otherUserId,
                email: friend.friendInfo.email || '',
                full_name: friend.friendInfo.full_name || '',
                avatar_url: friend.friendInfo.avatar_url || '',
              });
              return;
            }

            // Fallback: use info from users object
            const userFromAPI = users[otherUserId];
            if (userFromAPI) {
              setCurrentConversationUser(userFromAPI);
              return;
            }

            // Last fallback
            setCurrentConversationUser({
              user_id: otherUserId,
              email: '',
              full_name: otherUserId,
              avatar_url: '',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching conversation user info:', error);
      }
    };

    fetchConversationUserInfo();
  }, [activeConversationId, conversations, friends, users]);

  // Handle click outside search results to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowFriendsList(false);
      }

      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter friends based on search query
  useEffect(() => {
    if (!friends.length) {
      setFilteredFriends([]);
      return;
    }

    if (!searchQuery.trim()) {
      setFilteredFriends([]);
      setShowFriendsList(false);
      return;
    }

    setShowFriendsList(true);
    const query = searchQuery.toLowerCase();
    const filtered = friends.filter(
      friend =>
        friend.friendInfo?.full_name?.toLowerCase().includes(query) ||
        friend.friendInfo?.email?.toLowerCase().includes(query) ||
        friend.friend_id.toLowerCase().includes(query)
    );

    setFilteredFriends(filtered);
  }, [searchQuery, friends]);

  // Create unique friends list from filtered friends
  const uniqueFriends = React.useMemo(() => {
    const seen = new Set();
    return filteredFriends.filter(friend => {
      if (seen.has(friend.friend_id)) {
        return false;
      }
      seen.add(friend.friend_id);
      return true;
    });
  }, [filteredFriends]);

  // Handle input focus
  const handleInputFocusEvent = useCallback(() => {
    handleInputFocus();
    handleFocus();
  }, [handleInputFocus, handleFocus]);

  // Handle input blur
  const handleInputBlurEvent = useCallback(() => {
    handleInputBlur();
    handleBlur();
  }, [handleInputBlur, handleBlur]);

  // Handle receiving friendId from Friend List page and start chat immediately
  useEffect(() => {
    const initiateChatWithFriend = async () => {
      if (state?.friendId && processedFriendIdRef.current !== state.friendId) {
        // Mark this friendId as processed to prevent duplicate processing
        processedFriendIdRef.current = state.friendId;
        
        const conversationId = await getOrCreateConversation(state.friendId);
        if (conversationId) {
          setActiveConversationId(conversationId);

          // Auto focus on message input
          setTimeout(() => {
            if (messageInputRef.current) {
              messageInputRef.current.focus();
              handleInputFocusEvent();
            }
          }, 200);
        }
        
        // Clear the navigation state to prevent re-processing on page reload
        navigate(location.pathname, { replace: true });
      }
    };

    if (state?.friendId && processedFriendIdRef.current !== state.friendId) {
      initiateChatWithFriend();
    }
  }, [state, getOrCreateConversation, handleInputFocusEvent, navigate, location.pathname]);

  // Register input ref for typing status
  useEffect(() => {
    registerInputRef(messageInputRef.current);
  }, [registerInputRef, messageInputRef]);

  // Function to scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
      setIsScrolledUp(false);
    }
  }, []);

  // Handle scroll event to detect if user has scrolled up
  const handleScroll = useCallback(() => {
    if (!messageContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    setIsScrolledUp(!isAtBottom);
    setShouldScrollToBottom(isAtBottom);

    // Infinite scroll: Load more messages when scrolled near the top
    if (scrollTop < 100 && hasMore && !loadingMore && !messagesLoading) {
      loadMoreMessages();
    }
  }, [hasMore, loadingMore, messagesLoading, loadMoreMessages]);

  // Scroll to newest messages when messages change, but only in specific cases
  useEffect(() => {
    if (messageContainerRef.current && messages.length > 0) {
      // Scroll to bottom only if:
      // 1. We explicitly set shouldScrollToBottom flag (conversation change, send message)
      // 2. First load of conversation (prevMessagesLengthRef.current === 0)
      // 3. New message arrived AND user is not scrolled up (at the bottom)
      const isNewMessage = messages.length > prevMessagesLengthRef.current;
      const isFirstLoad = prevMessagesLengthRef.current === 0;
      
      if (
        shouldScrollToBottom ||
        isFirstLoad ||
        (isNewMessage && !isScrolledUp)
      ) {
        setTimeout(() => {
          scrollToBottom();
          setShouldScrollToBottom(false);
        }, 100);
      }

      // Mark messages as read when opening conversation and input is focused
      if (document.activeElement === messageInputRef.current) {
        markAsRead();
      }

      // Update the previous messages length reference
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages, markAsRead, shouldScrollToBottom, scrollToBottom, isScrolledUp]);

  // Handle selecting a conversation
  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setMessageText('');
    clearSearch();
    setShowMessageSearch(false);
    setShowPinnedMessages(false);
    setShouldScrollToBottom(true); // Set flag to scroll to bottom when conversation changes

    // Auto focus on message input
    setTimeout(() => {
      if (messageInputRef.current) {
        messageInputRef.current.focus();
        handleInputFocusEvent();
      }
    }, 100);
  };

  // Handle selecting a friend to start a new conversation
  const handleStartChat = async (friendId: string) => {
    const conversationId = await getOrCreateConversation(friendId);
    if (conversationId) {
      setActiveConversationId(conversationId);
      setSearchQuery('');
      setShowFriendsList(false);
      clearSearch();
      setShowMessageSearch(false);
      setShowPinnedMessages(false);
      setShouldScrollToBottom(true); // Set flag to scroll to bottom when starting new chat

      // Clear notification if user opens new chat
      if (!conversations.some(conv => conv.id === conversationId)) {
        setMessageText(''); // Clear current message if exists
      }

      // Auto focus on message input
      setTimeout(() => {
        if (messageInputRef.current) {
          messageInputRef.current.focus();
          handleInputFocusEvent();
        }
      }, 100);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate files (only images)
    const validFiles: File[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB

    Array.from(files).forEach(file => {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error(t('file_not_image'));
        return;
      }

      // Check file size
      if (file.size > maxSize) {
        toast.error(t('file_too_large'));
        return;
      }

      validFiles.push(file);
    });

    // Add valid files to selected images
    setSelectedImages(prev => [...prev, ...validFiles]);

    // Clear file input
    if (e.target) {
      e.target.value = '';
    }
  };

  // Handle paste image from clipboard
  const handlePasteImage = (files: File[]) => {
    if (!files || files.length === 0) return;

    // Validate files (only images)
    const validFiles: File[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB

    files.forEach(file => {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error(t('file_not_image'));
        return;
      }

      // Check file size
      if (file.size > maxSize) {
        toast.error(t('file_too_large'));
        return;
      }

      validFiles.push(file);
    });

    // Add valid files to selected images
    setSelectedImages(prev => [...prev, ...validFiles]);
  };

  // Handle remove image from preview
  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Open file dialog
  const handleOpenFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle reply to message
  const handleReplyToMessage = (message: MessageType) => {
    setReplyToMessage(message);

    // Focus on input
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  };

  // Cancel reply
  const handleCancelReply = () => {
    setReplyToMessage(null);
  };

  // Handle send message
  const handleSendMessage = () => {
    if ((!messageText.trim() && selectedImages.length === 0) || !activeConversationId) return;

    const currentUserId = localStorage.getItem('user_id');
    if (!currentUserId) return;

    // Nếu đang trả lời tin nhắn
    if (replyToMessage) {
      const replyInfo = {
        messageId: replyToMessage.id,
        text: replyToMessage.text,
        senderId: replyToMessage.senderId,
      };

      // Nếu có hình ảnh, gửi tin nhắn trả lời kèm hình ảnh
      if (selectedImages.length > 0) {
        sendReplyWithImages(messageText.trim(), selectedImages, replyInfo)
          .then(() => {
            setMessageText('');
            setSelectedImages([]);
            setReplyToMessage(null);
            setTyping(false);
            setShouldScrollToBottom(true);

            // Focus back on input after sending message
            if (messageInputRef.current) {
              messageInputRef.current.focus();
            }
          })
          .catch((error: any) => {
            console.error('Error sending reply with images:', error);
            toast.error(t('error_sending_reply'));
          });
      } else {
        // Gửi tin nhắn trả lời văn bản
        sendReplyMessage(messageText.trim(), replyInfo)
          .then(() => {
            setMessageText('');
            setReplyToMessage(null);
            setTyping(false);
            setShouldScrollToBottom(true);

            // Focus back on input after sending message
            if (messageInputRef.current) {
              messageInputRef.current.focus();
            }
          })
          .catch((error: any) => {
            console.error('Error sending reply message:', error);
            toast.error(t('error_sending_reply'));
          });
      }
    } else {
      // Nếu có hình ảnh, gửi tin nhắn với hình ảnh
      if (selectedImages.length > 0) {
        sendMessageWithImages(messageText.trim(), selectedImages)
          .then(() => {
            setMessageText('');
            setSelectedImages([]);
            setTyping(false);
            setShouldScrollToBottom(true);

            // Focus back on input after sending message
            if (messageInputRef.current) {
              messageInputRef.current.focus();
            }
          })
          .catch((error: any) => {
            console.error('Error sending message with images:', error);
            toast.error(t('error_sending_message'));
          });
      } else {
        // Gửi tin nhắn văn bản thông thường
        sendTextMessage({
          senderId: currentUserId,
          text: messageText.trim(),
        })
          .then(() => {
            setMessageText('');
            setTyping(false);
            setShouldScrollToBottom(true);

            // Focus back on input after sending message
            if (messageInputRef.current) {
              messageInputRef.current.focus();
            }
          })
          .catch((error: any) => {
            console.error('Error sending message:', error);
            toast.error(t('error_sending_message'));
          });
      }
    }
  };

  // Handle message input change (track typing)
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    // Luôn set typing = true khi có text trong input và đang focus
    setTyping(e.target.value.length > 0);

    // Log để debug
    console.log('Input changed, text length:', e.target.value.length);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Focus search input
  const handleSearchFocus = () => {
    if (searchQuery.trim()) {
      setShowFriendsList(true);
    }
  };

  // Handle emoji selection
  const handleEmojiClick = (emojiData: any) => {
    setMessageText(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);

    // Focus back on input after selecting emoji
    if (messageInputRef.current) {
      messageInputRef.current.focus();
      // Đảm bảo trạng thái typing được cập nhật
      setTyping(true);
    }
  };

  // Handle message search input change
  const handleMessageSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageSearchQuery(e.target.value);
  };

  // Handle message search submit
  const handleMessageSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageSearchQuery.trim() && activeConversationId) {
      searchMessages(messageSearchQuery, activeConversationId);
    }
  };

  // Handle clear search - reset both query and results
  const clearSearch = useCallback(() => {
    setMessageSearchQuery('');
    clearSearchResults();
  }, [clearSearchResults]);

  // Handle pin/unpin conversation
  const handleTogglePinConversation = async (conversationId: string) => {
    if (isConversationPinned(conversationId)) {
      await unpinConversation(conversationId);
    } else {
      await pinConversation(conversationId);
    }
  };

  // Handle pin/unpin message
  const handleTogglePinMessage = async (messageId: string) => {
    if (isMessagePinned(messageId)) {
      await unpinMessage(messageId);
    } else {
      await pinMessage(messageId);
    }
  };

  // Format date for message timestamp
  const formatMessageTime = (timestamp: number): { time: string; date: string } => {
    if (!timestamp) return { time: '', date: '' };

    const date = new Date(timestamp);
    const now = new Date();
    let timeStr = '';
    let dateStr = '';

    // Định dạng thời gian luôn ngắn gọn
    timeStr = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    // If same day, show "Today"
    if (date.toDateString() === now.toDateString()) {
      dateStr = t('today');
    }
    // If yesterday, show "Yesterday"
    else {
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        dateStr = t('yesterday');
      }
      // If within 7 days, show day name
      else {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        if (date > weekAgo) {
          // Show short day name
          const days = [
            t('sunday_short'),
            t('monday_short'),
            t('tuesday_short'),
            t('wednesday_short'),
            t('thursday_short'),
            t('friday_short'),
            t('saturday_short'),
          ];
          dateStr = days[date.getDay()];
        }
        // Otherwise show short date
        else {
          dateStr = date.toLocaleDateString([], {
            day: '2-digit',
            month: '2-digit',
          });
        }
      }
    }

    return { time: timeStr, date: dateStr };
  };

  // Get short name to display in avatar if no avatar is available
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  // Get friends list to create new conversations
  useEffect(() => {
    const fetchFriends = async () => {
      setFriendsLoading(true);
      try {
        const friendsList = await friendService.viewAllFriends();
        setFriends(friendsList);
      } catch (error) {
        console.error('Error fetching friends list:', error);
      } finally {
        setFriendsLoading(false);
      }
    };

    fetchFriends();
  }, []);

  // Hàm tìm kiếm tổng trong tất cả các hội thoại
  const handleGlobalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearchQuery.trim()) return;

    globalSearchMessages(globalSearchQuery);
  };

  // Hàm để xóa kết quả tìm kiếm tổng
  const clearGlobalSearch = () => {
    clearGlobalSearchResults();
    setGlobalSearchQuery('');
  };

  // Khi click vào search result, scroll tới message và highlight
  const handleSearchResultClick = (messageId: string) => {
    setHighlightedMessageId(messageId);
    const ref = messageRefs.current[messageId];
    if (ref && ref.scrollIntoView) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => setHighlightedMessageId(null), 2000);
  };



  // Hàm xóa conversation
  const handleDeleteConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    setSelectedConversation(conversation);
    setShowDeleteModal(true);
  };

  const confirmDeleteConversation = async () => {
    if (!selectedConversation) return;
    try {
      // Sử dụng xóa mềm thay vì xóa cứng
      const success = await chatService.softDeleteConversation(selectedConversation.id);
      if (success) {
        if (activeConversationId === selectedConversation.id) {
          setActiveConversationId(null);
        }
        toast.success(t('conversation_deleted'));
      } else {
        toast.error(t('failed_delete_conversation'));
      }
    } catch (error) {
      toast.error(t('failed_delete_conversation'));
    } finally {
      setShowDeleteModal(false);
      setSelectedConversation(null);
    }
  };

  // Render messages - placeholder function
  const renderMessages = () => {
    if (!messages || messages.length === 0) {
      console.log('renderMessages: No messages to render');
      return null;
    }

    console.log('renderMessages: Rendering', messages.length, 'messages');
    
    return (
      <>
        {/* Loading indicator for loading more messages */}
        {loadingMore && (
          <div className="flex justify-center py-4">
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm">Loading more messages...</span>
            </div>
          </div>
        )}
        
        {messages.map((message, index) => {
          const isOwn = message.senderId === localStorage.getItem('user_id');
          const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
          const showTime = index === messages.length - 1 || 
            messages[index + 1].senderId !== message.senderId ||
            (messages[index + 1].createdAt - message.createdAt) > 300000; // 5 minutes

          return (
             <MessageItem
               key={message.id}
               message={message}
               conversationId={activeConversationId || ''}
               isCurrentUser={isOwn}
               onPin={handleTogglePinMessage}
               onReply={handleReplyToMessage}
               users={users}
               messageRef={(el: HTMLDivElement | null) => {
                 if (el) messageRefs.current[message.id] = el;
               }}
               highlight={highlightedMessageId === message.id}
             />
           );
        })}
      </>
    );
  };

  // Render reply preview
  const renderReplyPreview = () => {
    if (!replyToMessage) return null;

    const replyUser = replyToMessage.senderId === localStorage.getItem('user_id') 
      ? { full_name: 'You' } 
      : getOtherUserInChat();

    return (
      <div className="bg-gray-50 border-l-4 border-blue-500 p-3 mx-2 mb-2 rounded">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="text-xs text-blue-600 font-medium mb-1">
              Replying to {replyUser?.full_name || 'Unknown'}
            </div>
            <div className="text-sm text-gray-600 truncate">
              {replyToMessage.text || 'Image'}
            </div>
          </div>
          <button
            onClick={handleCancelReply}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return {
    // State
    activeConversationId,
    messageText,
    friends,
    friendsLoading,
    searchQuery,
    filteredFriends,
    uniqueFriends,
    showFriendsList,
    showThemeSelector,
    showEmojiPicker,
    messageSearchQuery,
    showMessageSearch,
    showPinnedMessages,
    globalSearchQuery,
    globalSearchResults,
    isGlobalSearching,
    showGlobalSearch,
    selectedImages,
    shouldScrollToBottom,
    isScrolledUp,
    replyToMessage,
    highlightedMessageId,
    showDeleteModal,
    selectedConversation,

    // Refs
    fileInputRef,
    messageContainerRef,
    messageInputRef,
    searchContainerRef,
    emojiPickerRef,
    messageRefs,

    // Hooks data
    conversations,
    users,
    loading,
    messages,
    messagesLoading,
    hasMore,
    loadingMore,
    theme,
    isTyping,
    unreadCount,
    pinnedConversations,
    pinnedMessages,
    searchResults,
    searchLoading,
    searchError,

    // Handlers
    setActiveConversationId,
    setMessageText,
    setSearchQuery,
    setShowFriendsList,
    setShowThemeSelector,
    setShowEmojiPicker,
    setMessageSearchQuery,
    setShowMessageSearch,
    setShowPinnedMessages,
    setGlobalSearchQuery,
    setShowGlobalSearch,
    setSelectedImages,
    setShouldScrollToBottom,
    setReplyToMessage,
    setHighlightedMessageId,
    setShowDeleteModal,
    setSelectedConversation,

    // Functions
    getOtherUserInChat,
    handleSelectConversation,
    handleStartChat,
    handleFileChange,
    handlePasteImage,
    handleRemoveImage,
    handleOpenFileDialog,
    handleReplyToMessage,
    handleCancelReply,
    handleSendMessage,
    handleMessageChange,
    handleSearchChange,
    handleSearchFocus,
    handleEmojiClick,
    handleMessageSearchChange,
    handleMessageSearchSubmit,
    handleTogglePinConversation,
    handleTogglePinMessage,
    handleGlobalSearch,
    clearGlobalSearch,
    handleSearchResultClick,
    handleScroll,
    scrollToBottom,
    handleDeleteConversation,
    confirmDeleteConversation,
    formatMessageTime,
    getInitials,
    handleInputFocusEvent,
    handleInputBlurEvent,
    renderMessages,
    renderReplyPreview,

    // Hook functions
    getOrCreateConversation,
    sendTextMessage,
    sendMessageWithImages,
    sendReplyMessage,
    sendReplyWithImages,
    setTyping,
    handleFocus,
    handleBlur,
    registerInputRef,
    markAsRead,
    handleInputFocus,
    handleInputBlur,
    pinConversation,
    unpinConversation,
    isConversationPinned,
    pinMessage,
    unpinMessage,
    isMessagePinned,
    searchMessages,
    clearSearch,
    loadMoreMessages,
  };
};