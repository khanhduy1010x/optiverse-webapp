import { GroupConversationType } from '../../../types/chat/GroupConversationType';
import { UserResponse } from '../../auth/auth.types';
import { MessageType } from '../MessageType';

export interface UseGroupChatPageReturn {
  // Group conversation state
  activeGroupConversationId: string | null;
  setActiveGroupConversationId: (id: string | null) => void;

  // Group data
  groupConversations: GroupConversationType[];
  groupUsers: Record<string, UserResponse>;
  groupLoading: boolean;
  
  // Active group data
  activeGroup: GroupConversationType | undefined;
  groupMessages: MessageType[];
  groupMessagesLoading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  
  // Current user
  currentUserId: string;
  
  // Group message functionality
  messageText: string;
  setMessageText: (text: string) => void;
  selectedImages: File[];
  setSelectedImages: (images: File[] | ((prev: File[]) => File[])) => void;
  
  // Group message actions
  handleSendGroupMessage: () => Promise<void>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasteImage: (files: File[]) => void;
  handleRemoveImage: (index: number) => void;
  handleOpenFileDialog: () => void;
  
  // Reply functionality
  replyToMessage: MessageType | null;
  setReplyToMessage: (message: MessageType | null) => void;
  handleReplyToMessage: (message: MessageType) => void;
  handleCancelReply: () => void;
  
  // UI state
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  showThemeSelector: boolean;
  setShowThemeSelector: (show: boolean) => void;
  showMessageSearch: boolean;
  setShowMessageSearch: (show: boolean) => void;
  showPinnedMessages: boolean;
  setShowPinnedMessages: (show: boolean) => void;
  showMembersList: boolean;
  setShowMembersList: (show: boolean) => void;
  
  // Refs
  fileInputRef: React.RefObject<HTMLInputElement>;
  messageContainerRef: React.RefObject<HTMLDivElement>;
  messageInputRef: React.RefObject<HTMLInputElement>;
  emojiPickerRef: React.RefObject<HTMLDivElement>;
  messageRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  
  // Theme
  theme: any;
  
  // Typing status
  isTyping: boolean;
  handleInputFocusEvent: () => void;
  handleInputBlurEvent: () => void;
  registerInputRef: (ref: HTMLInputElement | null) => void;
  
  // Pin functionality
  handleTogglePinConversation: (id: string) => void;
  isGroupConversationPinned: (id: string) => boolean;
  
  // Pin message functionality
  pinnedMessages: MessageType[];
  handleTogglePinMessage: (messageId: string) => void;
  pinGroupMessage: (messageId: string) => Promise<boolean>;
  unpinGroupMessage: (messageId: string) => Promise<boolean>;
  isGroupMessagePinned: (messageId: string) => boolean;
  
  // Search functionality
  messageSearchQuery: string;
  setMessageSearchQuery: (query: string) => void;
  searchResults: MessageType[];
  searchLoading: boolean;
  searchError: string | null;
  handleMessageSearchSubmit: (e: React.FormEvent) => void;
  handleSearchResultClick: (messageId: string) => void;
  clearSearch: () => void;
  
  // Scroll functionality
  shouldScrollToBottom: boolean;
  setShouldScrollToBottom: (should: boolean) => void;
  isScrolledUp: boolean;
  handleScroll: () => void;
  scrollToBottom: () => void;
  
  // Highlight functionality
  highlightedMessageId: string | null;
  setHighlightedMessageId: (id: string | null) => void;
  
  // Utility functions
  getInitials: (name: string) => string;
  formatMessageTime: (timestamp: number) => string;
  handleEmojiClick: (emoji: any) => void;
  handleMessageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  
  // Unread count functionality
  unreadCount: number;
  markAsRead: () => Promise<void>;
  incrementUnread: (targetUserId: string) => void;
  handleInputFocus: () => void;
  handleInputBlur: () => void;
  
  // Group-specific functions
  getGroupMembers: (groupId: string) => any[];
  getActiveMembers: (groupId: string) => any[];
  isAdmin: (groupId: string) => boolean;
  isModerator: (groupId: string) => boolean;
  loadMoreMessages: () => void;
}