import React, { useState } from 'react';
import Modal from 'react-modal';
import { useTranslation } from 'react-i18next';
import { X, Shield, AlertCircle } from 'lucide-react';
import workspaceService from '../../services/workspace.service';

interface WorkspaceMemberPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: {
    _id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    role?: string;
  };
  workspaceId: string;
  isOwner: boolean;
  onPermissionUpdated?: () => void;
}

const WorkspaceMemberPermissionModal: React.FC<WorkspaceMemberPermissionModalProps> = ({
  isOpen,
  onClose,
  member,
  workspaceId,
  isOwner,
  onPermissionUpdated,
}) => {
  const { t } = useTranslation('workspace-task');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>(member.role === 'admin' ? 'admin' : 'user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const roleDescriptions = {
    admin: 'Admin - Can manage members, edit workspace settings, and all permissions',
    user: 'Member - Can view and manage tasks assigned to them',
  };

  const getRoleDisplayName = (role: 'admin' | 'user'): string => {
    return role === 'admin' ? 'Admin' : 'Member';
  };

  const handleUpdateRole = async () => {
    if (!isOwner) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await workspaceService.updateMemberRole(workspaceId, member._id, selectedRole);
      setSuccess(true);
      setTimeout(() => {
        onPermissionUpdated?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update member role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Member Permissions"
      className="fixed inset-0 flex items-center justify-center z-50"
      overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Apple Style */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-br from-gray-50 to-gray-100/50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Member Permissions</h2>
              <p className="text-xs text-gray-600 mt-0.5">{member.full_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/80 rounded-xl transition-colors duration-200"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!isOwner ? (
            <div className="m-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>Only workspace owner can manage member permissions</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              {success && (
                <div className="m-6 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-start gap-3">
                  <span className="text-lg">✓</span>
                  <p>Member role updated successfully</p>
                </div>
              )}

              {/* Member Info Card */}
              <div className="m-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span>{member.full_name?.[0]?.toUpperCase() || '?'}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{member.full_name}</p>
                    <p className="text-xs text-gray-600">{member.email}</p>
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div className="px-6 py-4">
                <label className="block text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                  Assign Role
                </label>

                <div className="space-y-3">
                  {(['admin', 'user'] as const).map((role) => (
                    <div
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 transform ${
                        selectedRole === role
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={selectedRole === role}
                        onChange={() => {}}
                        className="absolute opacity-0"
                        aria-label={`Select ${role} role`}
                      />

                      {/* Checkmark */}
                      {selectedRole === role && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-semibold rounded-full px-2 py-1 ${
                              role === 'admin'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {getRoleDisplayName(role)}
                            </p>
                            {role === 'admin' && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{roleDescriptions[role]}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Banner */}
              <div className="m-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-xs text-blue-900 leading-relaxed">
                  <span className="font-semibold">💡 Tip:</span> The workspace owner is automatically assigned the admin role. Admins can manage members and configure workspace settings.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-3 bg-gray-50/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors duration-200"
          >
            Cancel
          </button>
          {isOwner && (
            <button
              onClick={handleUpdateRole}
              disabled={loading || selectedRole === (member.role === 'admin' ? 'admin' : 'user')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium text-sm hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {loading ? 'Updating...' : 'Update Role'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default WorkspaceMemberPermissionModal;
