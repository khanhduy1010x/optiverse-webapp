import React, { useState, useEffect } from 'react';
import { useAppTranslate } from '../../../hooks/useAppTranslate';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import Icon from '../../../components/common/Icon/Icon.component';

export interface Permission {
    key: string;
    label: string;
    description: string;
}

export interface MemberPermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: {
        user_id: string;
        full_name: string;
        email: string;
        avatar_url?: string;
        role: string;
        isOwner?: boolean;
        permissions?: string[];
    };
    currentUserRole: string;
    currentUserPermissions: string[];
    onPromoteAdmin: (userId: string) => void;
    onDemoteAdmin: (userId: string) => void;
    onRemoveUser: (userId: string) => void;
    onBanUser: (userId: string) => void;
    onUpdatePermissions: (userId: string, permissions: string[], action?: 'grant' | 'revoke' | 'set') => void;
}

const MemberPermissionModal: React.FC<MemberPermissionModalProps> = ({
    isOpen,
    onClose,
    member,
    currentUserRole,
    currentUserPermissions,
    onPromoteAdmin,
    onDemoteAdmin,
    onRemoveUser,
    onBanUser,
    onUpdatePermissions,
}) => {
    const { t } = useAppTranslate('workspace');
    // Get current user from Redux store
    const currentUser = useSelector((state: RootState) => state.auth.user);

    console.log('Current user permissions:', member);

    // Check if this modal is for the current user
    const isCurrentUserModal = currentUser && member.user_id === currentUser._id;
    // Available permissions
    const availablePermissions: Permission[] = [
        {
            key: 'RENAME_WORKSPACE',
            label: t('dashboardWorkspace.permissions.renameWorkspace'),
            description: t('dashboardWorkspace.permissions.renameWorkspaceDesc'),
        },
        {
            key: 'EDIT_DESCRIPTION',
            label: t('dashboardWorkspace.permissions.editDescription'),
            description: t('dashboardWorkspace.permissions.editDescriptionDesc'),
        },
        {
            key: 'MANAGE_PASSWORD',
            label: t('dashboardWorkspace.permissions.managePassword'),
            description: t('dashboardWorkspace.permissions.managePasswordDesc'),
        },
        {
            key: 'MANAGE_MEMBERS',
            label: t('dashboardWorkspace.permissions.manageMembers'),
            description: t('dashboardWorkspace.permissions.manageMembersDesc'),
        },
        {
            key: 'ACCEPT_MEMBER',
            label: t('dashboardWorkspace.permissions.acceptMember'),
            description: t('dashboardWorkspace.permissions.acceptMemberDesc'),
        },
        {
            key: 'MANAGE_PERMISSIONS',
            label: t('dashboardWorkspace.permissions.managePermissions'),
            description: t('dashboardWorkspace.permissions.managePermissionsDesc'),
        },
    ];

    const [memberPermissions, setMemberPermissions] = useState<string[]>([]);
    const [currentRole, setCurrentRole] = useState<string>(member.role);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: 'remove' | 'ban' | null;
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: null,
        title: '',
        message: ''
    });

    useEffect(() => {
        if (isOpen) {
            console.log('🔍 Modal opened with member data:', {
                member,
                memberPermissions: member.permissions || []
            });

            const permissions = member.permissions || [];
            setMemberPermissions(permissions);
            setCurrentRole(member.role); // Update current role when modal opens
        }
    }, [isOpen, member.permissions, member.role]);

    useEffect(() => {
        console.log('📊 Member permissions state updated:', memberPermissions);
    }, [memberPermissions]);



    // Check if current user can manage member roles and basic actions (demote/promote, remove, ban)
    const canManageMemberRoles = () => {
        if (member.isOwner) return false;
        if (currentUserRole === 'owner') return true;
        return currentUserRole === 'admin' && currentUserPermissions.includes('MANAGE_MEMBERS');
    };

    // Check if current user can manage permissions
    const canManagePermissions = () => {
        if (member.isOwner) return false;
        if (currentUserRole === 'owner') return true;
        return currentUserRole === 'admin' && currentUserPermissions.includes('MANAGE_PERMISSIONS');
    };

    // Check if current user can grant specific permission
    const canGrantPermission = (permissionKey: string) => {
        if (!canManagePermissions()) return false;

        // Only owner can grant MANAGE_PERMISSIONS
        if (permissionKey === 'MANAGE_PERMISSIONS' && currentUserRole !== 'owner') {
            return false;
        }

        // Only owner can grant MANAGE_NOTES
        if (permissionKey === 'MANAGE_NOTES' && currentUserRole !== 'owner') {
            return false;
        }

        return true;
    };

    // Handle permission toggle
    const handlePermissionToggle = (permissionKey: string) => {
        if (!canGrantPermission(permissionKey)) return;

        if (permissionKey === 'room_permission') {
            // Special handling for room permission toggle
            const hasRoomAdmin = memberPermissions.includes('room_admin');

            if (hasRoomAdmin) {
                // Currently admin, switch to user
                const newPermissions = memberPermissions.filter(p => p !== 'room_admin');
                if (!newPermissions.includes('room_user')) {
                    newPermissions.push('room_user');
                }
                setMemberPermissions(newPermissions);
                onUpdatePermissions(member.user_id, newPermissions);
            } else {
                // Currently user or no room permission, switch to admin
                const newPermissions = memberPermissions.filter(p => p !== 'room_user');
                if (!newPermissions.includes('room_admin')) {
                    newPermissions.push('room_admin');
                }
                setMemberPermissions(newPermissions);
                onUpdatePermissions(member.user_id, newPermissions);
            }
        } else if (permissionKey === 'note_permission') {
            // Special handling for note permission toggle
            const hasNoteAdmin = memberPermissions.includes('note_admin');

            if (hasNoteAdmin) {
                // Currently admin, revoke MANAGE_NOTES permission
                const newPermissions = memberPermissions.filter(p => p !== 'note_admin');
                if (!newPermissions.includes('note_user')) {
                    newPermissions.push('note_user');
                }
                setMemberPermissions(newPermissions);
                onUpdatePermissions(member.user_id, ['MANAGE_NOTES'], 'revoke');
            } else {
                // Currently user or no note permission, grant MANAGE_NOTES
                const newPermissions = memberPermissions.filter(p => p !== 'note_user');
                if (!newPermissions.includes('note_admin')) {
                    newPermissions.push('note_admin');
                }
                setMemberPermissions(newPermissions);
                onUpdatePermissions(member.user_id, ['MANAGE_NOTES'], 'grant');
            }
        } else {
            // Regular permission toggle
            const newPermissions = memberPermissions.includes(permissionKey)
                ? memberPermissions.filter(p => p !== permissionKey)
                : [...memberPermissions, permissionKey];

            setMemberPermissions(newPermissions);
            onUpdatePermissions(member.user_id, newPermissions);
        }
    };

    // Handle role change
    const handleRoleChange = () => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';

        if (currentRole === 'admin') {
            onDemoteAdmin(member.user_id);
        } else {
            onPromoteAdmin(member.user_id);
        }

        // Update local role state immediately for UI feedback
        setCurrentRole(newRole);
    };

    // Handle confirm actions
    const handleRemoveClick = () => {
        setConfirmModal({
            isOpen: true,
            type: 'remove',
            title: t('dashboardWorkspace.memberModal.confirmRemoveTitle'),
            message: t('dashboardWorkspace.memberModal.confirmRemove')
        });
    };

    const handleBanClick = () => {
        setConfirmModal({
            isOpen: true,
            type: 'ban',
            title: t('dashboardWorkspace.memberModal.confirmBanTitle'),
            message: t('dashboardWorkspace.memberModal.confirmBan')
        });
    };

    const handleConfirmAction = () => {
        if (confirmModal.type === 'remove') {
            onRemoveUser(member.user_id);
        } else if (confirmModal.type === 'ban') {
            onBanUser(member.user_id);
        }
        setConfirmModal({ isOpen: false, type: null, title: '', message: '' });
        onClose();
    };

    const handleCancelAction = () => {
        setConfirmModal({ isOpen: false, type: null, title: '', message: '' });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 custom-scrollbar-3">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                            {member.full_name ? member.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <span>
                                    {member.isOwner
                                        ? t('dashboardWorkspace.memberModal.owner')
                                        : currentRole === 'admin'
                                            ? t('dashboardWorkspace.memberModal.admin')
                                            : t('dashboardWorkspace.memberModal.member')}
                                </span>
                                {isCurrentUserModal && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
                                        ({t('dashboardWorkspace.memberModal.you')})
                                    </span>
                                )}
                            </h2>
                            <p className="text-sm text-gray-600 leading-tight">{member.full_name}</p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-5 text-sm overflow-y-auto custom-scrollbar max-h-[80vh]">
                    {/* Role Management */}
                    {canManageMemberRoles() && !member.isOwner && (
                        <div className="space-y-3">
                            <h3 className="text-base font-semibold text-gray-800">{t('dashboardWorkspace.memberModal.roleManagement')}</h3>

                            <button
                                onClick={handleRoleChange}
                                className="w-full flex items-center gap-3 p-3 border border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 rounded-lg transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium text-gray-800">
                                        {currentRole === 'admin'
                                            ? t('dashboardWorkspace.memberModal.demoteToMember')
                                            : t('dashboardWorkspace.memberModal.promoteToAdmin')}
                                    </div>
                                    <div className="text-xs text-gray-600 leading-snug">
                                        {currentRole === 'admin'
                                            ? t('dashboardWorkspace.memberModal.demoteDescription')
                                            : t('dashboardWorkspace.memberModal.promoteDescription')}
                                    </div>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* Permission Management */}
                    {canManagePermissions() && !member.isOwner && (
                        <div className="space-y-3">
                            <h3 className="text-base font-semibold text-gray-800">{t('dashboardWorkspace.memberModal.permissions')}</h3>
                            <p className="text-xs text-gray-600">{t('dashboardWorkspace.memberModal.permissionsDescription')}</p>

                            <div className="space-y-2">
                                {availablePermissions
                                    .filter((permission) => {
                                        if (
                                            permission.key === 'MANAGE_PERMISSIONS' &&
                                            currentUserRole !== 'owner' &&
                                            !currentUserPermissions.includes('MANAGE_MEMBERS')
                                        ) {
                                            return false;
                                        }
                                        return true;
                                    })
                                    .map((permission) => {
                                        const hasPermission = memberPermissions.includes(permission.key);

                                        return (
                                            <div
                                                key={permission.key}
                                                className={`flex items-center justify-between p-3 border border-gray-200 rounded-lg ${!canGrantPermission(permission.key) ? 'opacity-50' : ''
                                                    }`}
                                            >
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-800 text-sm">{permission.label}</div>
                                                    <div className="text-xs text-gray-600">{permission.description}</div>
                                                    {permission.key === 'MANAGE_PERMISSIONS' && currentUserRole !== 'owner' && (
                                                        <div className="text-[11px] text-orange-600 mt-1">
                                                            {t('dashboardWorkspace.permissions.ownerOnlyPermission')}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handlePermissionToggle(permission.key)}
                                                    disabled={!canGrantPermission(permission.key)}
                                                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all duration-200 ${hasPermission ? 'bg-cyan-500' : 'bg-gray-200'
                                                        } ${!canGrantPermission(permission.key) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                >
                                                    <span
                                                        className="inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
                                                        style={{
                                                            transform: hasPermission ? 'translateX(20px)' : 'translateX(2px)',
                                                        }}
                                                    />
                                                </button>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    )}

                    {/* Room Access Management */}
                    {canManagePermissions() && !member.isOwner && (
                        <div className="space-y-3">
                            <h3 className="text-base font-semibold text-gray-800">{t('dashboardWorkspace.memberModal.roomAccess')}</h3>
                            <p className="text-xs text-gray-600">{t('dashboardWorkspace.memberModal.roomAccessDescription')}</p>

                            <div className="space-y-2">
                                {(() => {
                                    const hasRoomAdmin = memberPermissions.includes('room_admin');

                                    return (
                                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-800 text-sm">{t('dashboardWorkspace.permissions.roomPermission')}</div>
                                                <div className="text-xs text-gray-600">{t('dashboardWorkspace.permissions.roomPermissionDesc')}</div>
                                                <div className="text-[11px] text-blue-600 mt-1">
                                                    {hasRoomAdmin
                                                        ? t('dashboardWorkspace.permissions.roomAdminStatus')
                                                        : t('dashboardWorkspace.permissions.roomUserStatus')
                                                    }
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handlePermissionToggle('room_permission')}
                                                disabled={!canGrantPermission('room_permission')}
                                                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all duration-200 ${hasRoomAdmin ? 'bg-cyan-500' : 'bg-gray-200'
                                                    } ${!canGrantPermission('room_permission') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                <span
                                                    className="inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
                                                    style={{
                                                        transform: hasRoomAdmin ? 'translateX(20px)' : 'translateX(2px)',
                                                    }}
                                                />
                                            </button>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    )}

                    {/* Note Access Management */}
                    {canManagePermissions() && !member.isOwner && (
                        <div className="space-y-3">
                            <h3 className="text-base font-semibold text-gray-800">{t('dashboardWorkspace.memberModal.noteAccess')}</h3>
                            <p className="text-xs text-gray-600">{t('dashboardWorkspace.memberModal.noteAccessDescription')}</p>

                            <div className="space-y-2">
                                {(() => {
                                    const hasNoteAdmin = memberPermissions.includes('note_admin');

                                    return (
                                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-800 text-sm">{t('dashboardWorkspace.permissions.notePermission')}</div>
                                                <div className="text-xs text-gray-600">{t('dashboardWorkspace.permissions.notePermissionDesc')}</div>
                                                <div className="text-[11px] text-green-600 mt-1">
                                                    {hasNoteAdmin
                                                        ? t('dashboardWorkspace.permissions.noteAdminStatus')
                                                        : t('dashboardWorkspace.permissions.noteUserStatus')
                                                    }
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handlePermissionToggle('note_permission')}
                                                disabled={!canGrantPermission('MANAGE_NOTES')}
                                                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all duration-200 ${hasNoteAdmin ? 'bg-cyan-500' : 'bg-gray-200'
                                                    } ${!canGrantPermission('MANAGE_NOTES') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                <span
                                                    className="inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
                                                    style={{
                                                        transform: hasNoteAdmin ? 'translateX(20px)' : 'translateX(2px)',
                                                    }}
                                                />
                                            </button>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    )}                    {/* Danger Zone */}
                    {canManageMemberRoles() && !member.isOwner && (
                        <div className="space-y-2 border-t border-gray-100 pt-4">
                            <h3 className="text-base font-semibold text-red-600">{t('dashboardWorkspace.memberModal.dangerZone')}</h3>
                            <button
                                onClick={handleRemoveClick}
                                className="w-full flex items-center gap-2 p-2 border border-red-200 hover:border-red-400 hover:bg-red-50 rounded-lg transition-colors text-red-600 text-sm"
                            >
                                <Icon name="kickUser" size={22} className="!text-red-200" />
                                <span>{t('dashboardWorkspace.memberModal.removeFromWorkspace')}</span>
                            </button>
                            <button
                                onClick={handleBanClick}
                                className="w-full flex items-center gap-2 p-2 border border-red-200 hover:border-red-400 hover:bg-red-50 rounded-lg transition-colors text-red-600 text-sm"
                            >
                                <Icon name="banUser" size={22} className="!text-red-200" />
                                <span>{t('dashboardWorkspace.memberModal.banUser')}</span>
                            </button>
                        </div>
                    )}

                    {/* Current User Notice */}
                    {isCurrentUserModal && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                            <div className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <div>
                                    <h4 className="font-medium text-blue-800">{t('dashboardWorkspace.memberModal.yourProfile')}</h4>
                                    <p className="text-blue-700 mt-1">{t('dashboardWorkspace.memberModal.yourProfileDescription')}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Owner notice */}
                    {member.isOwner && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
                            <div className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.5 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <div>
                                    <h4 className="font-medium text-yellow-800">{t('dashboardWorkspace.memberModal.ownerNotice')}</h4>
                                    <p className="text-yellow-700 mt-1">{t('dashboardWorkspace.memberModal.ownerNoticeDescription')}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* No permission notice */}
                    {!canManageMemberRoles() && !canManagePermissions() && !member.isOwner && (
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                            <div className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-gray-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h4 className="font-medium text-gray-800">{t('dashboardWorkspace.memberModal.noPermission')}</h4>
                                    <p className="text-gray-600 mt-1">{t('dashboardWorkspace.memberModal.noPermissionDescription')}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-medium text-sm"
                    >
                        {t('dashboardWorkspace.memberModal.done')}
                    </button>
                </div>
            </div>

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={handleConfirmAction}
                onCancel={handleCancelAction}
                type="danger"
                confirmText={
                    confirmModal.type === 'remove'
                        ? t('dashboardWorkspace.memberModal.removeFromWorkspace')
                        : t('dashboardWorkspace.memberModal.banUser')
                }
            />
        </div>

    );
};

export default MemberPermissionModal;