import React from 'react';
import { GroupMembersListProps } from '../../types/group/GroupSettingsType';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const GroupMembersList: React.FC<GroupMembersListProps> = ({
  isOpen,
  onClose,
  groupId,
  members,
  currentUserId,
  isCurrentUserAdmin,
  onRemoveMember,
  onPromoteToAdmin,
  onDemoteFromAdmin
}) => {
  const { t } = useAppTranslate();

  if (!isOpen) return null;

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return t('group:admin');
      case 'moderator':
        return t('group:moderator');
      case 'member':
        return t('group:member');
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'moderator':
        return 'bg-yellow-100 text-yellow-800';
      case 'member':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatJoinDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleMemberAction = (memberId: string, action: 'remove' | 'promote' | 'demote') => {
    if (!isCurrentUserAdmin) return;

    switch (action) {
      case 'remove':
        if (onRemoveMember && window.confirm(t('group:confirm_remove_member'))) {
          onRemoveMember(memberId);
        }
        break;
      case 'promote':
        if (onPromoteToAdmin && window.confirm(t('group:confirm_promote_admin'))) {
          onPromoteToAdmin(memberId);
        }
        break;
      case 'demote':
        if (onDemoteFromAdmin && window.confirm(t('group:confirm_demote_admin'))) {
          onDemoteFromAdmin(memberId);
        }
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('group:group_members')} ({members.length})
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

        {/* Members List */}
        <div className="overflow-y-auto max-h-[60vh]">
          {members.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <p>{t('group:no_members_found')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {members.map((member) => (
                <div key={member.userId} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      {/* Avatar */}
                      {member.userInfo?.avatar_url ? (
                        <img
                          src={member.userInfo.avatar_url}
                          alt={member.userInfo.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#21b4ca] text-white flex items-center justify-center font-medium">
                          {member.userInfo?.full_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}

                      {/* Member Info */}
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {member.userInfo?.full_name || t('group:unknown_user')}
                            {member.userId === currentUserId && (
                              <span className="ml-2 text-xs text-gray-500">({t('group:you')})</span>
                            )}
                          </p>
                          {member.userInfo?.is_online && (
                            <div className="ml-2 w-2 h-2 bg-green-400 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                            {getRoleDisplayName(member.role)}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">
                            {t('group:joined')} {formatJoinDate(member.joinedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Menu */}
                    {isCurrentUserAdmin && member.userId !== currentUserId && (
                      <div className="flex items-center space-x-2">
                        {member.role !== 'admin' && (
                          <button
                            onClick={() => handleMemberAction(member.userId, 'promote')}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            title={t('group:promote_to_admin')}
                          >
                            {t('group:promote')}
                          </button>
                        )}
                        {member.role === 'admin' && (
                          <button
                            onClick={() => handleMemberAction(member.userId, 'demote')}
                            className="text-yellow-600 hover:text-yellow-800 text-xs font-medium"
                            title={t('group:demote_from_admin')}
                          >
                            {t('group:demote')}
                          </button>
                        )}
                        <button
                          onClick={() => handleMemberAction(member.userId, 'remove')}
                          className="text-red-600 hover:text-red-800 text-xs font-medium"
                          title={t('group:remove_member')}
                        >
                          {t('group:remove')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>{t('group:total_members')}: {members.length}</span>
            <span>
              {t('group:active_members')}: {members.filter(m => m.status === 'active').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupMembersList;