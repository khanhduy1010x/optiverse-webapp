import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useConversation } from '../../hooks/chat/useConversation';
import { useMessages } from '../../hooks/chat/useMessages';
import { useSendMessage } from '../../hooks/chat/useSendMessage';
import { useTypingStatus } from '../../hooks/chat/useTypingStatus';
import { useUnreadCount } from '../../hooks/chat/useUnreadCount';
import ConversationList from './ConversationList';
import { UserResponse } from '../../types/auth/auth.types';
import friendService from '../../services/friend.service';
import { Friend } from '../../types/friend/response/friend.response';

interface LocationState {
  friendId?: string;
}

const ChatPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;
  
  // Get conversation list and user information
  const { conversations, users, loading, getOrCreateConversation } = useConversation();
  
  // State to manage active conversation
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  // State to manage message content
  const [messageText, setMessageText] = useState('');
  
  // State to save friends list for creating new conversations
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [showFriendsList, setShowFriendsList] = useState(false);
  
  // Ref for message container to scroll to bottom
  const messageContainerRef = useRef<HTMLDivElement>(null);
  
  // Ref for message input to auto focus
  const messageInputRef = useRef<HTMLInputElement>(null);
  
  // Ref for search container to handle click outside
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Get messages for current conversation
  const { messages, loading: messagesLoading } = useMessages(activeConversationId || '');
  
  // Hook to send new messages
  const sendMessage = useSendMessage(activeConversationId || '');
  
  // Hook to manage typing status
  const { setTyping } = useTypingStatus(activeConversationId || '', '');
  
  // Hook to mark messages as read
  const { markAsRead } = useUnreadCount(activeConversationId || '');

  // Handle click outside search results to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowFriendsList(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter friends based on search query
  useEffect(() => {
    if (!friends.length) {
      setFilteredFriends([]);
      return;
    }

    if (!searchQuery.trim()) {
      setFilteredFriends([]);
      setShowFriendsList(false);
      return;
    }

    setShowFriendsList(true);
    const query = searchQuery.toLowerCase();
    const filtered = friends.filter(
      friend => 
        friend.friendInfo?.full_name?.toLowerCase().includes(query) ||
        friend.friendInfo?.email?.toLowerCase().includes(query) ||
        friend.friend_id.toLowerCase().includes(query)
    );
    
    setFilteredFriends(filtered);
  }, [searchQuery, friends]);

  // Handle receiving friendId from Friend List page and start chat immediately
  useEffect(() => {
    const initiateChatWithFriend = async () => {
      if (state?.friendId) {
        const conversationId = await getOrCreateConversation(state.friendId);
        if (conversationId) {
          setActiveConversationId(conversationId);
          
          // Auto focus on message input
          setTimeout(() => {
            messageInputRef.current?.focus();
          }, 200);
        }
      }
    };
    
    if (state?.friendId) {
      initiateChatWithFriend();
    }
  }, [state, getOrCreateConversation]);

  // Get other user info in chat from friends list instead of users
  const getOtherUserInChat = (): { name: string, avatar: string, email: string } | undefined => {
    if (!activeConversationId) return undefined;
    
    const conversation = conversations.find(conv => conv.id === activeConversationId);
    if (!conversation) return undefined;
    
    const currentUserId = localStorage.getItem('user_id');
    if (!currentUserId) return undefined;
    
    const otherUserId = Object.keys(conversation.members).find(id => id !== currentUserId);
    if (!otherUserId) return undefined;
    
    // Find user info from friends list
    const friend = friends.find(f => f.friend_id === otherUserId);
    if (friend && friend.friendInfo) {
      return {
        name: friend.friendInfo.full_name || friend.friendInfo.email || otherUserId,
        avatar: friend.friendInfo.avatar_url || '',
        email: friend.friendInfo.email || ''
      };
    }
    
    // Fallback: use info from users object
    const userFromAPI = users[otherUserId];
    if (userFromAPI) {
      return {
        name: userFromAPI.full_name || userFromAPI.email || otherUserId,
        avatar: userFromAPI.avatar_url || '',
        email: userFromAPI.email || ''
      };
    }
    
    return {
      name: otherUserId,
      avatar: '',
      email: ''
    };
  };

  // Get friends list to create new conversations
  useEffect(() => {
    const fetchFriends = async () => {
      setFriendsLoading(true);
      try {
        const friendsList = await friendService.viewAllFriends();
        setFriends(friendsList);
      } catch (error) {
        console.error('Error fetching friends list:', error);
      } finally {
        setFriendsLoading(false);
      }
    };
    
    fetchFriends();
  }, []);

  // Scroll to newest messages when messages change
  useEffect(() => {
    if (messageContainerRef.current && messages.length > 0) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
      
      // Mark messages as read when opening conversation
      markAsRead();
    }
  }, [messages, markAsRead]);

  // Handle selecting a conversation
  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setMessageText('');
    markAsRead();
    
    // Auto focus on message input
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 100);
  };

  // Handle selecting a friend to start a new conversation
  const handleStartChat = async (friendId: string) => {
    const conversationId = await getOrCreateConversation(friendId);
    if (conversationId) {
      setActiveConversationId(conversationId);
      setSearchQuery('');
      setShowFriendsList(false);
      
      // Clear notification if user opens new chat
      if (!conversations.some(conv => conv.id === conversationId)) {
        setMessageText(''); // Clear current message if exists
      }
      
      // Auto focus on message input
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 100);
    }
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (!messageText.trim() || !activeConversationId) return;
    
    const currentUserId = localStorage.getItem('user_id');
    if (!currentUserId) return;
    
    sendMessage({
      senderId: currentUserId,
      text: messageText.trim()
    });
    
    setMessageText('');
    setTyping(false);
    
    // Focus back on input after sending message
    messageInputRef.current?.focus();
  };

  // Handle message input change (track typing)
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    setTyping(e.target.value.length > 0);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Focus search input
  const handleSearchFocus = () => {
    if (searchQuery.trim()) {
      setShowFriendsList(true);
    }
  };

  // Get short name to display in avatar if no avatar is available
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Conversation list */}
      <div className="w-1/4 border-r border-gray-200 bg-white p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>
        
        {/* Friends list */}
        <div className="mb-6 relative" ref={searchContainerRef}>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Friends</h3>
          
          {/* Search input */}
          <div className="mb-1">
            <input 
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Search results dropdown - Absolute positioning */}
          {showFriendsList && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {friendsLoading ? (
                <p className="text-sm text-gray-400 p-3">Loading...</p>
              ) : filteredFriends.length > 0 ? (
                <div className="py-1">
                  {filteredFriends.map(friend => {
                    const isActive = activeConversationId && conversations.some(conv => 
                      conv.id === activeConversationId && 
                      conv.members[friend.friend_id]
                    );
                    
                    // Get display info
                    const displayName = friend.friendInfo?.full_name || friend.friendInfo?.email || friend.friend_id;
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
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {initial}
                          </div>
                        )}
                        <span className="text-sm truncate flex-1">{displayName}</span>
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
                  No matching friends found
                </p>
              )}
            </div>
          )}
          
          {/* Placeholder text when empty */}
          {!showFriendsList && (
            <p className="text-sm text-gray-400 mb-3 mt-1">
              Type to search friends
            </p>
          )}
        </div>
        
        {/* Conversation list */}
        <ConversationList
          conversations={conversations}
          users={users}
          loading={loading}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {activeConversationId ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center">
                {(() => {
                  const otherUser = getOtherUserInChat();
                  return (
                    <>
                      {otherUser?.avatar ? (
                        <img
                          src={otherUser.avatar}
                          alt={otherUser.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
                          {getInitials(otherUser?.name || '')}
                        </div>
                      )}
                      <div className="ml-3">
                        <h3 className="font-medium">
                          {otherUser?.name}
                        </h3>
                        {otherUser?.email && (
                          <span className="text-xs text-gray-500">{otherUser.email}</span>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Messages area */}
            <div 
              ref={messageContainerRef}
              className="flex-1 p-4 overflow-y-auto"
            >
              {messagesLoading ? (
                <div className="flex justify-center items-center h-full">
                  <p className="text-gray-500">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <p className="text-gray-500">Start chatting now!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map(message => {
                    const isCurrentUser = message.senderId === localStorage.getItem('user_id');
                    return (
                      <div 
                        key={message.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-xs rounded-lg px-4 py-2 ${
                            isCurrentUser 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          <p>{message.text}</p>
                          <span className="text-xs opacity-70 block text-right">
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Message input bar */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center">
                <input
                  ref={messageInputRef}
                  type="text"
                  value={messageText}
                  onChange={handleMessageChange}
                  placeholder="Type message..."
                  className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <p className="text-gray-500">Select a conversation to start chatting</p>
              <p className="text-gray-400 text-sm mt-2">Or search for a friend to create a new conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;