import React from 'react';
import { ConversationType } from '../../types/chat/ConversationType';
import { UserResponse } from '../../types/auth/auth.types';
import { useUnreadCount } from '../../hooks/chat/useUnreadCount';

interface ConversationItemProps {
    conversation: ConversationType;
    users: Record<string, UserResponse>;
    activeConversationId: string | null;
    onSelectConversation: (conversationId: string) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
    conversation,
    users,
    activeConversationId,
    onSelectConversation
}) => {
    // Sử dụng hook ở đây (đúng chuẩn React)
    const { unreadCount } = useUnreadCount(conversation.id);
    const currentUserId = localStorage.getItem('user_id');

    // Helper function to get other user in conversation
    const getOtherUser = (): UserResponse | undefined => {
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

    // Render last message preview
    const renderLastMessagePreview = () => {
        if (!conversation.lastMessage) {
            return (
                <p className="text-sm text-gray-400 italic">
                    Start new conversation
                </p>
            );
        }

        const isCurrentUserMessage = conversation.lastMessage.senderId === currentUserId;
        return (
            <p className="text-sm text-gray-500 truncate max-w-[180px]">
                {isCurrentUserMessage
                    ? `You: ${conversation.lastMessage.text}`
                    : conversation.lastMessage.text
                }
            </p>
        );
    };

    const otherUser = getOtherUser();

    return (
        <div
            onClick={() => onSelectConversation(conversation.id)}
            className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${activeConversationId === conversation.id
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
                    {renderLastMessagePreview()}

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
};

export default ConversationItem; 