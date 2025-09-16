import React from 'react';
import { useChatPage } from '../../hooks/chat/useChatPage';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import ChatSidebar from '../../components/chat/ChatSidebar';
import ChatHeader from '../../components/chat/ChatHeader';
import MessageSearchForm from '../../components/chat/MessageSearchForm';
import MessageInput from '../../components/chat/MessageInput';
import ThemeSelector from '../../components/chat/ThemeSelector';
import MessageItem from './MessageItem.screen';
import {
  Reply as ReplyIcon,
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
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

const ChatPage: React.FC = () => {
  const { t } = useAppTranslate('chat');
  const {
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
    renderReplyPreview,
    isConversationPinned,
    registerInputRef,
    renderMessages,
    clearSearch,
  } = useChatPage();










  // Thêm biến textColor lấy từ theme
  const textColor = theme?.textColor || '#000';

  return (
    <div className="flex h-screen bg-white">
      <style
        dangerouslySetInnerHTML={{
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
          left: 50%;
          bottom: 15%;
          transform: translateX(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: #21b4ca;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
          transition: all 0.2s cubic-bezier(.4,0,.2,1);
          z-index: 30;
          opacity: 0;
          border: 2px solid white;
        }
        
        .scroll-to-bottom-btn.visible {
          opacity: 1;
        }
        
        .scroll-to-bottom-btn:hover {
          background-color: #1a9db0;
          box-shadow: 0 3px 12px rgba(0,0,0,0.22);
          transform: translateX(-50%) scale(1.05);
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
          position: relative;
        }
      `,
        }}
      />
      {/* Sidebar */}
      <ChatSidebar
        globalSearchQuery={globalSearchQuery}
        setGlobalSearchQuery={setGlobalSearchQuery}
        handleGlobalSearch={handleGlobalSearch}
        isGlobalSearching={isGlobalSearching}
        globalSearchResults={globalSearchResults}
        clearGlobalSearch={clearGlobalSearch}
        conversations={conversations}
        users={users}
        messageRefs={messageRefs}
        setHighlightedMessageId={setHighlightedMessageId}
        handleSelectConversation={handleSelectConversation}
        searchQuery={searchQuery}
        handleSearchChange={handleSearchChange}
        handleSearchFocus={handleSearchFocus}
        showFriendsList={showFriendsList}
        searchContainerRef={searchContainerRef}
        friendsLoading={friendsLoading}
        uniqueFriends={uniqueFriends}
        activeConversationId={activeConversationId}
        handleStartChat={handleStartChat}
        getInitials={getInitials}
        loading={loading}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* Main chat area */}
      <div
        className="flex-1 flex flex-col h-full "
        style={{ color: textColor }}
      >
        {activeConversationId ? (
          <>
            {/* Header */}
            <ChatHeader
              activeConversationId={activeConversationId}
              otherUser={getOtherUserInChat()}
              getInitials={getInitials}
              isConversationPinned={isConversationPinned}
              handleTogglePinConversation={handleTogglePinConversation}
              showMessageSearch={showMessageSearch}
              setShowMessageSearch={setShowMessageSearch}
              showPinnedMessages={showPinnedMessages}
              setShowPinnedMessages={setShowPinnedMessages}
              showThemeSelector={showThemeSelector}
              setShowThemeSelector={setShowThemeSelector}
              textColor={textColor}
              t={t}
            />

            {/* Message Search Form */}
            <MessageSearchForm
              showMessageSearch={showMessageSearch}
              messageSearchQuery={messageSearchQuery}
              setMessageSearchQuery={setMessageSearchQuery}
              handleMessageSearchSubmit={handleMessageSearchSubmit}
              clearSearch={clearSearch}
              searchLoading={searchLoading}
              searchError={searchError}
              searchResults={searchResults}
              messageRefs={messageRefs}
              setHighlightedMessageId={setHighlightedMessageId}
            />

            {/* Pinned messages */}
            {pinnedMessages.length > 0 && (
              <div
                className={`border-b border-gray-200 bg-[#e6f7f9] transition-all duration-300 ${showPinnedMessages ? 'max-h-60 overflow-y-auto' : 'max-h-12 overflow-hidden'}`}
              >
                <div
                  className="p-2 flex items-center justify-between cursor-pointer"
                  onClick={() => setShowPinnedMessages(!showPinnedMessages)}
                >
                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1 text-[#21b4ca]"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.6 3.54l1.4 1.4-3.53 3.53a2 2 0 001.41 3.42h4.12a2 2 0 001.41-3.42L10.4 4.94l1.4-1.4a1 1 0 000-1.42 1 1 0 00-1.4 0L8.4 3.4l-2-2a1 1 0 00-1.4 0 1 1 0 000 1.42l2 2-2.76 2.76a2 2 0 000 2.82 2 2 0 002.83 0L8.4 8.4l1.2 1.2v6.4a1 1 0 002 0v-6.4l1.2-1.2 1.33 1.33a2 2 0 002.83 0 2 2 0 000-2.82L14.2 4.6l2-2a1 1 0 000-1.42 1 1 0 00-1.4 0l-2 2-1.2-1.2a1 1 0 00-1.4 0 1 1 0 00-.6 1.56z" />
                    </svg>
                    {showPinnedMessages
                      ? t('pinned_messages')
                      : t('pinned_messages')}
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${showPinnedMessages ? 'transform rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                {showPinnedMessages && (
                  <div className="px-3 pb-2 space-y-2">
                    {pinnedMessages.map(message => {
                      const isCurrentUser =
                        message.senderId === localStorage.getItem('user_id');
                      return (
                        <div
                          key={message.id}
                          className="bg-white rounded-lg p-2 shadow-sm"
                        >
                          <div className="flex justify-between items-start">
                            <div className="text-xs font-medium text-gray-700">
                              {message.senderId ===
                              localStorage.getItem('user_id')
                                ? t('you')
                                : getOtherUserInChat()?.full_name ||
                                  getOtherUserInChat()?.email ||
                                  t('user')}
                            </div>
                            <button
                              onClick={() => unpinMessage(message.id)}
                              className="text-gray-400 hover:text-red-500"
                              title={t('unpin')}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                          <p className="text-sm my-1 break-words">
                            {message.text}
                          </p>
                          <div className="flex justify-end items-center gap-1">
                            <span className="text-xs text-gray-500">
                              {formatMessageTime(message.createdAt).time}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
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

            <div className="flex-1 flex min-h-0 relative ">
              <div
                className={`scroll-to-bottom-btn ${isScrolledUp ? 'visible' : ''}`}
                onClick={scrollToBottom}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
              {/* Chat content */}
              <div className="flex-1 flex flex-col h-full ">
                {/* Messages area */}
                <div
                  ref={messageContainerRef}
                  className="flex-1 p-4 overflow-y-auto custom-scrollbar-3 overflow-x-hidden messages-container"
                  onScroll={handleScroll}
                  style={{
                    backgroundColor: theme?.backgroundColor || 'transparent',
                    backgroundImage: theme?.backgroundUrl
                      ? `url(${theme.backgroundUrl})`
                      : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: textColor,
                  }}
                >
                  {messagesLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <p className="text-gray-500">{t('loading_messages')}</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    // Hiển thị kết quả tìm kiếm
                    <div className="space-y-3">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-500">
                          {t('found_results', { count: searchResults.length })}
                        </p>
                        <button
                          onClick={clearSearch}
                          className="text-xs text-[#21b4ca] hover:underline"
                        >
                          {t('clear_search_results')}
                        </button>
                      </div>
                      {searchResults.map(message => {
                        const isCurrentUser =
                          message.senderId === localStorage.getItem('user_id');
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} items-center`}
                            style={{ cursor: 'pointer' }}
                          >
                            <div
                              className={`max-w-xs rounded-lg px-4 py-2 ${
                                isCurrentUser
                                  ? 'bg-[#21b4ca] text-white'
                                  : 'bg-gray-200 text-gray-800'
                              }`}
                            >
                              <p className="break-words">{message.text}</p>
                              <div className="flex justify-end items-center mt-1 gap-1">
                                <span
                                  className={`text-xs ${isCurrentUser ? 'text-white opacity-70' : 'text-gray-500'}`}
                                >
                                  {formatMessageTime(message.createdAt).time}
                                </span>
                                <span
                                  className={`text-xs ${isCurrentUser ? 'text-white opacity-60' : 'text-gray-400'}`}
                                >
                                  •
                                </span>
                                <span
                                  className={`text-xs ${isCurrentUser ? 'text-white opacity-70' : 'text-gray-500'}`}
                                >
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
                                  title={t('go_to_original_message')}
                                  type="button"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-blue-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                                    />
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
                      <p className="text-gray-500">{t('start_chatting_now')}</p>
                    </div>
                  ) : (
                    <>{renderMessages()}</>
                  )}

                  {/* Nút cuộn xuống */}
                </div>

                {/* Hiển thị trạng thái đang nhập - đặt trước input */}
                <div className="border-t border-gray-200 ">
                  {activeConversationId && isTyping && (
                    <div className="typing-indicator px-4 py-2 text-sm text-gray-500 bg-gray-50 border-b border-gray-100 rounded-t-lg shadow-sm">
                      <div className="flex items-center">
                        <span className="w-6 h-6 rounded-full bg-[#21b4ca] text-white flex items-center justify-center text-xs mr-2">
                          {getInitials(getOtherUserInChat()?.full_name || 'U')}
                        </span>
                        <span className="mr-2">
                          {getOtherUserInChat()?.full_name || t('user')}{' '}
                          {t('is_typing')}
                        </span>
                        <span className="typing-animation">
                          <span>.</span>
                          <span>.</span>
                          <span>.</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Input gửi tin nhắn */}
                  <MessageInput
                    replyToMessage={replyToMessage}
                    handleCancelReply={handleCancelReply}
                    selectedImages={selectedImages}
                    handleRemoveImage={handleRemoveImage}
                    fileInputRef={fileInputRef}
                    messageInputRef={messageInputRef}
                    messageText={messageText}
                    handleMessageChange={handleMessageChange}
                    handleInputFocusEvent={handleInputFocusEvent}
                    handleInputBlurEvent={handleInputBlurEvent}
                    showEmojiPicker={showEmojiPicker}
                    setShowEmojiPicker={setShowEmojiPicker}
                    handleEmojiClick={handleEmojiClick}
                    handleSendMessage={handleSendMessage}
                    handleOpenFileDialog={handleOpenFileDialog}
                    handleFileChange={handleFileChange}
                    registerInputRef={registerInputRef}
                    renderReplyPreview={renderReplyPreview}
                    emojiPickerRef={emojiPickerRef}
                    t={t}
                  />
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
              <p className="text-gray-500">{t('select_conversation')}</p>
              <p className="text-gray-400 text-sm mt-2">
                {t('search_friend_new_conversation')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        selectedItem={
          selectedConversation
            ? {
                type: 'file',
                title: t('this_conversation'),
                content: '',
                _id: selectedConversation.id,
                user_id: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : null
        }
        onDelete={confirmDeleteConversation}
        onOpenActionModal={() => {}}
      />
    </div>
  );
};

export default ChatPage;
