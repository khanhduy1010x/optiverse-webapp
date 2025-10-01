import React from 'react';
import { useTranslation } from 'react-i18next';
import { GroupMembersListProps } from '../../types/chat/props/component.props';
import { GroupMemberUI } from '../../types/chat';



const GroupMembersList: React.FC<GroupMembersListProps> = ({
  isOpen,
  onClose,
  members,
  currentUserId,
  groupName,
  onRemoveMember,
  onMakeAdmin,
  onRemoveAdmin,
  canManageMembers = false,
  getInitials,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleRemoveMember = (memberId: string) => {
    if (onRemoveMember && window.confirm(t('chat:confirm_remove_member'))) {
      onRemoveMember(memberId);
    }
  };

  const handleToggleAdmin = (member: GroupMemberUI) => {
    if (member.is_admin && onRemoveAdmin) {
      if (window.confirm(t('chat:confirm_remove_admin'))) {
        onRemoveAdmin(member.id);
      }
    } else if (!member.is_admin && onMakeAdmin) {
      if (window.confirm(t('chat:confirm_make_admin'))) {
        onMakeAdmin(member.id);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('chat:group_members')}
            </h2>
            <button
              onClick={onClose}
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
            {groupName} • {members.length} {t('chat:members')}
          </p>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={member.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#21b4ca] text-white flex items-center justify-center font-medium text-sm">
                        {getInitials(member.full_name || member.email)}
                      </div>
                    )}
                    {/* Online indicator */}
                    {member.is_online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  {/* Member info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.full_name || member.email}
                        {member.id === currentUserId && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({t('chat:you')})
                          </span>
                        )}
                      </p>
                      {member.is_admin && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {t('chat:admin')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {member.email}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {canManageMembers && member.id !== currentUserId && (
                  <div className="flex items-center space-x-2">
                    {/* Toggle admin button */}
                    <button
                      onClick={() => handleToggleAdmin(member)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title={
                        member.is_admin
                          ? t('chat:remove_admin')
                          : t('chat:make_admin')
                      }
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>

                    {/* Remove member button */}
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title={t('chat:remove_member')}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            {t('chat:close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupMembersList;