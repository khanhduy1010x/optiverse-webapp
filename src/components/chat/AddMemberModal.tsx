import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FriendService from '../../services/friend.service';
import { Friend } from '../../types/friend/response/friend.response';
import { AddMemberModalProps } from '../../types/chat/props/component.props';

interface FriendWithInfo extends Friend {
  userInfo?: {
    full_name?: string;
    email: string;
    avatar_url?: string;
  };
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onAddMembers,
  existingMemberIds,
  groupName,
  getInitials,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [friends, setFriends] = useState<FriendWithInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch friends when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchFriends();
    }
  }, [isOpen]);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const friendsList = await FriendService.viewAllFriends();
      
      // Filter out friends who are already in the group
      const availableFriends = friendsList.filter(friend => 
        !existingMemberIds.includes(friend.friend_id)
      );

      // Map to include user info from friendInfo
      const friendsWithInfo: FriendWithInfo[] = availableFriends.map(friend => ({
        ...friend,
        userInfo: {
          full_name: friend.friendInfo?.full_name,
          email: friend.friendInfo?.email || '',
          avatar_url: friend.friendInfo?.avatar_url
        }
      }));

      setFriends(friendsWithInfo);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };



  const filteredFriends = friends.filter(friend =>
    (friend.userInfo?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (friend.userInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const handleToggleFriend = (friendId: string) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSubmit = async () => {
    if (selectedFriends.length === 0) return;

    setIsSubmitting(true);
    try {
      await onAddMembers(selectedFriends);
      setSelectedFriends([]);
      setSearchTerm('');
      onClose();
    } catch (error) {
      console.error('Error adding members:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedFriends([]);
    setSearchTerm('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('chat:add_members')}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {t('chat:add_members_to')} {groupName}
          </p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder={t('chat:search_friends')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#21b4ca] focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#21b4ca]"></div>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm
                  ? t('chat:no_matching_friends')
                  : t('chat:no_friends_to_add')}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFriends.map((friend) => (
                <div
                  key={friend.friend_id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedFriends.includes(friend.friend_id)
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleToggleFriend(friend.friend_id)}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {/* Avatar */}
                    {friend.userInfo?.avatar_url ? (
                      <img
                        src={friend.userInfo.avatar_url}
                        alt={friend.userInfo.full_name || friend.userInfo.email}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#21b4ca] text-white flex items-center justify-center font-medium text-sm">
                        {getInitials(friend.userInfo?.full_name || friend.userInfo?.email || '')}
                      </div>
                    )}

                    {/* Friend info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {friend.userInfo?.full_name || friend.userInfo?.email}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {friend.userInfo?.email}
                      </p>
                    </div>
                  </div>

                  {/* Checkbox */}
                  <div className="ml-3">
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(friend.friend_id)}
                      onChange={() => handleToggleFriend(friend.friend_id)}
                      className="h-4 w-4 text-[#21b4ca] focus:ring-[#21b4ca] border-gray-300 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              {t('chat:cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedFriends.length === 0 || isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#21b4ca] hover:bg-[#1a9bb0] disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('chat:adding')}
                </div>
              ) : (
                `${t('chat:add')} (${selectedFriends.length})`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;