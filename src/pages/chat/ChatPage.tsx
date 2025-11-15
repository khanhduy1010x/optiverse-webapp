import React, { useState } from 'react';
import { useChatPage } from '../../hooks/chat/useChatPage';
import { useGroupConversations } from '../../hooks/chat/useGroupConversations';
import { useGroupChatPage } from '../../hooks/chat/useGroupChatPage';
import { useGroupConversationTheme } from '../../hooks/chat/useGroupConversationTheme';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import ChatSidebar from '../../components/chat/ChatSidebar';
import ChatHeader from '../../components/chat/ChatHeader';
import GroupChatHeader from '../../components/chat/GroupChatHeader';
import MessageSearchForm from '../../components/chat/MessageSearchForm';
import MessageInput from '../../components/chat/MessageInput';
import ThemeSelector from '../../components/chat/ThemeSelector';
import GroupThemeSelector from '../../components/chat/GroupThemeSelector';
import MessageItem from './MessageItem.screen';
import GroupSettings from '../../components/group/GroupSettings';
import DrawingBoard from '../../components/chat/DrawingBoard';

import DeleteModal from '../Note/DeleteModal.screen';


const ChatPage: React.FC = () => {
  const { t } = useAppTranslate('chat');

  // Group conversation state
  const [activeGroupConversationId, setActiveGroupConversationId] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<'regular' | 'group'>('regular');
  const [showGroupSettings, setShowGroupSettings] = useState(false);

  // Drawing board state
  const [showDrawingBoard, setShowDrawingBoard] = useState(false);

  // Group conversations hook
  const {
    groupConversations,
    users: groupUsers,
    loading: groupLoading,
    getActiveMembers
  } = useGroupConversations();

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
    renderReplyPreview,
    isConversationPinned,
    registerInputRef,
    renderMessages,
    clearSearch,
  } = useChatPage();

  // Group chat page hook
  const groupChatData = useGroupChatPage(activeGroupConversationId);

  // Group theme hook
  const groupTheme = useGroupConversationTheme(activeGroupConversationId);

  // Get selected group conversation
  const selectedGroupConversation = activeGroupConversationId
    ? groupConversations.find(gc => gc.id === activeGroupConversationId)
    : null;

  // Thêm biến textColor lấy từ theme (sử dụng group theme cho group chat, regular theme cho chat 1-1)
  const currentTheme = chatMode === 'group' ? groupTheme.theme : theme;
  const textColor = currentTheme?.textColor || '#000';

  // Drawing board handlers
  const handleOpenDrawingBoard = () => {
    setShowDrawingBoard(true);
  };

  const handleCloseDrawingBoard = () => {
    setShowDrawingBoard(false);
  };

  const handleSendDrawing = async (imageBlob: Blob) => {
    if (chatMode === 'group' && activeGroupConversationId) {
      // Convert blob to file
      const file = new File([imageBlob], 'drawing.png', { type: 'image/png' });

      // Use group chat's image sending functionality
      const { handleFileChange, handleSendGroupMessage } = groupChatData;

      // Create a fake file input event
      const fakeEvent = {
        target: {
          files: [file]
        }
      } as any;

      // Add the image to selected images
      handleFileChange(fakeEvent);

      // Send the message with image
      setTimeout(() => {
        handleSendGroupMessage();
      }, 100);
    } else if (chatMode === 'regular' && activeConversationId) {
      // Handle 1-1 chat drawing
      const file = new File([imageBlob], 'drawing.png', { type: 'image/png' });

      // Create a fake file input event
      const fakeEvent = {
        target: {
          files: [file]
        }
      } as any;

      // Add the image to selected images
      handleFileChange(fakeEvent);

      // Send the message with image
      setTimeout(() => {
        handleSendMessage();
      }, 100);
    }

    // Close drawing board after sending
    setShowDrawingBoard(false);
  };

  return (
    <div className="flex h-full bg-white">
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
        groupConversations={groupConversations}
        users={users}
        groupUsers={groupUsers}
        messageRefs={messageRefs}
        setHighlightedMessageId={setHighlightedMessageId}
        handleSelectConversation={(conversationId: string) => {
          handleSelectConversation(conversationId);
          setActiveGroupConversationId(null);
          setChatMode('regular');
        }}
        onSelectGroupConversation={(groupId: string) => {
          console.log('=== ChatPage onSelectGroupConversation ===');
          console.log('groupId:', groupId);
          setActiveGroupConversationId(groupId);
          setActiveConversationId(null);
          setChatMode('group');

          // Set flag to scroll to bottom when group conversation changes
          if (groupChatData?.setShouldScrollToBottom) {
            groupChatData.setShouldScrollToBottom(true);
          }

          console.log('ChatPage activeGroupConversationId set to:', groupId);
        }}
        searchQuery={searchQuery}
        handleSearchChange={handleSearchChange}
        handleSearchFocus={handleSearchFocus}
        showFriendsList={showFriendsList}
        searchContainerRef={searchContainerRef}
        friendsLoading={friendsLoading}
        uniqueFriends={uniqueFriends}
        activeConversationId={chatMode === 'regular' ? activeConversationId : null}
        activeGroupConversationId={chatMode === 'group' ? activeGroupConversationId : null}
        handleStartChat={handleStartChat}
        getInitials={getInitials}
        loading={loading || groupLoading}
        onDeleteConversation={handleDeleteConversation}
        pinnedConversations={pinnedConversations}
        isConversationPinned={isConversationPinned}
        onTogglePinConversation={handleTogglePinConversation}
        formatMessageTime={formatMessageTime}
      />

      {/* Main chat area */}
      <div
        className="flex-1 flex flex-col h-full "
        style={{ color: textColor }}
      >
        {chatMode === 'group' && activeGroupConversationId ? (
          <>
            {/* Group Chat Header */}
            <GroupChatHeader
              textColor={groupTheme.theme?.textColor || '#000'}
              groupName={groupConversations.find(gc => gc.id === activeGroupConversationId)?.name || 'Group Chat'}
              memberCount={Object.values(groupConversations.find(gc => gc.id === activeGroupConversationId)?.groupMembers || {}).filter(member => member.status === 'active').length}
              groupAvatar={groupConversations.find(gc => gc.id === activeGroupConversationId)?.avatar}
              activeConversationId={activeGroupConversationId || ''}
              handleTogglePinConversation={() => groupChatData?.handleTogglePinConversation(activeGroupConversationId || '')}
              isConversationPinned={groupChatData?.isGroupConversationPinned || (() => false)}
              showMessageSearch={groupChatData?.showMessageSearch || false}
              setShowMessageSearch={groupChatData?.setShowMessageSearch || (() => { })}
              showPinnedMessages={showPinnedMessages}
              setShowPinnedMessages={setShowPinnedMessages}
              showThemeSelector={showThemeSelector}
              setShowThemeSelector={setShowThemeSelector}

              showGroupSettings={showGroupSettings}
              setShowGroupSettings={setShowGroupSettings}
              t={t}
            />

            {/* Group Message Search Form */}
            <MessageSearchForm
              showMessageSearch={groupChatData?.showMessageSearch || false}
              messageSearchQuery={groupChatData?.messageSearchQuery || ''}
              setMessageSearchQuery={groupChatData?.setMessageSearchQuery || (() => { })}
              handleMessageSearchSubmit={groupChatData?.handleMessageSearchSubmit || (() => { })}
              clearSearch={groupChatData?.clearSearch || (() => { })}
              searchLoading={groupChatData?.searchLoading || false}
              searchError={groupChatData?.searchError || null}
              searchResults={groupChatData?.searchResults || []}
              messageRefs={groupChatData?.messageRefs || {}}
              setHighlightedMessageId={groupChatData?.setHighlightedMessageId || (() => { })}
            />

            {/* Group Chat Content Container */}
            <div className="flex-1 flex min-h-0 relative">
              {/* Group Chat Content */}
              <div className="flex-1 flex flex-col h-full">
                {/* Group Pinned messages */}
                {groupChatData?.pinnedMessages && groupChatData.pinnedMessages.length > 0 && (
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
                        {groupChatData.pinnedMessages.map(message => {
                          const sender = groupChatData.groupUsers?.[message.senderId];
                          return (
                            <div
                              key={message.id}
                              className="bg-white rounded-lg p-2 shadow-sm"
                            >
                              <div className="flex justify-between items-start">
                                <div className="text-xs font-medium text-gray-700">
                                  {message.senderId === groupChatData.currentUserId
                                    ? t('you')
                                    : sender?.full_name || sender?.email || t('user')}
                                </div>
                                <button
                                  onClick={() => groupChatData.unpinGroupMessage(message.id)}
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
                              <div className="text-sm text-gray-800 mt-1">
                                {message.text}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {groupChatData.formatMessageTime(message.timestamp)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Group Chat Messages */}
                <div
                  ref={groupChatData?.messageContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                  onScroll={groupChatData?.handleScroll}
                  style={{
                    backgroundColor: groupTheme.theme?.backgroundColor || 'transparent',
                    backgroundImage: groupTheme.theme?.backgroundUrl
                      ? `url(${groupTheme.theme.backgroundUrl})`
                      : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: groupTheme.theme?.textColor || '#000',
                  }}
                >
                  {groupChatData?.searchLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <p className="text-gray-500">{t('loading_messages')}</p>
                    </div>
                  ) : (groupChatData?.searchResults || []).length > 0 ? (
                    // Hiển thị kết quả tìm kiếm group chat
                    <div className="space-y-3">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-500">
                          {t('found_results', { count: (groupChatData?.searchResults || []).length })}
                        </p>
                        <button
                          onClick={groupChatData?.clearSearch || (() => { })}
                          className="text-xs text-[#21b4ca] hover:underline"
                        >
                          {t('clear_search_results')}
                        </button>
                      </div>
                      {(groupChatData?.searchResults || []).map(message => {
                        const isCurrentUser = message.senderId === groupChatData?.currentUserId;
                        const sender = groupChatData?.groupUsers?.[message.senderId];
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} items-center`}
                          >
                            <div
                              className={`max-w-xs rounded-lg px-4 py-2 ${isCurrentUser
                                  ? 'bg-[#21b4ca] text-white'
                                  : 'bg-gray-200 text-gray-800'
                                }`}
                            >
                              {!isCurrentUser && (
                                <p className="text-xs font-semibold mb-1 text-gray-600">
                                  {message.senderInfo?.full_name || sender?.full_name || 'Unknown User'}
                                </p>
                              )}
                              <p className="break-words">{message.text}</p>
                              <div className="flex justify-end items-center mt-1 gap-1">
                                <span
                                  className={`text-xs ${isCurrentUser ? 'text-white opacity-70' : 'text-gray-500'}`}
                                >
                                  {groupChatData?.formatMessageTime ? groupChatData.formatMessageTime(message.timestamp).time : ''}
                                </span>
                                <span
                                  className={`text-xs ${isCurrentUser ? 'text-white opacity-60' : 'text-gray-400'}`}
                                >
                                  •
                                </span>
                                <span
                                  className={`text-xs ${isCurrentUser ? 'text-white opacity-70' : 'text-gray-500'}`}
                                >
                                  {groupChatData?.formatMessageTime ? groupChatData.formatMessageTime(message.timestamp).date : ''}
                                </span>
                                {/* Icon kính lúp để đi đến tin nhắn gốc */}
                                <button
                                  onClick={() => {
                                    if (groupChatData?.clearSearch) {
                                      groupChatData.clearSearch();
                                      setTimeout(() => {
                                        if (groupChatData?.handleSearchResultClick) {
                                          groupChatData.handleSearchResultClick(message.id);
                                        }
                                      }, 100);
                                    }
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
                  ) : (groupChatData?.groupMessages || []).length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                      <p className="text-gray-500">{t('start_chatting_now')}</p>
                    </div>
                  ) : (
                    // Hiển thị tin nhắn bình thường
                    <>
                      {/* Loading indicator for loading more messages */}
                      {groupChatData?.loadingMore && (
                        <div className="flex justify-center py-4">
                          <div className="flex items-center space-x-2 text-gray-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                            <span className="text-sm">Loading more messages...</span>
                          </div>
                        </div>
                      )}

                      {groupChatData?.groupMessages?.map((message) => (
                        <MessageItem
                          key={message.id}
                          message={message}
                          conversationId={activeGroupConversationId || ''}
                          isCurrentUser={message.senderId === groupChatData.currentUserId}
                          onPin={groupChatData.handleTogglePinMessage}
                          onReply={groupChatData.handleReplyToMessage}
                          users={groupChatData.groupUsers || {}}
                          messageRef={(el: HTMLDivElement | null) => {
                            if (el && groupChatData?.messageRefs) {
                              groupChatData.messageRefs.current[message.id] = el;
                            }
                          }}
                          highlight={groupChatData?.highlightedMessageId === message.id}
                          isGroupChat={true}
                          showSenderName={true}
                          textColor={groupTheme.theme?.textColor || '#000'}
                        />
                      ))}
                    </>
                  )}
                </div>

                {/* Group Chat Input */}
                <div className="border-t border-gray-200">
                  <MessageInput
                    messageText={groupChatData?.messageText || ''}
                    setMessageText={groupChatData?.setMessageText}
                    handleMessageChange={groupChatData?.handleMessageChange}
                    handleSendMessage={groupChatData?.handleSendGroupMessage}
                    handleFileChange={groupChatData?.handleFileChange}
                    handleRemoveImage={groupChatData?.handleRemoveImage}
                    handleOpenFileDialog={groupChatData?.handleOpenFileDialog}
                    handleEmojiClick={groupChatData?.handleEmojiClick}
                    selectedImages={groupChatData?.selectedImages || []}
                    showEmojiPicker={groupChatData?.showEmojiPicker}
                    setShowEmojiPicker={groupChatData?.setShowEmojiPicker}
                    replyToMessage={groupChatData?.replyToMessage}
                    handleCancelReply={groupChatData?.handleCancelReply}
                    renderReplyPreview={groupChatData?.renderReplyPreview}
                    registerInputRef={groupChatData?.registerInputRef}
                    fileInputRef={groupChatData?.fileInputRef}
                    messageInputRef={groupChatData?.messageInputRef}
                    emojiPickerRef={groupChatData?.emojiPickerRef}
                    handleInputFocusEvent={groupChatData?.handleInputFocusEvent}
                    handleInputBlurEvent={groupChatData?.handleInputBlurEvent}
                    handlePasteImage={groupChatData?.handlePasteImage}
                    isGroupChat={true}
                    groupName={selectedGroupConversation?.name}
                    memberCount={selectedGroupConversation?.members?.length}
                    onOpenDrawingBoard={handleOpenDrawingBoard}
                  />
                </div>
              </div>

              {/* Group Theme Selector */}
              <GroupThemeSelector
                conversationId={activeGroupConversationId || ''}
                onClose={() => setShowThemeSelector(false)}
                isOpen={showThemeSelector}
              />
            </div>
          </>
        ) : activeConversationId ? (
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
                          >
                            <div
                              className={`max-w-xs rounded-lg px-4 py-2 ${isCurrentUser
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
                    handlePasteImage={handlePasteImage}
                    registerInputRef={registerInputRef}
                    renderReplyPreview={renderReplyPreview}
                    emojiPickerRef={emojiPickerRef}
                    onOpenDrawingBoard={handleOpenDrawingBoard}
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

      {/* Group Settings Modal */}
      {showGroupSettings && activeGroupConversationId && (
        <GroupSettings
          isOpen={showGroupSettings}
          onClose={() => setShowGroupSettings(false)}
          groupId={activeGroupConversationId}
          groupData={{
            id: activeGroupConversationId,
            name: groupConversations.find(gc => gc.id === activeGroupConversationId)?.name || 'Group Chat',
            description: groupConversations.find(gc => gc.id === activeGroupConversationId)?.description || '',
            avatar: groupConversations.find(gc => gc.id === activeGroupConversationId)?.avatar || '',
            createdAt: groupConversations.find(gc => gc.id === activeGroupConversationId)?.createdAt || Date.now(),
            createdBy: groupConversations.find(gc => gc.id === activeGroupConversationId)?.createdBy || '',
            memberCount: getActiveMembers(activeGroupConversationId),
            settings: {
              allowMemberInvite: groupConversations.find(gc => gc.id === activeGroupConversationId)?.settings?.allowMemberInvite || true,
              allowMemberLeave: groupConversations.find(gc => gc.id === activeGroupConversationId)?.settings?.allowMemberLeave || true,
              requireApprovalToJoin: groupConversations.find(gc => gc.id === activeGroupConversationId)?.settings?.requireApprovalToJoin || false,
              maxMembers: groupConversations.find(gc => gc.id === activeGroupConversationId)?.settings?.maxMembers || 100,
              isPublic: groupConversations.find(gc => gc.id === activeGroupConversationId)?.settings?.isPublic || false
            }
          }}
        />
      )}

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
        onOpenActionModal={() => { }}
      />

      {/* Drawing Board */}
      {showDrawingBoard && (
        <DrawingBoard
          isOpen={showDrawingBoard}
          onClose={handleCloseDrawingBoard}
          onSendDrawing={handleSendDrawing}
        />
      )}
    </div>
  );
};

export default ChatPage;
