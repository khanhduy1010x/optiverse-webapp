import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAppTranslate } from '../useAppTranslate';
import { useGroupConversations } from './useGroupConversations';
import { useGroupMessages } from './useGroupMessages';
import { useSendGroupMessage } from './useSendGroupMessage';
import { useGroupUnreadCount } from './useGroupUnreadCount';
import { useTypingStatus } from './useTypingStatus';
import { useConversationTheme } from './useConversationTheme';
import { usePinGroupConversation } from './usePinGroupConversation';
import { usePinGroupMessage } from './usePinGroupMessage';
import { useSearchGroupMessages } from './useSearchGroupMessages';
import { MessageType } from '../../types/chat/MessageType';
import { UseGroupChatPageReturn } from '../../types/chat/response/group.response';



export function useGroupChatPage(externalActiveGroupConversationId?: string | null): UseGroupChatPageReturn {
  console.log('=== useGroupChatPage HOOK CALLED ===');
  console.log('externalActiveGroupConversationId:', externalActiveGroupConversationId);
  
  // Translation hook
  const { t } = useAppTranslate();
  
  // Group conversations data
  const { 
    groupConversations, 
    users: groupUsers, 
    loading: groupLoading,
    getGroupMembers,
    getActiveMembers,
    isAdmin,
    isModerator,
    getGroupById
  } = useGroupConversations();
  
  // Active group conversation state - use external if provided, otherwise internal
  const [internalActiveGroupConversationId, setInternalActiveGroupConversationId] = useState<string | null>(null);
  const activeGroupConversationId = externalActiveGroupConversationId !== undefined 
    ? externalActiveGroupConversationId 
    : internalActiveGroupConversationId;
  
  console.log('Final activeGroupConversationId in hook:', activeGroupConversationId);
  
  const setActiveGroupConversationId = externalActiveGroupConversationId !== undefined
    ? () => {} // No-op when controlled externally
    : setInternalActiveGroupConversationId;
  
  // Get active group data
  const activeGroup = getGroupById(activeGroupConversationId || '');
  
  // Group messages
  const { 
    messages: groupMessages, 
    loading: groupMessagesLoading,
    hasMore,
    loadingMore,
    loadMoreMessages
  } = useGroupMessages(activeGroupConversationId, {
    initialLimit: 10,
    loadMoreLimit: 10,
    enablePagination: true
  });
  
  // Message input state
  const [messageText, setMessageText] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  
  // Reply state
  const [replyToMessage, setReplyToMessage] = useState<MessageType | null>(null);
  
  // UI state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);

  
  // Scroll state
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  
  // Highlight state
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  
  // Search state
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const prevMessagesLengthRef = useRef<number>(0);
  
  // Hooks for functionality
  const { theme } = useConversationTheme(activeGroupConversationId || '');
  
  const {
    sendGroupTextMessage,
    sendGroupMessageWithImages,
    sendGroupReplyMessage,
    sendGroupReplyWithImages,
  } = useSendGroupMessage(activeGroupConversationId || '');
  
  // Hook to mark messages as read
  const {
    unreadCount,
    markAsRead,
    incrementUnread,
    handleInputFocus,
    handleInputBlur,
  } = useGroupUnreadCount(activeGroupConversationId || '');
  
  const { 
    isTyping, 
    handleFocus: handleTypingFocus, 
    handleBlur: handleTypingBlur, 
    registerInputRef 
  } = useTypingStatus(activeGroupConversationId);

  // Combined handlers for both typing status and unread count
  const handleInputFocusEvent = useCallback(() => {
    console.log('🎯 GROUP handleInputFocusEvent called for group:', activeGroupConversationId);
    handleTypingFocus();
    handleInputFocus();
  }, [handleTypingFocus, handleInputFocus, activeGroupConversationId]);

  const handleInputBlurEvent = useCallback(() => {
    handleTypingBlur();
    handleInputBlur();
  }, [handleTypingBlur, handleInputBlur]);
  
  const {
    pinnedGroupConversations,
    pinGroupConversation,
    unpinGroupConversation,
    isGroupConversationPinned,
  } = usePinGroupConversation();
  
  const {
    searchResults,
    loading: searchLoading,
    error: searchError,
    searchMessages,
    clearSearch: clearSearchResults,
  } = useSearchGroupMessages();
  
  // Hook to manage pinned messages in group chat
  const { 
    pinnedMessages, 
    pinGroupMessage, 
    unpinGroupMessage, 
    isGroupMessagePinned 
  } = usePinGroupMessage(activeGroupConversationId || '');
  
  // Message sending functions
  const handleSendGroupMessage = useCallback(async () => {
    console.log('=== GROUP MESSAGE SEND STARTED ===');
    console.log('activeGroupConversationId:', activeGroupConversationId);
    console.log('messageText:', messageText);
    console.log('selectedImages:', selectedImages);
    
    if (!activeGroupConversationId || (!messageText.trim() && selectedImages.length === 0)) {
      console.log('Validation failed - missing conversation ID or message content');
      return;
    }

    const currentUserId = localStorage.getItem('user_id');
    console.log('currentUserId:', currentUserId);
    
    if (!currentUserId) {
      console.error('User not logged in');
      return;
    }

    try {
      console.log('Attempting to send message...');
      
      if (replyToMessage) {
        console.log('Sending reply message...');
        if (selectedImages.length > 0) {
          await sendGroupReplyWithImages(messageText, selectedImages, {
            messageId: replyToMessage.id,
            text: replyToMessage.text,
            senderId: replyToMessage.senderId
          });
        } else {
          await sendGroupReplyMessage(messageText, {
            messageId: replyToMessage.id,
            text: replyToMessage.text,
            senderId: replyToMessage.senderId
          });
        }
        setReplyToMessage(null);
      } else {
        if (selectedImages.length > 0) {
          console.log('Sending message with images...');
          await sendGroupMessageWithImages(messageText, selectedImages);
        } else {
          console.log('Sending text message...');
          const messageData = {
            senderId: currentUserId,
            text: messageText,
            timestamp: Date.now()
          };
          console.log('Message data:', messageData);
          await sendGroupTextMessage(messageData);
        }
      }
      
      console.log('Message sent successfully!');
      setMessageText('');
      setSelectedImages([]);
      setShouldScrollToBottom(true);
    } catch (error) {
      console.error('Error sending group message:', error);
    }
  }, [
    activeGroupConversationId,
    messageText,
    selectedImages,
    replyToMessage,
    sendGroupTextMessage,
    sendGroupMessageWithImages,
    sendGroupReplyMessage,
    sendGroupReplyWithImages
  ]);
  
  // File handling functions
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, []);
  
  // Handle paste image from clipboard
  const handlePasteImage = useCallback((files: File[]) => {
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
  }, [t]);
  
  const handleRemoveImage = useCallback((index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  const handleOpenFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  // Reply functions
  const handleReplyToMessage = useCallback((message: MessageType) => {
    setReplyToMessage(message);
    messageInputRef.current?.focus();
  }, []);
  
  const handleCancelReply = useCallback(() => {
    setReplyToMessage(null);
  }, []);
  
  // Pin functions
  const handleTogglePinConversation = useCallback(async (id: string) => {
    try {
      if (isGroupConversationPinned(id)) {
        await unpinGroupConversation(id);
      } else {
        await pinGroupConversation(id);
      }
    } catch (error) {
      console.error('Error toggling pin group conversation:', error);
    }
  }, [isGroupConversationPinned, pinGroupConversation, unpinGroupConversation]);
  
  // Handle pin/unpin group message
    const handleTogglePinMessage = useCallback(async (messageId: string) => {
        console.log('handleTogglePinMessage called with messageId:', messageId);
        try {
            const isPinned = isGroupMessagePinned(messageId);
            console.log('Message is currently pinned:', isPinned);
            
            if (isPinned) {
                console.log('Unpinning message...');
                await unpinGroupMessage(messageId);
                toast.success('Đã bỏ ghim tin nhắn');
            } else {
                console.log('Pinning message...');
                await pinGroupMessage(messageId);
                toast.success('Đã ghim tin nhắn');
            }
        } catch (error) {
            console.error('Error toggling pin message:', error);
            toast.error('Không thể thực hiện thao tác ghim tin nhắn');
        }
    }, [isGroupMessagePinned, pinGroupMessage, unpinGroupMessage]);
  
  // Search functions
  const handleMessageSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (messageSearchQuery.trim() && activeGroupConversationId) {
      searchMessages(messageSearchQuery, activeGroupConversationId);
    }
  }, [messageSearchQuery, activeGroupConversationId, searchMessages]);

  // Handle clear search - reset both query and results
  const clearSearch = useCallback(() => {
    setMessageSearchQuery('');
    clearSearchResults();
  }, [clearSearchResults]);

  // Handle search result click - scroll to message and highlight
  const handleSearchResultClick = useCallback((messageId: string) => {
    setHighlightedMessageId(messageId);
    const ref = messageRefs.current[messageId];
    if (ref && ref.scrollIntoView) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => setHighlightedMessageId(null), 2000);
  }, []);
  
  // Scroll functions
  const handleScroll = useCallback(() => {
    if (!messageContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    setIsScrolledUp(!isAtBottom);
    setShouldScrollToBottom(isAtBottom);

    // Infinite scroll: Load more messages when scrolled near the top
    if (scrollTop < 100 && hasMore && !loadingMore && !groupMessagesLoading) {
      loadMoreMessages();
    }
  }, [hasMore, loadingMore, groupMessagesLoading, loadMoreMessages]);
  
  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
      setIsScrolledUp(false);
    }
  }, []);
  
  // Utility functions
  const getInitials = useCallback((name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);
  
  const formatMessageTime = useCallback((timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  }, []);
  
  const handleEmojiClick = useCallback((emoji: any) => {
    setMessageText(prev => prev + emoji.emoji);
    setShowEmojiPicker(false);

    // Focus back on input after selecting emoji
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, []);
  
  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
  }, []);
  
  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageContainerRef.current && groupMessages.length > 0) {
      // Scroll to bottom only if:
      // 1. We explicitly set shouldScrollToBottom flag (conversation change, send message)
      // 2. First load of conversation (prevMessagesLengthRef.current === 0)
      // 3. New message arrived AND user is not scrolled up (at the bottom)
      const isNewMessage = groupMessages.length > prevMessagesLengthRef.current;
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

      // Update the previous messages length reference
      prevMessagesLengthRef.current = groupMessages.length;
    }
  }, [groupMessages, shouldScrollToBottom, scrollToBottom, isScrolledUp]);
  
  // Get current user ID
  const currentUserId = localStorage.getItem('user_id') || '';

  // Render reply preview
  const renderReplyPreview = useCallback(() => {
    if (!replyToMessage) return null;

    const replyUser = replyToMessage.senderId === currentUserId 
      ? { full_name: 'You' } 
      : groupUsers[replyToMessage.senderId];

    return React.createElement('div', {
      className: "bg-gray-50 border-l-4 border-blue-500 p-3 mx-2 mb-2 rounded"
    }, 
      React.createElement('div', {
        className: "flex justify-between items-start"
      },
        React.createElement('div', {
          className: "flex-1"
        },
          React.createElement('div', {
            className: "text-xs text-blue-600 font-medium mb-1"
          }, `Replying to ${replyUser?.full_name || 'Unknown'}`),
          React.createElement('div', {
            className: "text-sm text-gray-600 truncate"
          }, replyToMessage.text || 'Image')
        ),
        React.createElement('button', {
          onClick: handleCancelReply,
          className: "ml-2 text-gray-400 hover:text-gray-600"
        },
          React.createElement('svg', {
            className: "w-4 h-4",
            fill: "currentColor",
            viewBox: "0 0 20 20"
          },
            React.createElement('path', {
              fillRule: "evenodd",
              d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
              clipRule: "evenodd"
            })
          )
        )
      )
    );
  }, [replyToMessage, currentUserId, groupUsers, handleCancelReply]);

  return {
    // Group conversation state
    activeGroupConversationId,
    setActiveGroupConversationId,
    
    // Group data
    groupConversations,
    groupUsers,
    groupLoading,
    
    // Active group data
    activeGroup,
    groupMessages,
    groupMessagesLoading,
    hasMore,
    loadingMore,
    
    // Current user
    currentUserId,
    
    // Message functionality
    messageText,
    setMessageText,
    selectedImages,
    setSelectedImages,
    
    // Message actions
    handleSendGroupMessage,
    handleFileChange,
    handlePasteImage,
    handleRemoveImage,
    handleOpenFileDialog,
    
    // Reply functionality
    replyToMessage,
    setReplyToMessage,
    handleReplyToMessage,
    handleCancelReply,
    
    // UI state
    showEmojiPicker,
    setShowEmojiPicker,
    showThemeSelector,
    setShowThemeSelector,
    showMessageSearch,
    setShowMessageSearch,
    showPinnedMessages,
    setShowPinnedMessages,

    
    // Refs
    fileInputRef,
    messageContainerRef,
    messageInputRef,
    emojiPickerRef,
    messageRefs,
    
    // Theme
    theme,
    
    // Typing status
    isTyping,
    handleInputFocusEvent,
    handleInputBlurEvent,
    registerInputRef,
    
    // Pin functionality
    handleTogglePinConversation,
    isGroupConversationPinned,
    
    // Pin message functionality
    pinnedMessages,
    handleTogglePinMessage,
    pinGroupMessage,
    unpinGroupMessage,
    isGroupMessagePinned,
    
    // Search functionality
    messageSearchQuery,
    setMessageSearchQuery,
    searchResults,
    searchLoading,
    searchError,
    handleMessageSearchSubmit,
    handleSearchResultClick,
    clearSearch,
    
    // Scroll functionality
    shouldScrollToBottom,
    setShouldScrollToBottom,
    isScrolledUp,
    handleScroll,
    scrollToBottom,
    
    // Highlight functionality
    highlightedMessageId,
    setHighlightedMessageId,
    
    // Utility functions
    getInitials,
    formatMessageTime,
    handleEmojiClick,
    handleMessageChange,
    
    // Render functions
    renderReplyPreview,
    
    // Unread count functionality
    unreadCount,
    markAsRead,
    incrementUnread,
    handleInputFocus,
    handleInputBlur,
    
    // Group-specific functions
    getGroupMembers,
    getActiveMembers,
    isAdmin,
    isModerator,
    loadMoreMessages,
  };
}