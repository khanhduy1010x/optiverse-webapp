import React from 'react';
import { GroupConversationType } from '../../types/chat/GroupConversationType';
import { UserResponse } from '../../types/auth/auth.types';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { usePinGroupConversation } from '../../hooks/chat/usePinGroupConversation';
import { PushPin as PinIcon } from '@mui/icons-material';

interface GroupConversationListProps {
  groupConversations: GroupConversationType[];
  users: Record<string, UserResponse>;
  loading: boolean;
  activeGroupConversationId: string | null;
  onSelectGroupConversation: (groupId: string) => void;
}

const GroupConversationList: React.FC<GroupConversationListProps> = ({
  groupConversations,
  users,
  loading,
  activeGroupConversationId,
  onSelectGroupConversation,
}) => {
  const { t } = useAppTranslate('chat');
  const { pinnedGroupConversations, isGroupConversationPinned } = usePinGroupConversation();

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

  // Sort group conversations by pin status first, then by updated time
  const sortedGroupConversations = [...groupConversations].sort((a, b) => {
    const aIsPinned = isGroupConversationPinned(a.id);
    const bIsPinned = isGroupConversationPinned(b.id);
    
    if (aIsPinned && !bIsPinned) return -1;
    if (!aIsPinned && bIsPinned) return 1;
    
    // If both have same pin status, sort by updated time
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });



  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Empty state
  if (!groupConversations || groupConversations.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
        {t('no_groups_yet')}
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {sortedGroupConversations.map((group) => (
        <div
          key={group.id}
          onClick={() => onSelectGroupConversation(group.id)}
          className={`group flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors relative ${
            activeGroupConversationId === group.id
              ? 'bg-blue-50 border border-blue-200'
              : 'hover:bg-gray-50'
          }`}
        >
          {/* Pin indicator - always visible when pinned */}
          {isGroupConversationPinned(group.id) && (
            <div className="absolute top-0 right-0 w-4 h-4 flex items-center justify-center bg-[#21b4ca] text-white rounded-full">
              <PinIcon sx={{ fontSize: 10 }} />
            </div>
          )}

          {/* Group Avatar */}
          {group.avatar ? (
            <img
              src={group.avatar}
              alt={group.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
              {group.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-900 truncate">
                {group.name}
              </p>
              <span className="text-xs text-gray-500">
                {formatLastMessageTime(group.lastMessage?.createdAt)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              {/* Last message preview */}
              <p className="text-sm text-gray-500 truncate">
                {(() => {
                  const currentUserId = localStorage.getItem('user_id');
                  const lastMsg: any = group.lastMessage;
                  
                  if (!lastMsg) {
                    return `${Object.values(group.groupMembers || {}).filter(member => member.status === 'active').length} ${t('members')}`;
                  }
                  
                  if (lastMsg?.deleted) return t('message_deleted');
                  
                  // Lấy tên người gửi tin nhắn cuối
                  const getSenderName = () => {
                    if (!lastMsg?.senderId) return '';
                    
                    // Nếu là tin nhắn của người dùng hiện tại
                    if (lastMsg.senderId === currentUserId) {
                      return t('you') + ': ';
                    }
                    
                    // Nếu là tin nhắn của người khác trong group
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
                  
                  const messageText = lastMsg?.text || '';
                  return messageText ? senderPrefix + messageText : '';
                })()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupConversationList;