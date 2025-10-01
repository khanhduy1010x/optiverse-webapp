import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGroupConversations } from '../../hooks/chat/useGroupConversations';
import { useGroupOperations } from '../../hooks/chat/useGroupOperations';
import { useGroupEditing } from '../../hooks/group/useGroupEditing';
import GroupMembersList from '../chat/GroupMembersList';
import AddMemberModal from '../chat/AddMemberModal';
import GroupAvatarUpload from './GroupAvatarUpload';
import GroupNameEdit from './GroupNameEdit';
import SelectNewAdminModal from './SelectNewAdminModal';
import { GroupSettingsModalProps } from '../../types/group/GroupSettingsType';
import { GroupMemberRole } from '../../types/chat/GroupConversationType';

const GroupSettings: React.FC<GroupSettingsModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupData
}) => {
  const { t } = useTranslation();
  const [showMembersList, setShowMembersList] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showSelectAdminModal, setShowSelectAdminModal] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const currentUserId = localStorage.getItem('user_id') || '';
  
  // Get members data and admin status using useGroupConversations hook
  const { getGroupMembers, isAdmin } = useGroupConversations();
  const rawMembers = getGroupMembers(groupId);
  const isCurrentUserAdmin = isAdmin(groupId);

  // Map GroupMemberWithInfo to GroupMemberUI format
  const members = rawMembers.map(member => ({
    id: member.userId,
    full_name: member.userInfo?.full_name || 'Unknown User',
    email: member.userInfo?.email || '',
    avatar_url: member.userInfo?.avatar_url,
    is_admin: member.role === 'admin',
    is_online: member.userInfo?.is_online || false
  }));

  // Get group operations for member management
  const { removeMember, promoteToAdmin, updateMemberRole, inviteMembers, leaveGroup } = useGroupOperations();
  
  // Get group editing operations
  const {
    isUploadingAvatar,
    isUpdatingName,
    error: editingError,
    uploadAvatar,
    removeAvatar,
    updateName,
    clearError
  } = useGroupEditing(groupId);

  // Helper function to get user initials
  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') {
      return 'U'; // Default fallback for undefined/null names
    }
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Member management functions
  const handleRemoveMember = async (memberId: string) => {
    try {
      const success = await removeMember({ groupId, userId: memberId });
      if (success) {
        // Refresh members list or show success message
        console.log('Member removed successfully');
      }
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleMakeAdmin = async (memberId: string) => {
    try {
      const success = await promoteToAdmin(groupId, memberId);
      if (success) {
        console.log('Member promoted to admin successfully');
      }
    } catch (error) {
      console.error('Error promoting member:', error);
    }
  };

  const handleRemoveAdmin = async (memberId: string) => {
    try {
      const success = await updateMemberRole({
        groupId,
        userId: memberId,
        newRole: GroupMemberRole.MEMBER
      });
      if (success) {
        console.log('Admin privileges removed successfully');
      }
    } catch (error) {
      console.error('Error removing admin privileges:', error);
    }
  };

  if (!isOpen) return null;

  const handleLeaveGroup = async () => {
    // Check if current user is admin
    if (isCurrentUserAdmin) {
      // Count other admins
      const otherAdmins = members.filter(member => 
        member.is_admin && member.id !== currentUserId
      );
      
      // If no other admins, show select admin modal
      if (otherAdmins.length === 0) {
        setShowSelectAdminModal(true);
        return;
      }
    }

    // Proceed with normal leave group flow
    if (window.confirm('Bạn có chắc chắn muốn rời khỏi nhóm này không?')) {
      setIsLeaving(true);
      try {
        const success = await leaveGroup(groupId);
        if (success) {
          console.log('Left group successfully');
          onClose();
          // Optionally redirect or refresh the page
          window.location.reload();
        } else {
          console.error('Failed to leave group');
          alert('Không thể rời nhóm. Vui lòng thử lại.');
        }
      } catch (error) {
        console.error('Error leaving group:', error);
        alert('Có lỗi xảy ra khi rời nhóm. Vui lòng thử lại.');
      } finally {
        setIsLeaving(false);
      }
    }
  };

  const handleViewMembers = () => {
    setShowMembersList(true);
  };

  const handleAddMembers = () => {
    setShowAddMemberModal(true);
  };

  const handleAddMembersSubmit = async (memberIds: string[]) => {
    try {
      const success = await inviteMembers({
        groupId,
        userIds: memberIds
      });
      if (success) {
        console.log('Members added successfully');
        // Refresh group data if needed
      }
    } catch (error) {
      console.error('Error adding members:', error);
    }
  };

  const handleSelectNewAdmin = async (memberId: string) => {
    try {
      // First, make the selected member admin
      const success = await promoteToAdmin(groupId, memberId);
      if (success) {
        console.log('New admin selected successfully');
        setShowSelectAdminModal(false);
        
        // Now proceed with leaving the group
        setIsLeaving(true);
        const leaveSuccess = await leaveGroup(groupId);
        if (leaveSuccess) {
          console.log('Left group successfully');
          onClose();
          window.location.reload();
        } else {
          console.error('Failed to leave group after selecting new admin');
          alert('Đã chọn admin mới nhưng không thể rời nhóm. Vui lòng thử lại.');
        }
      } else {
        console.error('Failed to promote new admin');
        alert('Không thể chọn admin mới. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error selecting new admin:', error);
      alert('Có lỗi xảy ra khi chọn admin mới. Vui lòng thử lại.');
    } finally {
      setIsLeaving(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      {/* Main Settings Modal */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Cài đặt nhóm
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Group Info Section */}
          <div className="p-6">
            {/* Error Display */}
            {editingError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{editingError}</p>
                <button
                  onClick={clearError}
                  className="text-red-500 hover:text-red-700 text-xs underline mt-1"
                >
                  Đóng
                </button>
              </div>
            )}

            {/* Group Avatar */}
            <div className="mb-6">
              <GroupAvatarUpload
                currentAvatar={groupData.avatar}
                groupName={groupData.name}
                onUpload={uploadAvatar}
                onRemove={removeAvatar}
                isUploading={isUploadingAvatar}
                disabled={!isCurrentUserAdmin}
              />
            </div>

            {/* Group Name */}
            <div className="mb-4">
              <GroupNameEdit
                currentName={groupData.name}
                onUpdate={updateName}
                isUpdating={isUpdatingName}
                disabled={!isCurrentUserAdmin}
              />
            </div>

            {/* Member Count */}
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-500">
                {groupData.memberCount} thành viên
              </p>
            </div>

            {/* Group Description */}
            {groupData.description && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Mô tả nhóm
                </h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {groupData.description}
                </p>
              </div>
            )}

            {/* Group Info */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Thông tin nhóm
              </h4>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="space-y-4">
                  {/* Created Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                          Ngày tạo
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(groupData.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Total Members */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                          Số thành viên
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {groupData.memberCount} thành viên
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Group Type */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                        groupData.settings.isPublic ? 'bg-orange-100' : 'bg-purple-100'
                      }`}>
                        <svg className={`w-4 h-4 ${
                          groupData.settings.isPublic ? 'text-orange-600' : 'text-purple-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {groupData.settings.isPublic ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          )}
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                          Loại nhóm
                        </p>
                        <div className="flex items-center">
                          <p className="text-sm font-semibold text-gray-900 mr-2">
                            {groupData.settings.isPublic ? 'Nhóm công khai' : 'Nhóm riêng tư'}
                          </p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            groupData.settings.isPublic 
                              ? 'bg-orange-100 text-orange-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {groupData.settings.isPublic ? 'Công khai' : 'Riêng tư'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* View Members Button */}
              <button
                onClick={handleViewMembers}
                className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span className="text-gray-700">Xem thành viên</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Add Members Button - Only show for admins */}
              {isCurrentUserAdmin && (
                <button
                  onClick={handleAddMembers}
                  className="w-full flex items-center justify-between p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span className="text-blue-700">Thêm thành viên</span>
                  </div>
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              {/* Leave Group Button */}
              <button
                onClick={handleLeaveGroup}
                disabled={isLeaving}
                className="w-full flex items-center justify-center p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLeaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang rời nhóm...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Rời nhóm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Members List Modal */}
      {showMembersList && (
        <GroupMembersList
          isOpen={showMembersList}
          onClose={() => setShowMembersList(false)}
          members={members}
          currentUserId={currentUserId}
          groupName={groupData.name}
          onRemoveMember={handleRemoveMember}
          onMakeAdmin={handleMakeAdmin}
          onRemoveAdmin={handleRemoveAdmin}
          canManageMembers={isCurrentUserAdmin}
          getInitials={getInitials}
        />
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <AddMemberModal
          isOpen={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
          onAddMembers={handleAddMembersSubmit}
          existingMemberIds={members.map(member => member.id)}
          groupName={groupData.name}
          getInitials={getInitials}
        />
      )}

      {/* Select New Admin Modal */}
      {showSelectAdminModal && (
        <SelectNewAdminModal
          isOpen={showSelectAdminModal}
          onClose={() => setShowSelectAdminModal(false)}
          onSelectAdmin={handleSelectNewAdmin}
          members={members}
          currentUserId={currentUserId}
          groupName={groupData.name}
          getInitials={getInitials}
        />
      )}
    </>
  );
};

export default GroupSettings;