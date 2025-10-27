import { GroupMember } from "../GroupConversationType";
import { GroupMemberUI } from "../GroupMemberType";

export interface ChatHeaderProps {
  textColor: string;
  otherUser: any;
  getInitials: (name: string) => string;
  activeConversationId: string;
  handleTogglePinConversation: (id: string) => void;
  isConversationPinned: (id: string) => boolean;
  showMessageSearch: boolean;
  setShowMessageSearch: (show: boolean) => void;
  showPinnedMessages: boolean;
  setShowPinnedMessages: (show: boolean) => void;
  showThemeSelector: boolean;
  setShowThemeSelector: (show: boolean) => void;
  t: (key: string) => string;
}


export interface ChatSidebarProps {
  // Global search
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  handleGlobalSearch: (e: React.FormEvent) => void;
  isGlobalSearching: boolean;
  globalSearchResults: any[];
  clearGlobalSearch: () => void;
  conversations: any[];
  users: any;
  groupUsers?: any;
  messageRefs: React.MutableRefObject<any>;
  setHighlightedMessageId: (id: string | null) => void;
  handleSelectConversation: (id: string) => void;

  // Friends search
  searchQuery: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearchFocus: () => void;
  showFriendsList: boolean;
  searchContainerRef: React.RefObject<HTMLDivElement>;
  friendsLoading: boolean;
  uniqueFriends: any[];
  activeConversationId: string | null;
  handleStartChat: (friendId: string) => void;
  getInitials: (name: string) => string;

  // Conversation list
  loading: boolean;
  onDeleteConversation: (id: string) => void;
  
  // Group conversations
  groupConversations?: any[];
  onSelectGroupConversation?: (id: string) => void;
  activeGroupConversationId?: string | null;
}

export
interface GroupChatHeaderProps {
  textColor: string;
  groupName: string;
  memberCount: number;
  groupAvatar?: string;
  getInitials: (name: string) => string;
  activeConversationId: string;
  handleTogglePinConversation: (id: string) => void;
  isConversationPinned: (id: string) => boolean;
  showMessageSearch: boolean;
  setShowMessageSearch: (show: boolean) => void;
  showPinnedMessages: boolean;
  setShowPinnedMessages: (show: boolean) => void;
  showThemeSelector: boolean;
  setShowThemeSelector: (show: boolean) => void;

  showGroupSettings?: boolean; // Optional - không bắt buộc cho workspace chat
  setShowGroupSettings?: (show: boolean) => void; // Optional
  t: (key: string) => string;
}


 export interface GroupMembersListProps {
  isOpen: boolean;
  onClose: () => void;
  members: GroupMemberUI[];
  currentUserId: string;
  groupName: string;
  onRemoveMember?: (memberId: string) => void;
  onMakeAdmin?: (memberId: string) => void;
  onRemoveAdmin?: (memberId: string) => void;
  canManageMembers?: boolean;
  getInitials: (name: string) => string;
}

export interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMembers: (memberIds: string[]) => void;
  existingMemberIds: string[];
  groupName: string;
  getInitials: (name: string) => string;
}

export interface SelectNewAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAdmin: (memberId: string) => void;
  members: GroupMemberUI[];
  currentUserId: string;
  groupName: string;
  getInitials: (name: string) => string;
}


export interface ImagePreviewProps {
    images?: File[];
    onRemove: (index: number) => void;
}
//---------------------------CHAT------------------------------------

export interface MessageInputProps {
  messageText: string;
  setMessageText: (text: string) => void;
  handleSendMessage: () => void;
  handleMessageChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  replyToMessage: any;
  renderReplyPreview: () => React.ReactNode;
  handleCancelReply: () => void;
  selectedImages: File[];
  handleOpenFileDialog: () => void;
  handleRemoveImage: (index: number) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  handleEmojiClick: (emojiData: any) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  messageInputRef: React.RefObject<HTMLTextAreaElement>;
  emojiPickerRef: React.RefObject<HTMLDivElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInputFocusEvent: () => void;
  handleInputBlurEvent: () => void;
  registerInputRef: (ref: HTMLTextAreaElement | null) => void;
  handlePasteImage: (files: File[]) => void;
  
  // Group chat props
  isGroupChat?: boolean;
  groupName?: string;
  memberCount?: number;
  
  // Drawing board props
  onOpenDrawingBoard?: () => void;
}
export interface MessageSearchFormProps {
  showMessageSearch: boolean;
  messageSearchQuery: string;
  setMessageSearchQuery: (query: string) => void;
  handleMessageSearchSubmit: (e: React.FormEvent) => void;
  clearSearch: () => void;
  searchLoading: boolean;
  searchError: string | null;
  searchResults: any[];
  messageRefs: React.MutableRefObject<any>;
  setHighlightedMessageId: (id: string | null) => void;
}

export interface NoteMessageProps {
    title: string;
    content: string;
}

export interface ReplyMessageProps {
    replyText: string;
    senderName: string;
    isCurrentUser: boolean;
    onClick?: () => void;
}

export interface ThemeSelectorProps {
    conversationId: string;
    onClose: () => void;
    isOpen: boolean;
}

export interface AudioMessageProps {
    audioUrl: string;
    duration: number;
    isCurrentUser: boolean;
}
export interface AudioRecorderProps {
    onRecordingComplete: (audioBlob: File) => void;
    onCancel: () => void;
}
