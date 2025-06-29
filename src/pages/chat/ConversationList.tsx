import React from 'react';
import { ConversationType } from '../../types/chat/ConversationType';
import { UserResponse } from '../../types/auth/auth.types';
import ConversationItem from './ConversationItem';
import { usePinConversation } from '../../hooks/chat/usePinConversation';

interface ConversationListProps {
  conversations: ConversationType[];
  users: Record<string, UserResponse>;
  loading: boolean;
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  users,
  loading,
  activeConversationId,
  onSelectConversation
}) => {
  // Sử dụng hook để quản lý hội thoại được ghim
  const { pinnedConversations, isConversationPinned, getPinOrder } = usePinConversation();

  // Sort conversations by pin status first, then by the latest message
  const sortedConversations = [...conversations].sort((a, b) => {
    // Nếu cả hai đều được ghim, sắp xếp theo thứ tự ghim
    if (isConversationPinned(a.id) && isConversationPinned(b.id)) {
      return getPinOrder(a.id) - getPinOrder(b.id);
    }

    // Nếu chỉ một trong hai được ghim, ưu tiên hội thoại được ghim
    if (isConversationPinned(a.id)) return -1;
    if (isConversationPinned(b.id)) return 1;

    // Nếu không được ghim, sắp xếp theo thời gian tin nhắn cuối cùng
    const aLastMessage = a.lastMessage?.createdAt || a.createdAt || 0;
    const bLastMessage = b.lastMessage?.createdAt || b.createdAt || 0;
    return bLastMessage - aLastMessage;
  });

  // Loading state
  if (loading) {
    return (
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-3">Conversations</h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center p-2 rounded-md animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // No conversations
  if (sortedConversations.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-3">Conversations</h3>
        <p className="text-sm text-gray-400 p-2">No conversations yet</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500 mb-3">Conversations</h3>
      <div className="space-y-1">
        {sortedConversations.map(conversation => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            users={users}
            isActive={activeConversationId === conversation.id}
            isPinned={isConversationPinned(conversation.id)}
            pinOrder={getPinOrder(conversation.id)}
            onSelect={onSelectConversation}
          />
        ))}
      </div>
    </div>
  );
};

export default ConversationList; 