import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Shield, UserPlus, Trash2, Crown, ChevronRight, Lock, Eye, Edit3, Zap } from 'lucide-react';
import {
  TaskRolePreset,
  TaskPermissionType,
  TaskMemberPermission,
} from '../../types/workspace-task/workspace-task.types';
import Modal from 'react-modal';

interface TaskMemberPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle?: string;
  workspaceMembers: Array<{ _id: string; full_name: string; email: string; avatar_url?: string }>;
  currentUserPermissions: TaskMemberPermission | null;
  onGrantPermission: (memberId: string, role: TaskRolePreset) => Promise<void>;
  onTransferOwnership: (newOwnerId: string) => Promise<void>;
  onRemovePermission: (memberId: string) => Promise<void>;
  taskMembers: TaskMemberPermission[];
}

const TaskMemberPermissionModal: React.FC<TaskMemberPermissionModalProps> = ({
  isOpen,
  onClose,
  taskId,
  taskTitle,
  workspaceMembers,
  currentUserPermissions,
  onGrantPermission,
  onTransferOwnership,
  onRemovePermission,
  taskMembers,
}) => {
  const { t } = useTranslation('workspace-task');
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<TaskRolePreset>(TaskRolePreset.VIEWER);
  const [error, setError] = useState<string | null>(null);

  const roleDescriptions: Record<TaskRolePreset, string> = {
    [TaskRolePreset.OWNER]: 'Full control over task, can manage permissions and transfer ownership',
    [TaskRolePreset.ADMIN]: 'Can create, edit, delete and assign tasks',
    [TaskRolePreset.EDITOR]: 'Can create and edit tasks assigned to them',
    [TaskRolePreset.VIEWER]: 'Can only view tasks assigned to them',
    [TaskRolePreset.RESTRICTED]: 'Limited access to assigned tasks',
  };

  // Check if current user is owner
  const isOwner = currentUserPermissions?.is_owner ?? false;

  // Get members already with permissions
  const membersWithPermissions = new Set(
    taskMembers.map((m) => m.member_id),
  );

  // Get available members to add (not already assigned)
  const availableMembers = workspaceMembers.filter(
    (m) => !membersWithPermissions.has(m._id),
  );

  const handleGrantPermission = async () => {
    if (!selectedMember) {
      setError('Please select a member');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onGrantPermission(selectedMember, selectedRole);
      setSelectedMember(null);
      setSelectedRole(TaskRolePreset.VIEWER);
    } catch (err) {
      setError('Failed to grant permission');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferOwnership = async (memberId: string) => {
    if (!confirm('Are you sure you want to transfer ownership? You will be demoted to admin.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onTransferOwnership(memberId);
    } catch (err) {
      setError('Failed to transfer ownership');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePermission = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onRemovePermission(memberId);
    } catch (err) {
      setError('Failed to remove permission');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: TaskRolePreset) => {
    switch (role) {
      case TaskRolePreset.OWNER:
        return <Crown className="w-5 h-5" />;
      case TaskRolePreset.ADMIN:
        return <Zap className="w-5 h-5" />;
      case TaskRolePreset.EDITOR:
        return <Edit3 className="w-5 h-5" />;
      case TaskRolePreset.VIEWER:
        return <Eye className="w-5 h-5" />;
      case TaskRolePreset.RESTRICTED:
        return <Lock className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role: TaskRolePreset) => {
    switch (role) {
      case TaskRolePreset.OWNER:
        return 'text-amber-600';
      case TaskRolePreset.ADMIN:
        return 'text-purple-600';
      case TaskRolePreset.EDITOR:
        return 'text-blue-600';
      case TaskRolePreset.VIEWER:
        return 'text-gray-600';
      case TaskRolePreset.RESTRICTED:
        return 'text-red-600';
    }
  };

  const getRoleBgColor = (role: TaskRolePreset) => {
    switch (role) {
      case TaskRolePreset.OWNER:
        return 'bg-amber-50 border-amber-200';
      case TaskRolePreset.ADMIN:
        return 'bg-purple-50 border-purple-200';
      case TaskRolePreset.EDITOR:
        return 'bg-blue-50 border-blue-200';
      case TaskRolePreset.VIEWER:
        return 'bg-gray-50 border-gray-200';
      case TaskRolePreset.RESTRICTED:
        return 'bg-red-50 border-red-200';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Task Member Permissions"
      className="fixed inset-0 flex items-center justify-center z-50"
      overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Apple Style */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-br from-gray-50 to-gray-100/50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Manage Access</h2>
              <p className="text-xs text-gray-600 mt-0.5">{taskTitle}</p>
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
          {error && (
            <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {/* Current Members Section */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-lg">👥</span>
                Members ({taskMembers.length})
              </h3>
            </div>

            {taskMembers.length === 0 ? (
              <div className="py-8 text-center">
                <div className="text-4xl mb-2">🔒</div>
                <p className="text-gray-500 text-sm">No members yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {taskMembers.map((permission) => {
                  const member = workspaceMembers.find((m) => m._id === permission.member_id);
                  if (!member) return null;

                  return (
                    <div
                      key={permission.member_id}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${getRoleBgColor(permission.role)}`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0 overflow-hidden shadow-sm">
                          {member.avatar_url ? (
                            <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{member.full_name?.[0]?.toUpperCase() || '?'}</span>
                          )}
                        </div>

                        {/* Member Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">{member.full_name}</p>
                            {permission.is_owner && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                                <Crown className="w-3 h-3" /> Owner
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 truncate">{member.email}</p>
                        </div>

                        {/* Role Badge */}
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs whitespace-nowrap ${getRoleColor(permission.role)}`}>
                          {getRoleIcon(permission.role)}
                          <span>{permission.role}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      {isOwner && !permission.is_owner && (
                        <div className="flex items-center gap-1 ml-2">
                          {permission.role !== TaskRolePreset.OWNER && (
                            <button
                              onClick={() => handleTransferOwnership(permission.member_id)}
                              title="Transfer ownership"
                              aria-label="Transfer ownership"
                              className="p-2 text-amber-600 hover:bg-amber-100/50 rounded-lg transition-colors duration-200"
                              disabled={loading}
                            >
                              <Crown className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleRemovePermission(permission.member_id)}
                            title="Remove member"
                            aria-label="Remove member"
                            className="p-2 text-red-600 hover:bg-red-100/50 rounded-lg transition-colors duration-200"
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add New Member Section */}
          {isOwner && availableMembers.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-lg">➕</span>
                Add Member
              </h3>

              <div className="space-y-4">
                {/* Member Selection */}
                <div>
                  <label htmlFor="member-select" className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Select Member
                  </label>
                  <select
                    id="member-select"
                    value={selectedMember || ''}
                    onChange={(e) => setSelectedMember(e.target.value || null)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Choose a member...</option>
                    {availableMembers.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.full_name} ({member.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Role & Permissions
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.values(TaskRolePreset).map((role) => (
                      <div
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                          selectedRole === role
                            ? `${getRoleBgColor(role)} border-current shadow-md`
                            : 'bg-white border-gray-200 hover:border-gray-300'
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
                          <div className="absolute top-2 right-2 w-5 h-5 bg-current rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}

                        <div className="flex items-start gap-2">
                          <div className={`p-2 rounded-lg mt-0.5 ${getRoleColor(role)}`}>
                            {getRoleIcon(role)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{role}</p>
                            <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                              {roleDescriptions[role]}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Button */}
                <button
                  onClick={handleGrantPermission}
                  disabled={!selectedMember || loading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Adding...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Add Member
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Info Banner */}
          <div className="m-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <p className="text-xs text-blue-900 leading-relaxed">
              <span className="font-semibold">💡 Tip:</span> Only the task owner can manage permissions. Members can only perform actions allowed by their assigned role.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-3 bg-gray-50/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Icon component
const Users = (props: any) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default TaskMemberPermissionModal;
