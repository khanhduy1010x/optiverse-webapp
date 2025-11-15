import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from 'react-modal';
import { GROUP_CLASSNAMES } from '../../../styles';
import { useGroupOperations } from '../../../hooks/chat/useGroupOperations';
import { useAuthState } from '../../../hooks/useAuthState.hook';
import { useAppTranslate } from '../../../hooks/useAppTranslate';
import { GroupMemberRole } from '../../../types/chat/GroupConversationType';
import friendService from '../../../services/friend.service';
import { SelectedFriend, CreateGroupModalProps } from '../../../types/chat/entities/group.entity';

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuthState();
  const { t } = useAppTranslate('chat');
  const { createGroup, loading } = useGroupOperations();
  
  const [friends, setFriends] = useState<any[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<SelectedFriend[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFriends, setFilteredFriends] = useState<any[]>([]);
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Fetch friends function (similar to chat implementation)
  const fetchFriends = useCallback(async () => {
    try {
      setFriendsLoading(true);
      const friendsList = await friendService.viewAllFriends();
      setFriends(friendsList || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
      setFriends([]);
    } finally {
      setFriendsLoading(false);
    }
  }, []);

  // Reset form when modal opens/closes and fetch friends
  useEffect(() => {
    if (isOpen) {
      setGroupName('');
      setGroupDescription('');
      setSelectedFriends([]);
      setSearchTerm('');
      setFilteredFriends([]);
      setShowFriendsList(false);
      setErrors({});
      fetchFriends(); // Fetch friends when modal opens
    }
  }, [isOpen, fetchFriends]);

  // Filter friends based on search term (similar to chat logic)
  useEffect(() => {
    if (!friends?.length) {
      setFilteredFriends([]);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredFriends([]);
      setShowFriendsList(false);
      return;
    }

    setShowFriendsList(true);
    const query = searchTerm.toLowerCase();
    const filtered = friends.filter(friend => {
      const matchesSearch = 
        friend.friendInfo?.full_name?.toLowerCase().includes(query) ||
        friend.friendInfo?.email?.toLowerCase().includes(query) ||
        friend.friend_id.toLowerCase().includes(query);
      
      const notSelected = !selectedFriends.some(selected => selected.id === friend.friend_id);
      
      return matchesSearch && notSelected;
    });

    setFilteredFriends(filtered);
  }, [searchTerm, friends, selectedFriends]);

  // Create unique friends list from filtered friends
  const uniqueFriends = React.useMemo(() => {
    const seen = new Set();
    return filteredFriends.filter(friend => {
      if (seen.has(friend.friend_id)) {
        return false;
      }
      seen.add(friend.friend_id);
      return true;
    });
  }, [filteredFriends]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!groupName.trim()) {
      newErrors.groupName = 'Tên nhóm không được để trống';
    } else if (groupName.trim().length < 2) {
      newErrors.groupName = 'Tên nhóm phải có ít nhất 2 ký tự';
    } else if (groupName.trim().length > 50) {
      newErrors.groupName = 'Tên nhóm không được quá 50 ký tự';
    }

    if (groupDescription.trim().length > 200) {
      newErrors.groupDescription = 'Mô tả không được quá 200 ký tự';
    }

    if (selectedFriends.length === 0) {
      newErrors.members = 'Vui lòng chọn ít nhất 1 thành viên';
    } else if (selectedFriends.length > 50) {
      newErrors.members = 'Nhóm không được có quá 50 thành viên';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddFriend = (friend: any) => {
    if (selectedFriends.length >= 50) {
      setErrors({ ...errors, members: 'Nhóm không được có quá 50 thành viên' });
      return;
    }

    // Calculate displayName properly from friend data
    const displayName = friend.friendInfo?.full_name || friend.friendInfo?.email || friend.friend_id;

    setSelectedFriends(prev => [...prev, {
      id: friend.friend_id,
      displayName: displayName,
      avatar: friend.friendInfo?.avatar_url
    }]);
    setSearchTerm('');
    
    // Clear members error if exists
    if (errors.members) {
      setErrors(prev => ({ ...prev, members: '' }));
    }
  };

  const handleRemoveFriend = (friendId: string) => {
    setSelectedFriends(prev => prev.filter(friend => friend.id !== friendId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== GROUP CREATION STARTED ===');
    console.log('Form submitted');
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    if (!user) {
      console.log('No user found');
      setErrors({ submit: 'Không thể xác định người dùng hiện tại' });
      return;
    }

    console.log('Current user:', user);
    console.log('Selected friends:', selectedFriends);

    try {
      setErrors({}); // Clear previous errors
      
      // Prepare memberIds array (only selected friends, current user will be added automatically by the service)
      const memberIds = selectedFriends.map(friend => friend.id);
      console.log('Member IDs:', memberIds);

      const groupData = {
        name: groupName.trim(),
        description: groupDescription.trim() || undefined,
        memberIds,
        settings: {
          allowMemberInvite: true,
          allowMemberLeave: true,
          requireApprovalToJoin: false,
          maxMembers: 100,
          isPublic: false
        }
      };

      console.log('Creating group with data:', groupData);
      console.log('Group name:', groupName);
      console.log('Group description:', groupDescription);
      
      console.log('Calling createGroup function...');
      const groupId = await createGroup(groupData);
      
      console.log('Group creation result:', groupId);
      
      if (groupId) {
        console.log('✅ Group created successfully with ID:', groupId);
        if (onSuccess) {
          onSuccess(groupId);
        }
        onClose();
      } else {
        console.error('❌ Failed to create group - no group ID returned');
        setErrors({ submit: 'Không thể tạo nhóm. Vui lòng thử lại.' });
      }
    } catch (error) {
      console.error('❌ Error during group creation:', error);
      setErrors({ submit: 'Có lỗi xảy ra khi tạo nhóm. Vui lòng thử lại.' });
    }
    
    console.log('=== GROUP CREATION ENDED ===');
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className={`${GROUP_CLASSNAMES.modalContainer} w-[500px] max-h-[85vh] flex flex-col`}
      overlayClassName={GROUP_CLASSNAMES.modalOverlay}
      ariaHideApp={false}
    >
      <div className="flex flex-col h-full max-h-[85vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">{t('create_new_group')}</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Group Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('group_name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder={t('group_name_placeholder')}
                className={`${GROUP_CLASSNAMES.inputTransparent} border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.groupName ? 'border-red-500' : ''
                }`}
                disabled={loading}
                maxLength={50}
              />
              {errors.groupName && (
                <p className="mt-1 text-sm text-red-600">{errors.groupName}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">{groupName.length}/50 {t('group_name_length')}</p>
            </div>

            {/* Group Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('group_description')}
              </label>
              <textarea
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder={t('group_description_placeholder')}
                rows={3}
                className={`${GROUP_CLASSNAMES.inputTransparent} border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  errors.groupDescription ? 'border-red-500' : ''
                }`}
                disabled={loading}
                maxLength={200}
              />
              {errors.groupDescription && (
                <p className="mt-1 text-sm text-red-600">{errors.groupDescription}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">{groupDescription.length}/200 {t('group_name_length')}</p>
            </div>

            {/* Add Members */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('add_members_required')} <span className="text-red-500">*</span>
              </label>
              
              {/* Search Friends */}
              <div className="relative mb-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('search_friends') + '...'}
                  className={`${GROUP_CLASSNAMES.inputTransparent} border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10`}
                  disabled={loading}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Search Results */}
              {showFriendsList && (
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg mb-3 shadow-lg">
                  {uniqueFriends.length > 0 ? (
                    uniqueFriends.map(friend => {
                      const displayName = friend.friendInfo?.full_name || friend.friendInfo?.email || friend.friend_id;
                    const initial = displayName?.charAt(0)?.toUpperCase() || 'U';
                      
                      return (
                        <div
                          key={friend.friend_id}
                          onClick={() => handleAddFriend(friend)}
                          className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          {/* Avatar */}
                          {friend.friendInfo?.avatar_url ? (
                            <img
                              src={friend.friendInfo.avatar_url}
                              alt={displayName}
                              className="w-8 h-8 rounded-full object-cover mr-3"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium mr-3 ${friend.friendInfo?.avatar_url ? 'hidden' : ''}`}>
                            {initial}
                          </div>
                          <span className="text-sm text-gray-900">{displayName}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 text-sm text-gray-500 text-center">
                      {t('no_friends_found')}
                    </div>
                  )}
                </div>
              )}

              {/* Selected Members */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    {t('selected_members')} ({selectedFriends.length + 1})
                  </span>
                  {selectedFriends.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedFriends([])}
                      className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                      disabled={loading}
                    >
                      {t('clear_reactions')}
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-28 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
                  {/* Current User (Admin) */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      {/* Avatar */}
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.full_name || user.email}
                      className="w-10 h-10 rounded-full object-cover mr-3"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium mr-3 ${user?.avatar ? 'hidden' : ''}`}>
                    {user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user?.full_name || user?.email || 'Bạn'}</div>
                        <div className="text-xs text-gray-500">{user?.email}</div>
                      </div>
                    </div>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full font-medium">Admin</span>
                  </div>

                  {/* Selected Friends */}
                  {selectedFriends.map(friend => (
                    <div key={friend.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        {/* Avatar */}
                        {friend.avatar ? (
                          <img
                            src={friend.avatar}
                            alt={friend.displayName}
                            className="w-10 h-10 rounded-full object-cover mr-3"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium mr-3 ${friend.avatar ? 'hidden' : ''}`}>
                          {friend.displayName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{friend.displayName || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">Thành viên</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                        disabled={loading}
                        title="Xóa khỏi nhóm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {/* Empty state when no friends selected */}
                  {selectedFriends.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <div className="text-sm">{t('select_at_least_one_member')}</div>
                      <div className="text-xs mt-1">{t('search_friends')}</div>
                    </div>
                  )}
                </div>
              </div>

              {errors.members && (
                <p className="mt-2 text-sm text-red-600">{errors.members}</p>
              )}
            </div>

          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !groupName.trim() || selectedFriends.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? t('creating') : t('create_group_button')}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateGroupModal;