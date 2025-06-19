import React from 'react';
import { ConversationType } from '../../types/chat/ConversationType';
import { UserResponse } from '../../types/auth/auth.types';
import { useUnreadCount } from '../../hooks/chat/useUnreadCount';

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
  // Sort conversations by the latest message
  const sortedConversations = [...conversations].sort((a, b) => {
    const aLastMessage = a.lastMessage?.createdAt || a.createdAt || 0;
    const bLastMessage = b.lastMessage?.createdAt || b.createdAt || 0;
    return bLastMessage - aLastMessage;
  });

  // Helper function to get other user in conversation
  const getOtherUser = (conversation: ConversationType): UserResponse | undefined => {
    const currentUserId = localStorage.getItem('user_id');
    if (!currentUserId) return undefined;
    
    const otherUserId = Object.keys(conversation.members).find(id => id !== currentUserId);
    if (!otherUserId) return undefined;
    
    return users[otherUserId];
  };

  // Function to format timestamp
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this week, show day name
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    if (date > weekAgo) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Get initials from name or email
  const getInitials = (name?: string, email?: string): string => {
    if (name && name.length > 0) {
      return name.charAt(0).toUpperCase();
    }
    if (email && email.length > 0) {
      return email.charAt(0).toUpperCase();
    }
    return '?';
  };

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
        {sortedConversations.map(conversation => {
          const otherUser = getOtherUser(conversation);
          const { unreadCount } = useUnreadCount(conversation.id);
          
          return (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                activeConversationId === conversation.id
                  ? 'bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
            >
              {/* Avatar */}
              {otherUser?.avatar_url ? (
                <img
                  src={otherUser.avatar_url}
                  alt={otherUser.full_name || otherUser.email || 'User'}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
                  {getInitials(otherUser?.full_name, otherUser?.email)}
                </div>
              )}
              
              {/* Conversation info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 truncate">
                    {otherUser?.full_name || otherUser?.email || 'Unknown User'}
                  </h4>
                  {conversation.lastMessage && (
                    <span className="text-xs text-gray-500">
                      {formatTime(conversation.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  {/* Last message preview */}
                  {conversation.lastMessage ? (
                    <p className="text-sm text-gray-500 truncate max-w-[180px]">
                      {conversation.lastMessage.senderId === localStorage.getItem('user_id')
                        ? `You: ${conversation.lastMessage.text}`
                        : conversation.lastMessage.text}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      Start new conversation
                    </p>
                  )}
                  
                  {/* Unread badge */}
                  {unreadCount > 0 && (
                    <span className="inline-block bg-blue-600 text-white text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationList; 