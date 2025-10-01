import React, { useState } from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import ConversationList from '../../pages/chat/ConversationList';
import GroupConversationList from './GroupConversationList';
import { useGroupConversations } from '../../hooks/chat/useGroupConversations';
import CreateGroupModal from './group/CreateGroupModal';
import { ChatSidebarProps } from '../../types/chat/props/component.props';


const ChatSidebar: React.FC<ChatSidebarProps> = ({
  globalSearchQuery,
  setGlobalSearchQuery,
  handleGlobalSearch,
  isGlobalSearching,
  globalSearchResults,
  clearGlobalSearch,
  conversations,
  users,
  groupUsers,
  messageRefs,
  setHighlightedMessageId,
  handleSelectConversation,
  searchQuery,
  handleSearchChange,
  handleSearchFocus,
  showFriendsList,
  searchContainerRef,
  friendsLoading,
  uniqueFriends,
  activeConversationId,
  handleStartChat,
  getInitials,
  loading,
  onDeleteConversation,
  groupConversations,
  onSelectGroupConversation,
  activeGroupConversationId,
}) => {
  const { t } = useAppTranslate('chat');
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const { loading: groupLoading } = useGroupConversations();

  return (
    <div className="w-80 p-4 border-r border-gray-200 bg-white overflow-y-auto custom-scrollbar-3">
      <h2 className="text-xl font-semibold mb-4">{t('messages')}</h2>

      {/* Global search */}
      <div className="mb-3">
        <form onSubmit={handleGlobalSearch} className="flex">
          <input
            type="text"
            value={globalSearchQuery}
            onChange={e => setGlobalSearchQuery(e.target.value)}
            placeholder={t('search_all_conversations')}
            className="flex-1 border border-gray-300 rounded-l-lg px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#21b4ca]"
          />
          <button
            type="submit"
            className="bg-[#21b4ca] text-white px-3 py-1 rounded-r-lg text-sm"
            disabled={isGlobalSearching}
          >
            {isGlobalSearching ? t('searching') : t('search')}
          </button>
        </form>
      </div>

      {/* Global search results */}
      {globalSearchResults.length > 0 && (
        <div className="mb-4 border border-gray-200 rounded-lg p-2 bg-[#e6f7f9]">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">
              {t('search_results', { count: globalSearchResults.length })}
            </p>
            <button
              onClick={clearGlobalSearch}
              className="text-xs text-[#21b4ca] hover:underline"
            >
              {t('close')}
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto custom-scrollbar-3">
            {globalSearchResults.map(message => {
              // Đảm bảo message.conversationId tồn tại
              if (!message.conversationId) return null;

              // Tìm thông tin người gửi
              const currentUserId = localStorage.getItem('user_id');
              const conversation = conversations.find(
                conv => conv.id === message.conversationId
              );
              if (!conversation) return null;

              const otherUserId = Object.keys(conversation.members).find(
                id => id !== currentUserId
              );
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
                        ref.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                        });
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
                      <p className="text-xs font-medium">
                        {otherUser?.full_name ||
                          otherUser?.email ||
                          t('user')}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {message.text}
                      </p>
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
        <h3 className="text-sm font-medium text-gray-500 mb-2">
          {t('friends')}
        </h3>

        {/* Search input */}
        <div className="mb-1">
          <input
            type="text"
            placeholder={t('search_friends')}
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
              <p className="text-sm text-gray-400 p-3">{t('loading')}</p>
            ) : uniqueFriends.length > 0 ? (
              <div className="py-1">
                {uniqueFriends.map(friend => {
                  const isActive =
                    activeConversationId &&
                    conversations.some(
                      conv =>
                        conv.id === activeConversationId &&
                        conv.members[friend.friend_id]
                    );

                  // Get display info
                  const displayName =
                    friend.friendInfo?.full_name ||
                    friend.friendInfo?.email ||
                    friend.friend_id;
                  const initial = getInitials(displayName);
                  const avatarUrl = friend.friendInfo?.avatar_url;

                  return (
                    <div
                      key={friend.friend_id}
                      onClick={() => handleStartChat(friend.friend_id)}
                      className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 ${
                        isActive ? 'bg-blue-50' : ''
                      }`}
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            isActive
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {initial}
                        </div>
                      )}
                      <span className="text-sm truncate flex-1">
                        {displayName}
                      </span>
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
                {t('no_matching_friends')}
              </p>
            )}
          </div>
        )}

        {/* Placeholder text when empty */}
        {!showFriendsList && (
          <p className="text-sm text-gray-400 mb-3 mt-1">
            {t('type_to_search_friends')}
          </p>
        )}
      </div>

      {/* Group Conversations Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">{t('groups')}</h3>
          <button
            onClick={() => setShowCreateGroupModal(true)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            title={t('create_group')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
        
        <GroupConversationList
          groupConversations={groupConversations || []}
          users={groupUsers || {}}
          loading={groupLoading}
          activeGroupConversationId={activeGroupConversationId}
          onSelectGroupConversation={onSelectGroupConversation || (() => {})}
        />
      </div>

      {/* Conversation list */}
      <ConversationList
        conversations={conversations}
        users={users}
        loading={loading}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={onDeleteConversation}
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onSuccess={() => {
          setShowCreateGroupModal(false);
          // Group list will automatically update via useGroupConversations hook
        }}
      />
    </div>
  );
};

export default ChatSidebar;