import React, { useEffect, useState } from 'react';
import { ConversationType } from '../../types/chat/ConversationType';
import { UserResponse } from '../../types/auth/auth.types';
import { useUnreadCount } from '../../hooks/chat/useUnreadCount';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { PushPin as PinIcon } from '@mui/icons-material';

interface ConversationItemProps {
  conversation: ConversationType;
  users: Record<string, UserResponse>;
  isActive: boolean;
  isPinned: boolean;
  onSelect: (id: string) => void;
  onUnhideLastMessage?: () => void;
  onDeleteConversation?: (id: string) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  users,
  isActive,
  isPinned,
  onSelect,
  onUnhideLastMessage,
  onDeleteConversation,
}) => {
  const { t } = useAppTranslate('chat');
  // Sử dụng hook để đếm tin nhắn chưa đọc
  const { unreadCount } = useUnreadCount(conversation.id);
  const [displayCount, setDisplayCount] = useState(0);

  // Cập nhật số tin nhắn chưa đọc khi unreadCount thay đổi
  useEffect(() => {
    setDisplayCount(unreadCount);
  }, [unreadCount]);

  const currentUserId = localStorage.getItem('user_id');
  if (!currentUserId) return null;

  // Lấy ID của người dùng khác trong hội thoại
  const otherUserId = Object.keys(conversation.members).find(
    id => id !== currentUserId
  );

  if (!otherUserId) return null;

  // Lấy thông tin người dùng từ danh sách users
  const otherUser = users[otherUserId];

  // Tên hiển thị
  const displayName =
    otherUser?.full_name || otherUser?.email || 'Unknown User';

  // Lấy chữ cái đầu tiên của tên để hiển thị khi không có avatar
  const initial = displayName?.charAt(0)?.toUpperCase() || 'U';

  // Format thời gian tin nhắn cuối cùng
  const formatLastMessageTime = (timestamp?: number): string => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();

    // Nếu cùng ngày, chỉ hiển thị giờ
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // Nếu trong vòng 7 ngày, hiển thị tên ngày
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    if (date > weekAgo) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }

    // Còn lại hiển thị ngày/tháng
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  };

  return (
    <div
      className={`flex items-center p-2 rounded-lg mb-1 cursor-pointer relative ${isActive ? 'bg-[#e6f7f9]' : 'hover:bg-gray-50'}`}
      onClick={() => onSelect(conversation.id)}
      style={{ paddingRight: 40 }}
    >
      {/* Pin indicator */}
      {isPinned && (
        <div className="absolute top-0 right-0 w-4 h-4 flex items-center justify-center bg-[#21b4ca] text-white rounded-full">
          <PinIcon sx={{ fontSize: 10 }} />
        </div>
      )}

      {/* Avatar */}
      <div className="relative">
        {otherUser?.avatar_url ? (
          <img
            src={otherUser.avatar_url}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#21b4ca] text-white flex items-center justify-center font-medium">
            {initial}
          </div>
        )}

        {/* Online status indicator - Tạm thời comment lại vì chưa có trạng thái online */}
        {/* {conversation.members[otherUserId]?.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )} */}
      </div>

      {/* Conversation details */}
      <div className="ml-3 flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <h3 className="font-medium truncate">{displayName}</h3>
          <span className="text-xs text-gray-500">
            {formatLastMessageTime(conversation.lastMessage?.createdAt)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          {/* Last message preview */}
          <p className="text-sm text-gray-500 truncate">
            {(() => {
              const lastMsg: any = conversation.lastMessage;
              if (lastMsg?.deleted) return t('message_deleted');
              if (
                lastMsg?.hiddenBy &&
                Array.isArray(lastMsg.hiddenBy) &&
                lastMsg.hiddenBy.includes(currentUserId)
              ) {
                return (
                  <>
                    <span style={{ verticalAlign: 'middle' }}>
                      <svg
                        style={{
                          display: 'inline',
                          verticalAlign: 'middle',
                          cursor: 'pointer',
                        }}
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        onClick={onUnhideLastMessage}
                      >
                        <path
                          d="M1 12C2.73 7.61 7.61 4 12 4s9.27 3.61 11 8c-1.73 4.39-6.61 8-11 8S2.73 16.39 1 12z"
                          stroke="#21b4ca"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          stroke="#21b4ca"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span style={{ marginLeft: 4 }}>{t('message_hidden')}</span>
                  </>
                );
              }

              // Lấy tên người gửi tin nhắn cuối
              const getSenderName = () => {
                if (!lastMsg?.senderId) return '';
                
                // Nếu là tin nhắn của người dùng hiện tại
                if (lastMsg.senderId === currentUserId) {
                  return t('you') + ': ';
                }
                
                // Nếu là tin nhắn của người khác (trong chat 1-1 sẽ là người kia)
                const senderUser = users[lastMsg.senderId];
                if (senderUser) {
                  const senderName = senderUser.full_name || senderUser.email || 'Unknown';
                  return senderName + ': ';
                }
                
                return '';
              };

              const senderPrefix = getSenderName();

              if (lastMsg?.images && lastMsg.images.length > 0) {
                // Thêm emoji ảnh phía trước
                const imageText = `🖼️ ${lastMsg.images.length > 1 ? lastMsg.images.length + ' ' + t('photo') : '1 ' + t('photo')}${lastMsg.text ? ' - ' + lastMsg.text : ''}`;
                return senderPrefix + imageText;
              }
              
              const messageText = conversation.lastMessage?.text || '';
              return messageText ? senderPrefix + messageText : '';
            })() || t('start_chatting')}
          </p>

          {/* Unread indicator */}
          {displayCount > 0 && (
            <div className="bg-[#21b4ca] text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center ml-1 px-1">
              {displayCount > 99 ? '99+' : displayCount}
            </div>
          )}
        </div>
      </div>

      {/* Delete icon */}
      {onDeleteConversation && (
        <button
          onClick={e => {
            e.stopPropagation();
            onDeleteConversation(conversation.id);
          }}
          className="p-1 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600 absolute right-2 top-[70%] -translate-y-1/2"
          title={t('delete_conversation')}
          style={{ zIndex: 2 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ConversationItem;
