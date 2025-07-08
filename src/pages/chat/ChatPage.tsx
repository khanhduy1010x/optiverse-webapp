import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useConversation } from '../../hooks/chat/useConversation';
import { useMessages } from '../../hooks/chat/useMessages';
import { useSendMessage } from '../../hooks/chat/useSendMessage';
import { useTypingStatus } from '../../hooks/chat/useTypingStatus';
import { useUnreadCount } from '../../hooks/chat/useUnreadCount';
import { useConversationTheme } from '../../hooks/chat/useConversationTheme';
import { usePinConversation } from '../../hooks/chat/usePinConversation';
import { usePinMessage } from '../../hooks/chat/usePinMessage';
import { useSearchMessages } from '../../hooks/chat/useSearchMessages';
import ConversationList from './ConversationList';
import ThemeSelector from '../../components/chat/ThemeSelector';
import ImagePreview from '../../components/chat/ImagePreview';
import AudioRecorder from '../../components/chat/AudioRecorder';
import { UserResponse } from '../../types/auth/auth.types';
import friendService from '../../services/friend.service';
import chatService from '../../services/chat.service';
import { Friend } from '../../types/friend/response/friend.response';
import { ref, update, get, child, remove } from 'firebase/database';
import { db } from '../../firebase';
import EmojiPicker from 'emoji-picker-react';
import { MessageType } from '../../types/chat/MessageType';
import { toast } from 'react-toastify';
import MessageItem from '../../components/chat/MessageItem';
import {
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  Reply as ReplyIcon,
  Done as DoneIcon,
  DoneAll as DoneAllIcon
} from '@mui/icons-material';
import DeleteModal from '../Note/DeleteModal.screen';

// CSS cho hiệu ứng đang nhập
const typingAnimationCSS = `
.typing-animation span {
  animation: typingDot 1.4s infinite;
  animation-fill-mode: both;
  font-size: 16px;
}

.typing-animation span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-animation span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingDot {
  0% {
    opacity: 0.2;
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0.2;
  }
}
`;

interface LocationState {
  friendId?: string;
}

const ChatPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;

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

  // Thêm state cho tìm kiếm tổng
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<MessageType[]>([]);
  const [isGlobalSearching, setIsGlobalSearching] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);

  // State for image selection
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

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
  const { messages, loading: messagesLoading } = useMessages(activeConversationId || '');

  // Hook to send new messages
  const {
    sendTextMessage,
    sendMessageWithImages,
    sendAudioMessage,
    sendReplyMessage,
    sendReplyWithImages
  } = useSendMessage(activeConversationId || '');

  // Hook to manage typing status with focus handling
  const { isTyping, setTyping, handleFocus, handleBlur, registerInputRef } = useTypingStatus(
    activeConversationId
  );

  // Hook to mark messages as read
  const { unreadCount, markAsRead, incrementUnread, handleInputFocus, handleInputBlur } = useUnreadCount(activeConversationId || '');

  // Hook to manage pinned conversations
  const {
    pinnedConversations,
    pinConversation,
    unpinConversation,
    isConversationPinned,
    getPinOrder
  } = usePinConversation();

  // Hook to manage pinned messages
  const {
    pinnedMessages,
    pinMessage,
    unpinMessage,
    isMessagePinned
  } = usePinMessage(activeConversationId || '');

  // Hook to search messages
  const {
    searchResults,
    loading: searchLoading,
    error: searchError,
    searchMessages,
    clearSearch
  } = useSearchMessages();

  // State to track if we should scroll to bottom
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const prevMessagesLengthRef = useRef<number>(0);

  // State to track if user has scrolled up
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  // State for reply
  const [replyToMessage, setReplyToMessage] = useState<MessageType | null>(null);

  // Thêm state và ref cho highlight message
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Get other user info in chat from friends list instead of users
  const getOtherUserInChat = useCallback((): UserResponse | undefined => {
    if (!activeConversationId) return undefined;

    const conversation = conversations.find(conv => conv.id === activeConversationId);
    if (!conversation) return undefined;

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
        avatar_url: friend.friendInfo.avatar_url || ''
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
      avatar_url: ''
    };
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
      if (state?.friendId) {
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
      }
    };

    if (state?.friendId) {
      initiateChatWithFriend();
    }
  }, [state, getOrCreateConversation, handleInputFocusEvent]);

  // Register input ref for typing status
  useEffect(() => {
    registerInputRef(messageInputRef.current);
  }, [registerInputRef, messageInputRef]);

  // Handle scroll event to detect if user has scrolled up
  const handleScroll = () => {
    if (messageContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
      // Consider scrolled up if not at the bottom (with a small buffer)
      const scrolledUp = scrollTop < scrollHeight - clientHeight - 50;
      setIsScrolledUp(scrolledUp);
    }
  };

  // Scroll to newest messages when messages change, but only in specific cases
  useEffect(() => {
    if (messageContainerRef.current && messages.length > 0) {
      // Scroll to bottom only if:
      // 1. We explicitly set shouldScrollToBottom flag
      // 2. New message arrived (messages.length > prevMessagesLengthRef.current)
      // 3. First load of conversation (prevMessagesLengthRef.current === 0)
      if (shouldScrollToBottom || messages.length > prevMessagesLengthRef.current || prevMessagesLengthRef.current === 0) {
        messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        setShouldScrollToBottom(false);
      }

      // Mark messages as read when opening conversation and input is focused
      if (document.activeElement === messageInputRef.current) {
        markAsRead();
      }

      // Update the previous messages length reference
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages, markAsRead, shouldScrollToBottom]);

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
        toast.error(`${file.name} is not an image.`);
        return;
      }

      // Check file size
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds the maximum size (5MB).`);
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
        senderId: replyToMessage.senderId
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
          .catch(error => {
            console.error('Error sending reply with images:', error);
            toast.error('An error occurred while sending reply message.');
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
          .catch(error => {
            console.error('Error sending reply message:', error);
            toast.error('An error occurred while sending reply message.');
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
          .catch(error => {
            console.error('Error sending message with images:', error);
            toast.error('An error occurred while sending message.');
          });
      } else {
        // Gửi tin nhắn văn bản thông thường
        sendTextMessage({
          senderId: currentUserId,
          text: messageText.trim()
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
          .catch(error => {
            console.error('Error sending message:', error);
            toast.error('An error occurred while sending message.');
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
    if (messageSearchQuery.trim()) {
      searchMessages(messageSearchQuery);
    }
  };

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
    timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // If same day, show "Hôm nay"
    if (date.toDateString() === now.toDateString()) {
      dateStr = 'Today';
    }
    // If yesterday, show "Hôm qua"
    else {
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        dateStr = 'Yesterday';
      }
      // If within 7 days, show day name
      else {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        if (date > weekAgo) {
          // Chỉ hiển thị tên ngày trong tuần
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          dateStr = days[date.getDay()];
        }
        // Otherwise show short date
        else {
          dateStr = date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
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

  const uniqueConversations = Array.from(
    new Map(conversations.map(item => [item.id, item])).values()
  );

  const uniqueFriends = Array.from(
    new Map(filteredFriends.map(item => [item.friend_id, item])).values()
  );

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

    setIsGlobalSearching(true);
    try {
      // Tìm kiếm trong tất cả các hội thoại
      const results: MessageType[] = [];

      for (const conversation of conversations) {
        const messagesRef = ref(db, `messages/${conversation.id}`);
        const snapshot = await get(messagesRef);

        if (snapshot.exists()) {
          const messagesData = snapshot.val();

          Object.entries(messagesData).forEach(([id, messageData]: [string, any]) => {
            if (messageData.text.toLowerCase().includes(globalSearchQuery.toLowerCase())) {
              results.push({
                id,
                ...messageData,
                conversationId: conversation.id
              });
            }
          });
        }
      }

      // Sắp xếp kết quả theo thời gian mới nhất
      results.sort((a, b) => b.createdAt - a.createdAt);

      setGlobalSearchResults(results);
    } catch (error) {
      console.error('Error searching messages globally:', error);
    } finally {
      setIsGlobalSearching(false);
    }
  };

  // Hàm để xóa kết quả tìm kiếm tổng
  const clearGlobalSearch = () => {
    setGlobalSearchResults([]);
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

  // Render messages
  const renderMessages = () => {
    if (messagesLoading) {
      return <div className="flex justify-center items-center h-full">Loading messages...</div>;
    }

    if (messages.length === 0) {
      return (
        <div className="flex flex-col justify-center items-center h-full text-gray-500">
          <p>Start the conversation!</p>
          <p className="text-sm mt-2">Type a message...</p>
        </div>
      );
    }

    const currentUserId = localStorage.getItem('user_id');
    if (!currentUserId) return null;

    return messages.map((message) => (
      <MessageItem
        key={message.id}
        message={message}
        conversationId={activeConversationId || ''}
        isCurrentUser={message.senderId === currentUserId}
        onPin={handleTogglePinMessage}
        onReply={handleReplyToMessage}
        users={users}
        messageRef={el => { messageRefs.current[message.id] = el; }}
        highlight={highlightedMessageId === message.id}
      />
    ));
  };

  // Render reply preview
  const renderReplyPreview = () => {
    if (!replyToMessage) return null;

    const isCurrentUser = replyToMessage.senderId === localStorage.getItem('user_id');
    const senderName = isCurrentUser
      ? 'You'
      : users[replyToMessage.senderId]?.full_name || 'User';

    return (
      <div className="reply-preview flex items-center bg-gray-100 p-2 rounded-t-lg">
        <div className="flex-1 overflow-hidden">
          <div className="text-xs font-medium text-blue-500 mb-1">
            Replying to {senderName}
          </div>
          <div className="text-sm truncate text-gray-600">
            {replyToMessage.text}
          </div>
        </div>
        <button
          onClick={handleCancelReply}
          className="ml-2 text-gray-500 hover:text-gray-700"
        >
          <CloseIcon fontSize="small" />
        </button>
      </div>
    );
  };

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
      setIsScrolledUp(false);
    }
  };

  // Thêm biến textColor lấy từ theme
  const textColor = theme?.textColor || '#000';

  // Thêm hàm xóa conversation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  const handleDeleteConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    setSelectedConversation(conversation);
    setShowDeleteModal(true);
  };

  const confirmDeleteConversation = async () => {
    if (!selectedConversation) return;
    try {
      await remove(ref(db, `conversations/${selectedConversation.id}`));
      if (activeConversationId === selectedConversation.id) {
        setActiveConversationId(null);
      }
      toast.success('Conversation deleted.');
    } catch (error) {
      toast.error('Failed to delete conversation.');
    } finally {
      setShowDeleteModal(false);
      setSelectedConversation(null);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <style dangerouslySetInnerHTML={{
        __html: `
        .typing-animation span {
          animation: typingDot 1.4s infinite;
          animation-fill-mode: both;
          font-size: 16px;
        }
        
        .typing-animation span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-animation span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes typingDot {
          0% {
            opacity: 0.2;
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0.2;
          }
        }
        
        .reaction-item {
          transition: transform 0.2s ease;
        }
        
        .reaction-item:hover {
          transform: scale(1.2);
        }
        
        .message-actions {
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .message-container:hover .message-actions {
          opacity: 1;
        }

        .scroll-to-bottom-btn {
          position: absolute;
          bottom: 80px;
          right: 20px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #21b4ca;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
          z-index: 10;
          opacity: 0;
          transform: translateY(20px);
        }
        
        .scroll-to-bottom-btn.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .scroll-to-bottom-btn:hover {
          background-color: #1a9db0;
          box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        }

        .chat-container {
          height: 100vh;
          max-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          min-height: 0;
        }
      `}} />
      {/* Sidebar */}
      <div className="w-80 p-4 border-r border-gray-200 bg-white overflow-y-auto custom-scrollbar-3">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>

        {/* Global search */}
        <div className="mb-3">
          <form onSubmit={handleGlobalSearch} className="flex">
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Search in all conversations..."
              className="flex-1 border border-gray-300 rounded-l-lg px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#21b4ca]"
            />
            <button
              type="submit"
              className="bg-[#21b4ca] text-white px-3 py-1 rounded-r-lg text-sm"
              disabled={isGlobalSearching}
            >
              {isGlobalSearching ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {/* Global search results */}
        {globalSearchResults.length > 0 && (
          <div className="mb-4 border border-gray-200 rounded-lg p-2 bg-[#e6f7f9]">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">Search results ({globalSearchResults.length})</p>
              <button
                onClick={clearGlobalSearch}
                className="text-xs text-[#21b4ca] hover:underline"
              >
                Close
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto custom-scrollbar-3">
              {globalSearchResults.map(message => {
                // Đảm bảo message.conversationId tồn tại
                if (!message.conversationId) return null;

                // Tìm thông tin người gửi
                const currentUserId = localStorage.getItem('user_id');
                const conversation = conversations.find(conv => conv.id === message.conversationId);
                if (!conversation) return null;

                const otherUserId = Object.keys(conversation.members).find(id => id !== currentUserId);
                const otherUser = otherUserId ? users[otherUserId] : null;

                return (
                  <div
                    key={message.id}
                    className="p-2 hover:bg-white rounded cursor-pointer mb-1"
                    onClick={() => {
                      handleSelectConversation(message.conversationId || '');
                      setTimeout(() => {
                        setHighlightedMessageId(message.id);
                        const ref = messageRefs.current[message.id];
                        if (ref && ref.scrollIntoView) {
                          ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                        setTimeout(() => setHighlightedMessageId(null), 2000);
                      }, 300); // Đợi chuyển conversation xong mới scroll
                      clearGlobalSearch();
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#21b4ca] text-white flex items-center justify-center text-xs">
                        {otherUser?.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-xs font-medium">{otherUser?.full_name || otherUser?.email || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{message.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Friends list */}
        <div className="mb-6 relative" ref={searchContainerRef}>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Friends</h3>

          {/* Search input */}
          <div className="mb-1">
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Search results dropdown - Absolute positioning */}
          {showFriendsList && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto custom-scrollbar-3 overflow-x-hidden">
              {friendsLoading ? (
                <p className="text-sm text-gray-400 p-3">Loading...</p>
              ) : uniqueFriends.length > 0 ? (
                <div className="py-1">
                  {uniqueFriends.map(friend => {
                    const isActive = activeConversationId && conversations.some(conv =>
                      conv.id === activeConversationId &&
                      conv.members[friend.friend_id]
                    );

                    // Get display info
                    const displayName = friend.friendInfo?.full_name || friend.friendInfo?.email || friend.friend_id;
                    const initial = getInitials(displayName);
                    const avatarUrl = friend.friendInfo?.avatar_url;

                    return (
                      <div
                        key={friend.friend_id}
                        onClick={() => handleStartChat(friend.friend_id)}
                        className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 ${isActive ? 'bg-blue-50' : ''
                          }`}
                      >
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-700'
                            }`}>
                            {initial}
                          </div>
                        )}
                        <span className="text-sm truncate flex-1">{displayName}</span>
                        {/* Chat icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 p-3">
                  No matching friends found
                </p>
              )}
            </div>
          )}

          {/* Placeholder text when empty */}
          {!showFriendsList && (
            <p className="text-sm text-gray-400 mb-3 mt-1">
              Type to search friends
            </p>
          )}
        </div>

        {/* Conversation list */}
        <ConversationList
          conversations={uniqueConversations}
          users={users}
          loading={loading}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full" style={{ color: textColor }}>
        {activeConversationId ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white" style={{ color: textColor }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {(() => {
                    const otherUser = getOtherUserInChat();
                    return (
                      <>
                        {otherUser?.avatar_url ? (
                          <img
                            src={otherUser.avatar_url}
                            alt={otherUser.full_name || otherUser.email}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#21b4ca] text-white flex items-center justify-center font-medium">
                            {getInitials(otherUser?.full_name || otherUser?.email || '')}
                          </div>
                        )}
                        <div className="ml-3">
                          <h3 className="font-medium">
                            {otherUser?.full_name || otherUser?.email}
                          </h3>
                          {otherUser?.email && (
                            <span className="text-xs text-gray-500">{otherUser.email}</span>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="flex items-center space-x-2">
                  {/* Pin conversation button */}
                  <button
                    onClick={() => handleTogglePinConversation(activeConversationId)}
                    className={`p-2 rounded-full hover:bg-gray-100 ${isConversationPinned(activeConversationId) ? 'text-[#21b4ca]' : 'text-gray-500'}`}
                    title={isConversationPinned(activeConversationId) ? "Unpin conversation" : "Pin conversation"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Search messages button */}
                  <button
                    onClick={() => setShowMessageSearch(!showMessageSearch)}
                    className={`p-2 rounded-full hover:bg-gray-100 ${showMessageSearch ? 'text-[#21b4ca]' : 'text-gray-500'}`}
                    title="Search messages"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Show pinned messages button */}
                  <button
                    onClick={() => setShowPinnedMessages(!showPinnedMessages)}
                    className={`p-2 rounded-full hover:bg-gray-100 ${showPinnedMessages ? 'text-[#21b4ca]' : 'text-gray-500'}`}
                    title="Xem tin nhắn đã ghim"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.6 3.54l1.4 1.4-3.53 3.53a2 2 0 001.41 3.42h4.12a2 2 0 001.41-3.42L10.4 4.94l1.4-1.4a1 1 0 000-1.42 1 1 0 00-1.4 0L8.4 3.4l-2-2a1 1 0 00-1.4 0 1 1 0 000 1.42l2 2-2.76 2.76a2 2 0 000 2.82 2 2 0 002.83 0L8.4 8.4l1.2 1.2v6.4a1 1 0 002 0v-6.4l1.2-1.2 1.33 1.33a2 2 0 002.83 0 2 2 0 000-2.82L14.2 4.6l2-2a1 1 0 000-1.42 1 1 0 00-1.4 0l-2 2-1.2-1.2a1 1 0 00-1.4 0 1 1 0 00-.6 1.56z" />
                    </svg>
                  </button>

                  {/* Theme button */}
                  <button
                    onClick={() => setShowThemeSelector(!showThemeSelector)}
                    className={`p-2 rounded-full hover:bg-gray-100 ${showThemeSelector ? 'text-[#21b4ca]' : 'text-gray-500'}`}
                    title="Thay đổi theme"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Search messages form */}
              {showMessageSearch && (
                <div className="mt-3">
                  <form onSubmit={handleMessageSearchSubmit} className="flex">
                    <input
                      type="text"
                      value={messageSearchQuery}
                      onChange={handleMessageSearchChange}
                      placeholder="Tìm kiếm tin nhắn..."
                      className="flex-1 border border-gray-300 rounded-l-lg px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#21b4ca]"
                    />
                    <button
                      type="submit"
                      className="bg-[#21b4ca] text-white px-3 py-1 rounded-r-lg text-sm"
                      disabled={searchLoading}
                    >
                      {searchLoading ? 'Đang tìm...' : 'Tìm'}
                    </button>
                  </form>
                  {searchError && (
                    <p className="text-xs text-red-500 mt-1">{searchError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Pinned messages */}
            {pinnedMessages.length > 0 && (
              <div className={`border-b border-gray-200 bg-[#e6f7f9] transition-all duration-300 ${showPinnedMessages ? 'max-h-60 overflow-y-auto' : 'max-h-12 overflow-hidden'}`}>
                <div className="p-2 flex items-center justify-between cursor-pointer" onClick={() => setShowPinnedMessages(!showPinnedMessages)}>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#21b4ca]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.6 3.54l1.4 1.4-3.53 3.53a2 2 0 001.41 3.42h4.12a2 2 0 001.41-3.42L10.4 4.94l1.4-1.4a1 1 0 000-1.42 1 1 0 00-1.4 0L8.4 3.4l-2-2a1 1 0 00-1.4 0 1 1 0 000 1.42l2 2-2.76 2.76a2 2 0 000 2.82 2 2 0 002.83 0L8.4 8.4l1.2 1.2v6.4a1 1 0 002 0v-6.4l1.2-1.2 1.33 1.33a2 2 0 002.83 0 2 2 0 000-2.82L14.2 4.6l2-2a1 1 0 000-1.42 1 1 0 00-1.4 0l-2 2-1.2-1.2a1 1 0 00-1.4 0 1 1 0 00-.6 1.56z" />
                    </svg>
                    {showPinnedMessages ? `${pinnedMessages.length} tin nhắn đã ghim` : 'Tin nhắn đã ghim'}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${showPinnedMessages ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>

                {showPinnedMessages && (
                  <div className="px-3 pb-2 space-y-2">
                    {pinnedMessages.map(message => {
                      const isCurrentUser = message.senderId === localStorage.getItem('user_id');
                      return (
                        <div key={message.id} className="bg-white rounded-lg p-2 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div className="text-xs font-medium text-gray-700">
                              {message.senderId === localStorage.getItem('user_id') ? 'Bạn' : getOtherUserInChat()?.full_name || getOtherUserInChat()?.email || 'Người dùng khác'}
                            </div>
                            <button
                              onClick={() => unpinMessage(message.id)}
                              className="text-gray-400 hover:text-red-500"
                              title="Bỏ ghim"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                          <p className="text-sm my-1 break-words">{message.text}</p>
                          <div className="flex justify-end items-center gap-1">
                            <span className="text-xs text-gray-500">
                              {formatMessageTime(message.createdAt).time}
                            </span>
                            <span className="text-xs text-gray-400">
                              •
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatMessageTime(message.createdAt).date}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="flex-1 flex min-h-0">
              {/* Chat content */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* Messages area */}
                <div
                  ref={messageContainerRef}
                  className="flex-1 p-4 overflow-y-auto custom-scrollbar-3 overflow-x-hidden relative messages-container"
                  onScroll={handleScroll}
                  style={{
                    backgroundColor: theme?.backgroundColor || 'transparent',
                    backgroundImage: theme?.backgroundUrl ? `url(${theme.backgroundUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: textColor,
                    maxHeight: 'calc(100vh - 200px)',
                    minHeight: '300px'
                  }}
                >
                  {messagesLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <p className="text-gray-500">Loading messages...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    // Hiển thị kết quả tìm kiếm
                    <div className="space-y-3">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-500">Tìm thấy {searchResults.length} kết quả</p>
                        <button
                          onClick={clearSearch}
                          className="text-xs text-[#21b4ca] hover:underline"
                        >
                          Xóa kết quả tìm kiếm
                        </button>
                      </div>
                      {searchResults.map(message => {
                        const isCurrentUser = message.senderId === localStorage.getItem('user_id');
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} items-center`}
                            style={{ cursor: 'pointer' }}
                          >
                            <div
                              className={`max-w-xs rounded-lg px-4 py-2 ${isCurrentUser
                                ? 'bg-[#21b4ca] text-white'
                                : 'bg-gray-200 text-gray-800'
                                }`}
                            >
                              <p className="break-words">{message.text}</p>
                              <div className="flex justify-end items-center mt-1 gap-1">
                                <span className={`text-xs ${isCurrentUser ? 'text-white opacity-70' : 'text-gray-500'}`}>
                                  {formatMessageTime(message.createdAt).time}
                                </span>
                                <span className={`text-xs ${isCurrentUser ? 'text-white opacity-60' : 'text-gray-400'}`}>
                                  •
                                </span>
                                <span className={`text-xs ${isCurrentUser ? 'text-white opacity-70' : 'text-gray-500'}`}>
                                  {formatMessageTime(message.createdAt).date}
                                </span>
                                {/* Icon kính lúp để đi đến tin nhắn gốc */}
                                <button
                                  onClick={() => {
                                    clearSearch();
                                    setTimeout(() => {
                                      handleSearchResultClick(message.id);
                                    }, 100);
                                  }}
                                  className="ml-2 p-1 rounded-full hover:bg-blue-100"
                                  title="Đi đến tin nhắn gốc"
                                  type="button"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                      <p className="text-gray-500">Start chatting now!</p>
                    </div>
                  ) : (
                    <>
                      {renderMessages()}
                    </>
                  )}

                  {/* Nút cuộn xuống */}
                  <div
                    className={`scroll-to-bottom-btn ${isScrolledUp ? 'visible' : ''}`}
                    onClick={scrollToBottom}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>

                {/* Hiển thị trạng thái đang nhập - đặt trước input */}
                <div className="border-t border-gray-200 flex-shrink-0">
                  {activeConversationId && isTyping && (
                    <div className="typing-indicator px-4 py-2 text-sm text-gray-500 italic bg-gray-50">
                      <div className="flex items-center">
                        <span className="mr-2">{getOtherUserInChat()?.full_name || 'Người dùng'} đang nhập</span>
                        <span className="typing-animation">
                          <span>.</span>
                          <span>.</span>
                          <span>.</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Input gửi tin nhắn */}
                  <div className="flex flex-col border-t">
                    {/* Hiển thị xem trước hình ảnh */}
                    {selectedImages.length > 0 && (
                      <div className="p-2">
                        <ImagePreview images={selectedImages} onRemove={handleRemoveImage} />
                      </div>
                    )}

                    {/* Hiển thị trả lời nhỏ nhỏ bên trên input */}
                    {renderReplyPreview()}

                    <form className="flex items-center p-3" onSubmit={e => { e.preventDefault(); handleSendMessage(); }}>
                      {/* Nút chọn file */}
                      <button
                        onClick={handleOpenFileDialog}
                        type="button"
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                        title="Đính kèm hình ảnh"
                      >
                        <AttachFileIcon />
                      </button>

                      {/* Input ẩn để chọn file */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />

                      {/* Nút emoji */}
                      <div className="relative" ref={emojiPickerRef}>
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                        >
                          😊
                        </button>
                        {showEmojiPicker && (
                          <div className="absolute bottom-12 right-0 z-10">
                            <EmojiPicker onEmojiClick={handleEmojiClick} />
                          </div>
                        )}
                      </div>

                      {/* Input nhập tin nhắn */}
                      <input
                        ref={ref => {
                          messageInputRef.current = ref;
                          registerInputRef(ref);
                        }}
                        value={messageText}
                        onChange={handleMessageChange}
                        onFocus={handleInputFocusEvent}
                        onBlur={handleInputBlurEvent}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 p-2 mx-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <button
                        type="submit"
                        disabled={!messageText.trim() && selectedImages.length === 0}
                        className={`p-2 rounded-full ${!messageText.trim() && selectedImages.length === 0
                          ? 'bg-gray-200 text-gray-400'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Theme selector */}
              <ThemeSelector
                conversationId={activeConversationId || ''}
                onClose={() => setShowThemeSelector(false)}
                isOpen={showThemeSelector}
              />
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <p className="text-gray-500">Select a conversation to start chatting</p>
              <p className="text-gray-400 text-sm mt-2">Or search for a friend to create a new conversation</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        selectedItem={selectedConversation ? {
          type: 'file',
          title: 'This conversion',
          content: '',
        } : null}
        onDelete={confirmDeleteConversation}
      />
    </div>
  );
};

export default ChatPage;