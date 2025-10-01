import React from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';

import { ChatHeaderProps } from '../../types/chat/props/component.props';

const ChatHeader: React.FC<ChatHeaderProps> = ({
  textColor,
  otherUser,
  getInitials,
  activeConversationId,
  handleTogglePinConversation,
  isConversationPinned,
  showMessageSearch,
  setShowMessageSearch,
  showPinnedMessages,
  setShowPinnedMessages,
  showThemeSelector,
  setShowThemeSelector,
  t,
}) => {

  return (
    <div
      className="p-4 border-b border-gray-200 bg-white"
      style={{ color: textColor }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {otherUser && (
            <>
              {otherUser?.avatar_url ? (
                <img
                  src={otherUser.avatar_url}
                  alt={otherUser.full_name || otherUser.email}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#21b4ca] text-white flex items-center justify-center font-medium">
                  {getInitials(
                    otherUser?.full_name || otherUser?.email || ''
                  )}
                </div>
              )}
              <div className="ml-3">
                <h3 className="font-medium">
                  {otherUser?.full_name || otherUser?.email}
                </h3>
                {otherUser?.email && (
                  <span className="text-xs text-gray-500">
                    {otherUser.email}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Pin conversation button */}
          <button
            onClick={() =>
              handleTogglePinConversation(activeConversationId)
            }
            className={`p-2 rounded-full hover:bg-gray-100 ${isConversationPinned(activeConversationId) ? 'text-[#21b4ca]' : 'text-gray-500'}`}
            title={
              isConversationPinned(activeConversationId)
                ? t('unpin_conversation')
                : t('pin_conversation')
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Search messages button */}
          <button
            onClick={() => setShowMessageSearch(!showMessageSearch)}
            className={`p-2 rounded-full hover:bg-gray-100 ${showMessageSearch ? 'text-[#21b4ca]' : 'text-gray-500'}`}
            title={t('search_messages')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Show pinned messages button */}
          <button
            onClick={() => setShowPinnedMessages(!showPinnedMessages)}
            className={`p-2 rounded-full hover:bg-gray-100 ${showPinnedMessages ? 'text-[#21b4ca]' : 'text-gray-500'}`}
            title={t('view_pinned_messages')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.6 3.54l1.4 1.4-3.53 3.53a2 2 0 001.41 3.42h4.12a2 2 0 001.41-3.42L10.4 4.94l1.4-1.4a1 1 0 000-1.42 1 1 0 00-1.4 0L8.4 3.4l-2-2a1 1 0 00-1.4 0 1 1 0 000 1.42l2 2-2.76 2.76a2 2 0 000 2.82 2 2 0 002.83 0L8.4 8.4l1.2 1.2v6.4a1 1 0 002 0v-6.4l1.2-1.2 1.33 1.33a2 2 0 002.83 0 2 2 0 000-2.82L14.2 4.6l2-2a1 1 0 000-1.42 1 1 0 00-1.4 0l-2 2-1.2-1.2a1 1 0 00-1.4 0 1 1 0 00-.6 1.56z" />
            </svg>
          </button>

          {/* Theme button */}
          <button
            onClick={() => setShowThemeSelector(!showThemeSelector)}
            className={`p-2 rounded-full hover:bg-gray-100 ${showThemeSelector ? 'text-[#21b4ca]' : 'text-gray-500'}`}
            title={t('change_theme')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;