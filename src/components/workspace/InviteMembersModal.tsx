import React, { useState, useEffect } from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { Friend } from '../../types/friend/response/friend.response';
import FriendService from '../../services/friend.service';


interface InviteMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (userIds: string[], message?: string) => Promise<{
    successful: { email: string; requestId: string }[];
    failed: { email: string; reason: string }[];
    summary: { total: number; successful: number; failed: number };
  }>;
  isLoading?: boolean;
  workspaceData?: {
    members?: any[];
    requests?: any[];
    invites?: any[];
    banned?: any[];
  };
}

const InviteMembersModal: React.FC<InviteMembersModalProps> = ({
  isOpen,
  onClose,
  onInvite,
  isLoading = false,
  workspaceData
}) => {
  const { t } = useAppTranslate('workspace');

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [allFriends, setAllFriends] = useState<Friend[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [message, setMessage] = useState('');
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [inviting, setInviting] = useState(false);

  // Load friends when modal opens or workspace data changes
  useEffect(() => {
    if (isOpen) {
      loadFriends();
      // Reset states
      setSearchQuery('');
      setSelectedFriends([]);
      setMessage('');
    }
  }, [isOpen, workspaceData]);

  // Filter friends based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFriends(allFriends);
    } else {
      const filtered = allFriends.filter(friend => {
        const friendInfo = friend.friendInfo;
        const name = friendInfo?.full_name || friendInfo?.email || '';
        const email = friendInfo?.email || '';
        return (
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          email.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      setFilteredFriends(filtered);
    }
  }, [searchQuery, allFriends]);

  // Helper function to check if a friend is eligible for invitation
  const isEligibleForInvitation = (friend: Friend) => {
    const friendUserId = friend.friend_id;
    
    if (!friendUserId || !workspaceData) {
      return true; // If no workspace data, show all friends
    }

    // Check if user is already a member
    const isExistingMember = workspaceData.members?.some(
      (member: any) => member.user_id === friendUserId || member.id === friendUserId
    );

    // Check if user has pending join request
    const hasPendingRequest = workspaceData.requests?.some(
      (request: any) => request.user_id === friendUserId || request.id === friendUserId
    );

    // Check if user already has pending invitation
    const hasPendingInvite = workspaceData.invites?.some(
      (invite: any) => invite.user_id === friendUserId || invite.id === friendUserId
    );

    // Check if user is banned
    const isBanned = workspaceData.banned?.some(
      (banned: any) => banned.user_id === friendUserId || banned.id === friendUserId
    );

    // User is eligible if they are NOT in any of these categories
    return !isExistingMember && !hasPendingRequest && !hasPendingInvite && !isBanned;
  };

  const loadFriends = async () => {
    try {
      setLoadingFriends(true);
      const friends = await FriendService.viewAllFriends();
      console.log('Loaded friends for invite:', friends);
      
      // Filter out ineligible friends
      const eligibleFriends = friends.filter(isEligibleForInvitation);
      
      setAllFriends(eligibleFriends);
      setFilteredFriends(eligibleFriends);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleAddFriend = (event: React.MouseEvent<HTMLButtonElement>) => {
    const friendId = event.currentTarget.getAttribute('data-id');
    const friend = filteredFriends.find(f => f._id === friendId);

    if (friend && !selectedFriends.find(sf => sf._id === friend._id)) {
      setSelectedFriends(prev => [...prev, friend]);
    }
  };

  const handleRemoveFriend = (event: React.MouseEvent<HTMLButtonElement>) => {
    const friendId = event.currentTarget.getAttribute('data-id');
    setSelectedFriends(prev => prev.filter(f => f._id !== friendId));
  };

  const handleSubmit = async () => {
    if (selectedFriends.length === 0) return;

    // Extract friend_ids (the user IDs of the friends)
    const userIds = selectedFriends.map(friend => friend.friend_id).filter(id => id);

    if (userIds.length > 0) {
      try {
        setInviting(true);
        const result = await onInvite(userIds, message.trim() || undefined);

        // Show success message based on result
        if (result.summary.failed === 0) {
          // All successful
          console.log(`${result.summary.successful} friends invited successfully!`);
        } else if (result.summary.successful > 0) {
          // Partial success
          console.log(`${result.summary.successful} friends invited, ${result.summary.failed} failed`);
        } else {
          // All failed
          console.log('Failed to invite friends. Please try again.');
        }

        // Close modal on success
        onClose();
      } catch (error) {
        console.error('Error inviting friends:', error);
      } finally {
        setInviting(false);
      }
    }
  };

  const getFriendDisplayInfo = (friend: Friend) => {
    const friendInfo = friend.friendInfo;
    return {
      name: friendInfo?.full_name || friendInfo?.email || 'Unknown',
      email: friendInfo?.email || '',
      avatar: friendInfo?.avatar_url
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal panel */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('dashboardWorkspace.inviteMembers.title', 'Invite Members')}
            </h3>
            <button
              type="button"
              className="rounded-md px-2 py-1 text-gray-600 hover:bg-gray-100"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-5">
            {/* Search friends */}
            <div className="space-y-3">
              <div className="mb-1">
                <div className="relative w-full h-14 border-2 rounded-xl transition-colors duration-200 border-gray-200 focus-within:border-[#21b4ca]">
                  <input
                    id="friend-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder=" "
                    className="peer absolute inset-0 w-full h-full bg-transparent px-3 py-2 text-gray-900 outline-none"
                  />
                  <label
                    htmlFor="friend-search"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-gray-500 transition-all bg-white px-1 pointer-events-none
                      peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-[#21b4ca]
                      peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:-translate-y-1/2 peer-[&:not(:placeholder-shown)]:text-xs"
                  >
                    {t('dashboardWorkspace.inviteMembers.searchPlaceholder', 'Search friends to invite')}
                  </label>
                </div>
              </div>

              {/* Friends list */}
              <div className="max-h-40 overflow-y-auto custom-scrollbar rounded-md border border-gray-200 divide-y divide-gray-100">
                {loadingFriends ? (
                  <div className="px-3 py-4 text-center text-sm text-gray-500">
                    Loading friends...
                  </div>
                ) : filteredFriends.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-gray-500">
                    {searchQuery ? 'No friends found' : 'No friends available to invite'}
                    <div className="text-xs text-gray-400 mt-1">
                      Friends who are already members, have pending requests, invitations, or are banned are not shown
                    </div>
                  </div>
                ) : (
                  filteredFriends.map((friend) => {
                    const { name, email, avatar } = getFriendDisplayInfo(friend);
                    const isSelected = selectedFriends.find(sf => sf._id === friend._id);

                    return (
                      <div key={friend._id} className="flex items-center justify-between px-3 py-3 hover:bg-gray-50">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                            {avatar ? (
                              <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              name.charAt(0).toUpperCase()
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                            {email && (
                              <p className="text-xs text-gray-500 truncate">{email}</p>
                            )}
                          </div>
                        </div>

                        {/* Add button */}
                        <button
                          type="button"
                          data-id={friend._id}
                          onClick={handleAddFriend}
                          disabled={!!isSelected}
                          className={`ml-3 inline-flex items-center rounded-md border px-3 py-1 text-xs font-medium transition-colors ${isSelected
                            ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                            }`}
                        >
                          {isSelected ? 'Added' : '+ Add'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Selected friends */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Selected ({selectedFriends.length})
                </p>
                {selectedFriends.length === 0 ? (
                  <div className="rounded-md border border-dashed border-gray-300 px-3 py-6 text-center text-sm text-gray-500">
                    {t('dashboardWorkspace.inviteMembers.noSelectedFriends', 'No friends selected yet')}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedFriends.map((friend) => {
                      const { name } = getFriendDisplayInfo(friend);
                      return (
                        <span
                          key={friend._id}
                          className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1 text-sm text-cyan-800"
                        >
                          <span className="truncate max-w-[12rem]">{name}</span>
                          <button
                            type="button"
                            data-id={friend._id}
                            onClick={handleRemoveFriend}
                            className="rounded-full px-1 py-0.5 text-cyan-600 hover:bg-cyan-200 transition-colors"
                            aria-label={`Remove ${name}`}
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Message */}
            <div className="mb-1">
              <div className="relative w-full min-h-20 border-2 rounded-xl transition-colors duration-200 border-gray-200 focus-within:border-[#21b4ca]">
                <textarea
                  id="invite-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder=" "
                  rows={3}
                  className="peer absolute inset-0 w-full h-full bg-transparent px-3 py-2 text-gray-900 outline-none resize-none"
                />
                <label
                  htmlFor="invite-message"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-gray-500 transition-all bg-white px-1 pointer-events-none
                    peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-[#21b4ca]
                    peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:-translate-y-1/2 peer-[&:not(:placeholder-shown)]:text-xs"
                >
                  {t('dashboardWorkspace.inviteMembers.message', 'Invitation message (optional)')}
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-200">
            <button
              type="button"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={onClose}
            >
              {t('dashboardWorkspace.inviteMembers.cancel', 'Cancel')}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={selectedFriends.length === 0 || inviting}
              className={`rounded-md px-4 py-2 text-sm font-medium text-white transition-colors ${selectedFriends.length === 0 || inviting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-cyan-600 hover:bg-cyan-700'
                }`}
            >
              {inviting ? t('dashboardWorkspace.inviteMembers.inviting', 'Inviting...') : `Invite ${selectedFriends.length} friend${selectedFriends.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteMembersModal;