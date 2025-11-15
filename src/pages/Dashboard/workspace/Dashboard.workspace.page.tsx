import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { RootState } from '../../../store';
import PasswordModal from '../../../components/workspace/PasswordModal';
import MemberCard from '../../../components/workspace/MemberCard';
import MemberPermissionModal from './MemberPermissionModal';
import InviteMembersModal from '../../../components/workspace/InviteMembersModal';
import TransferOwnerModal from '../../../components/workspace/TransferOwnerModal';
import ConfirmModal from '../../../components/common/ConfirmModal';
import ToastContainer from '../../../components/common/Toast/ToastContainer';
import useWorkspaceManagement from '../../../hooks/workspace/useDashboard.workspace.hook';
import { useAppTranslate } from '../../../hooks/useAppTranslate';
import { useWorkspaceWebSocket } from '../../../hooks/websocket/useWorkspaceWebSocket';
import { useDashboardWorkspaceEvents } from '../../../hooks/websocket/useDashboardWorkspaceEvents';

const DashboardWorkspacePage: React.FC = () => {
    const { t } = useAppTranslate('workspace');
    const { workspaceId } = useParams<{ workspaceId: string }>();

    const currentUser = useSelector((state: RootState) => state.auth.user);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const {

        activeTab,
        setActiveTab,
        openMenuId,
        setOpenMenuId,
        isEditingName,
        setIsEditingName,
        isEditingDescription,
        setIsEditingDescription,
        isPasswordModalOpen,
        setIsPasswordModalOpen,
        hasPassword,
        newPassword,
        setNewPassword,


        memberRoleFilter,
        setMemberRoleFilter,
        memberSearchTerm,
        setMemberSearchTerm,
        requestSearchTerm,
        setRequestSearchTerm,
        inviteSearchTerm,
        setInviteSearchTerm,
        bannedSearchTerm,
        setBannedSearchTerm,
        isRoleDropdownOpen,
        setIsRoleDropdownOpen,


        workspace,
        workspaceDetail,
        loading,
        error,
        currentUserRole,
        ownerId,
        filteredMembers,
        filteredRequests,
        filteredInvites,
        filteredBanned,
        requests,
        invites,


        toasts,
        removeToast,
        showSuccess,
        showError,


        handleUpRole,
        handleKick,
        handleToBlacklist,
        handleAccept,
        handleReject,
        handleRequestToBlacklist,
        handleCancelInvitation,
        handleBanUser,
        handleUnbanAndKick,
        handleUnbanAndBack,
        handleSaveName,
        handleSaveDescription,
        handleSetPassword,
        handleRemovePassword,
        handleOpenPermissionModal,
        handleClosePermissionModal,
        handleUpdatePermissions,
        isPermissionModalOpen,
        selectedMember,
        isInviteMembersModalOpen,
        handleOpenInviteMembersModal,
        handleCloseInviteMembersModal,
        handleInviteMembers,
        loadWorkspaceData,
        handleLeaveWorkspace,
        handleDeleteWorkspace,
        isTransferOwnerModalOpen,
        setIsTransferOwnerModalOpen,
        confirmLeaveWithNewOwner,
    } = useWorkspaceManagement();


    const { socket } = useWorkspaceWebSocket({
        workspaceId: workspaceId || null,
        isDashboard: true
    });


    useDashboardWorkspaceEvents({
        socket,
        onRefreshWorkspace: loadWorkspaceData
    });


    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-indigo-100 p-6 flex items-center justify-center">
                <div className="text-xl text-gray-600">{t('dashboardWorkspace.loading')}</div>
            </div>
        );
    }


    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-indigo-100 p-6 flex items-center justify-center">
                <div className="text-xl text-red-600">{error}</div>
            </div>
        );
    }


    if (!workspace) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-indigo-100 p-6 flex items-center justify-center">
                <div className="text-xl text-gray-600">{t('dashboardWorkspace.notFound')}</div>
            </div>
        );
    }


    const canEditName = currentUserRole === 'owner' || workspace?.permissions?.includes('RENAME_WORKSPACE');
    const canEditDescription = currentUserRole === 'owner' || workspace?.permissions?.includes('EDIT_DESCRIPTION');
    const canManagePassword = currentUserRole === 'owner' || workspace?.permissions?.includes('MANAGE_PASSWORD');
    const canAcceptMember = currentUserRole === 'owner' || workspace?.permissions?.includes('ACCEPT_MEMBER');


    const isRegularMember = currentUserRole !== 'owner' && currentUserRole !== 'admin';
    const canViewMembers = true;
    const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin' || workspace?.permissions?.includes('MANAGE_MEMBERS');
    const canViewMemberManagement = currentUserRole === 'owner' || currentUserRole === 'admin' || workspace?.permissions?.includes('MANAGE_MEMBERS') || workspace?.permissions?.includes('ACCEPT_MEMBER');

    return (
        <div className="h-screen overflow-y-auto bg-gradient-to-br from-cyan-50 to-indigo-100 p-6">
            <div className="w-full">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                    {/* Workspace Name - Editable */}
                    <div className="flex items-center gap-3 mb-4">
                        {isEditingName ? (
                            <div className="flex items-center gap-2 flex-1">
                                <input
                                    type="text"
                                    defaultValue={workspace.name}
                                    className="text-3xl font-bold text-gray-800 bg-gray-50 rounded-lg px-3 py-2 border-2 focus:outline-none flex-1"
                                    style={{
                                        borderColor: '#21b4ca'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#21b4ca'}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSaveName((e.target as HTMLInputElement).value);
                                        }
                                    }}
                                    onBlur={(e) => handleSaveName(e.target.value)}
                                    autoFocus
                                />
                                <button
                                    onClick={() => setIsEditingName(false)}
                                    className="px-3 py-2 text-gray-600 border border-gray-300 hover:border-gray-500 rounded-lg transition-colors"
                                >
                                    {t('dashboardWorkspace.cancel')}
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="mb-2 flex-1">

                                    <h1 className="text-3xl font-bold text-gray-800 flex-1">{workspace.name}</h1>
                                    <span className="text-sm text-gray-500">Created:</span>
                                    <span className="ml-2 text-sm text-gray-700">
                                        {new Date(workspace.createdAt).toLocaleDateString('vi-VN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                {canEditName && (
                                    <button
                                        onClick={() => setIsEditingName(true)}
                                        className="px-3 py-2 rounded-lg transition-colors hover:opacity-80"
                                        style={{
                                            color: '#21b4ca',
                                            borderColor: '#21b4ca',
                                            border: '1px solid #21b4ca'
                                        }}
                                    >
                                        {t('dashboardWorkspace.edit')}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                  

                    {/* Workspace Description - Editable */}
                    <div className="border border-dashed border-gray-300 rounded-lg p-4 mb-4 bg-gray-50/30 hover:border-gray-400 transition-colors group">
                        <div className="flex items-start gap-3">
                            {isEditingDescription ? (
                                <div className="flex items-start gap-2 flex-1">
                                    <textarea
                                        defaultValue={workspace.description}
                                        className="text-gray-600 bg-white rounded-lg px-3 py-2 border-2 focus:outline-none flex-1 resize-none min-h-[80px]"
                                        style={{
                                            borderColor: '#21b4ca'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#21b4ca'}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSaveDescription((e.target as HTMLTextAreaElement).value);
                                            }
                                        }}
                                        onBlur={(e) => handleSaveDescription(e.target.value)}
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => setIsEditingDescription(false)}
                                        className="px-3 py-2 text-gray-600 border border-gray-300 hover:border-gray-500 rounded-lg transition-colors"
                                    >
                                        {t('dashboardWorkspace.cancel')}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1">
                                        <div className="mb-2">
                                            <span className="text-sm font-medium text-gray-500">Description:</span>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed">
                                            {workspace.description || 'No description provided'}
                                        </p>
                                    </div>
                                    {canEditDescription && (
                                        <button
                                            onClick={() => setIsEditingDescription(true)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-lg hover:bg-gray-100 flex-shrink-0"
                                            title="Edit description"
                                        >
                                            <svg className="w-4 h-4 text-gray-500 hover:text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
  <div className="flex items-center gap-2 pb-4">
                        <button
                            onClick={handleLeaveWorkspace}
                            className="px-3 py-1 rounded-lg transition-colors text-sm bg-yellow-50 border border-yellow-200 hover:bg-yellow-100"
                        >
                            {t('dashboardWorkspace.leaveWorkspace')}
                        </button>
                        {ownerId === currentUser?._id && (
                            <>
                                <button
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="px-3 py-1 rounded-lg transition-colors text-sm bg-red-50 border border-red-200 text-red-600 hover:bg-red-100"
                                >
                                    {t('dashboardWorkspace.deleteWorkspace')}
                                </button>

                                <ConfirmModal
                                    isOpen={isDeleteModalOpen}
                                    title={t('dashboardWorkspace.deleteWorkspace')}
                                    message={t('dashboardWorkspace.prompts.confirmDelete')}
                                    confirmText={t('dashboardWorkspace.deleteWorkspace')}
                                    cancelText={t('dashboardWorkspace.cancel')}
                                    onConfirm={async () => {
                                        setIsDeleteModalOpen(false);
                                        await handleDeleteWorkspace();
                                    }}
                                    onCancel={() => setIsDeleteModalOpen(false)}
                                    type="danger"
                                />
                            </>
                        )}
                    </div>
                    {/* Workspace Code and Settings */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-6">

                            <div>
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Workspace Code:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg font-mono text-sm">
                                            {workspace.code}
                                        </span>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(workspace.code);
                                                showSuccess(t('dashboardWorkspace.copySuccess'));
                                            }}
                                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Copy workspace code"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <span className="text-sm text-gray-500 italic">* {t('dashboardWorkspace.codeHelp')}</span>
                            </div>

                            {/* Password Protection - Show status to all, controls only to privileged users */}
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500">{t('dashboardWorkspace.passwordProtection')}</span>
                                {hasPassword ? (
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 text-green-700 border border-green-300 rounded-lg text-sm font-medium">
                                            {t('dashboardWorkspace.enabled')}
                                        </span>
                                        {canManagePassword && (
                                            <>
                                                <button
                                                    onClick={() => setIsPasswordModalOpen(true)}
                                                    className="px-3 py-1 rounded-lg transition-colors text-sm hover:opacity-80"
                                                    style={{
                                                        color: '#21b4ca',
                                                        borderColor: '#21b4ca',
                                                        border: '1px solid #21b4ca'
                                                    }}
                                                >
                                                    {t('dashboardWorkspace.changePassword')}
                                                </button>
                                                <button
                                                    onClick={handleRemovePassword}
                                                    className="px-3 py-1 text-red-600 border border-red-300 hover:border-red-500 rounded-lg transition-colors text-sm"
                                                >
                                                    {t('dashboardWorkspace.disablePassword')}
                                                </button>
                                            </>
                                        )}
                                        {/* Leave / Delete workspace buttons */}

                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 text-gray-600 border border-gray-300 rounded-lg text-sm font-medium">
                                            {t('dashboardWorkspace.disabled')}
                                        </span>
                                        {canManagePassword && (
                                            <button
                                                onClick={() => setIsPasswordModalOpen(true)}
                                                className="px-4 py-2 rounded-lg transition-colors text-sm hover:opacity-80"
                                                style={{
                                                    color: '#21b4ca',
                                                    borderColor: '#21b4ca',
                                                    border: '1px solid #21b4ca'
                                                }}
                                            >
                                                {t('dashboardWorkspace.enablePassword')}
                                            </button>
                                        )}
                                    </div>
                                )}</div>
                        </div>
                    </div>
                </div>

                {/* Tabs - Show Members tab to all, other tabs only to privileged users */}
                <div className="bg-white rounded-2xl shadow-lg ">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('members')}
                            className={`${canViewMemberManagement ? 'flex-1' : 'w-full'} px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'members'
                                ? 'border-b-2 bg-cyan-50'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            style={activeTab === 'members' ? {
                                color: '#21b4ca',
                                borderBottomColor: '#21b4ca'
                            } : {}}
                        >
                            {t('dashboardWorkspace.members')} ({filteredMembers.length})
                        </button>
                        {canViewMemberManagement && (
                            <>
                                <button
                                    onClick={() => setActiveTab('requests')}
                                    className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'requests'
                                        ? 'border-b-2 bg-cyan-50'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    style={activeTab === 'requests' ? {
                                        color: '#21b4ca',
                                        borderBottomColor: '#21b4ca'
                                    } : {}}
                                >
                                    {t('dashboardWorkspace.joinRequests')} ({filteredRequests.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('invites')}
                                    className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'invites'
                                        ? 'border-b-2 bg-cyan-50'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    style={activeTab === 'invites' ? {
                                        color: '#21b4ca',
                                        borderBottomColor: '#21b4ca'
                                    } : {}}
                                >
                                    {t('dashboardWorkspace.invitations')} ({filteredInvites.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('banned')}
                                    className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'banned'
                                        ? 'border-b-2 bg-cyan-50'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    style={activeTab === 'banned' ? {
                                        color: '#21b4ca',
                                        borderBottomColor: '#21b4ca'
                                    } : {}}
                                >
                                    {t('dashboardWorkspace.banned')} ({filteredBanned.length})
                                </button>
                            </>
                        )}
                    </div>

                    <div className="p-6">
                        {/* Members Tab */}
                        {activeTab === 'members' && (
                            <div className="space-y-4">
                                {/* Info message for regular members */}
                                {!canManageMembers && (
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-sm text-blue-800">
                                                {t('dashboardWorkspace.memberView.viewOnlyNotice')}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Member Filters */}
                                <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-700">{t('dashboardWorkspace.filters.role')}</span>
                                        <div className="relative">
                                            {/* Custom dropdown button */}
                                            <button
                                                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-sm bg-white cursor-pointer hover:border-gray-400 transition-colors flex items-center justify-between gap-2 min-w-[100px]"
                                                style={{
                                                    borderColor: '#d1d5db'
                                                }}
                                                onFocus={(e) => (e.target as HTMLElement).style.borderColor = '#21b4ca'}
                                                onBlur={(e) => (e.target as HTMLElement).style.borderColor = '#d1d5db'}
                                            >
                                                <span>{memberRoleFilter === 'All' ? t('dashboardWorkspace.filters.all') :
                                                    memberRoleFilter === 'Admin' ? t('dashboardWorkspace.filters.admin') :
                                                        t('dashboardWorkspace.filters.member')}</span>
                                                <svg
                                                    className={`w-4 h-4 transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {/* Dropdown menu */}
                                            {isRoleDropdownOpen && (
                                                <>
                                                    {/* Invisible backdrop */}
                                                    <div
                                                        className="fixed inset-0 z-40"
                                                        onClick={() => setIsRoleDropdownOpen(false)}
                                                    />
                                                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                                        <button
                                                            onClick={() => {
                                                                setMemberRoleFilter('All');
                                                                setIsRoleDropdownOpen(false);
                                                            }}
                                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg transition-colors ${memberRoleFilter === 'All' ? 'bg-cyan-50' : 'text-gray-700'}`}
                                                            style={memberRoleFilter === 'All' ? { color: '#21b4ca' } : {}}
                                                        >
                                                            {t('dashboardWorkspace.filters.all')}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setMemberRoleFilter('Admin');
                                                                setIsRoleDropdownOpen(false);
                                                            }}
                                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${memberRoleFilter === 'Admin' ? 'bg-cyan-50' : 'text-gray-700'}`}
                                                            style={memberRoleFilter === 'Admin' ? { color: '#21b4ca' } : {}}
                                                        >
                                                            {t('dashboardWorkspace.filters.admin')}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setMemberRoleFilter('Member');
                                                                setIsRoleDropdownOpen(false);
                                                            }}
                                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg transition-colors ${memberRoleFilter === 'Member' ? 'bg-cyan-50' : 'text-gray-700'}`}
                                                            style={memberRoleFilter === 'Member' ? { color: '#21b4ca' } : {}}
                                                        >
                                                            {t('dashboardWorkspace.filters.member')}
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder={t('dashboardWorkspace.filters.searchMembers')}
                                            value={memberSearchTerm}
                                            onChange={(e) => setMemberSearchTerm(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none text-sm"
                                            style={{ borderColor: '#d1d5db' }}
                                            onFocus={(e) => (e.target as HTMLElement).style.borderColor = '#21b4ca'}
                                            onBlur={(e) => (e.target as HTMLElement).style.borderColor = '#d1d5db'}
                                        />
                                    </div>

                                    {/* Invite Members Button - Only show for admin/owner */}
                                    {(currentUserRole === 'admin' || ownerId === currentUser?._id) && (
                                        <div className="flex-shrink-0">
                                            <button
                                                onClick={handleOpenInviteMembersModal}
                                                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center gap-2 text-sm font-medium"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                {t('dashboardWorkspace.inviteMembers.button')}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {filteredMembers.map((member, index) => {
                                    const isOwner = ownerId === member.id || ownerId === member.user_id;
                                    const isCurrentUser = currentUser && (member.user_id === currentUser._id || member.id === currentUser._id);
                                    const memberWithOwnerInfo = {
                                        ...member,
                                        isOwner,
                                        permissions: isOwner ? [
                                            'RENAME_WORKSPACE',
                                            'EDIT_DESCRIPTION',
                                            'MANAGE_PASSWORD',
                                            'MANAGE_MEMBERS',
                                            'ACCEPT_MEMBER',
                                            'MANAGE_PERMISSIONS'
                                        ] : member.permissions
                                    };



                                    return (
                                        <MemberCard
                                            key={member.id}
                                            user={memberWithOwnerInfo}
                                            type="member"
                                            currentUserRole={currentUserRole}
                                            currentUserId={currentUser?._id}
                                            onUpRole={canManageMembers ? handleUpRole : undefined}
                                            onKick={canManageMembers ? handleKick : undefined}
                                            onToBlacklist={canManageMembers ? handleToBlacklist : undefined}
                                            onBanUser={canManageMembers ? (userId) => handleBanUser(userId) : undefined}
                                            onOpenPermissionModal={(isCurrentUser || !canManageMembers) ? undefined : handleOpenPermissionModal}
                                            openMenuId={canManageMembers ? openMenuId : null}
                                            onToggleMenu={canManageMembers ? (id) => setOpenMenuId(openMenuId === id ? null : id) : undefined}
                                            index={index}
                                            totalCount={filteredMembers.length}
                                        />
                                    );
                                })}                                {filteredMembers.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        {t('dashboardWorkspace.noData.noMembers')}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Requests Tab - Only show if user has management permissions */}
                        {activeTab === 'requests' && canViewMemberManagement && (
                            <div className="space-y-4">
                                {/* Request Search */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <input
                                        type="text"
                                        placeholder={t('dashboardWorkspace.filters.searchRequests')}
                                        value={requestSearchTerm}
                                        onChange={(e) => setRequestSearchTerm(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none text-sm"
                                        style={{ borderColor: '#d1d5db' }}
                                        onFocus={(e) => (e.target as HTMLElement).style.borderColor = '#21b4ca'}
                                        onBlur={(e) => (e.target as HTMLElement).style.borderColor = '#d1d5db'}
                                    />
                                </div>

                                {filteredRequests.map((request, index) => (
                                    <MemberCard
                                        key={request.id}
                                        user={request}
                                        type="request"
                                        onAccept={canAcceptMember ? handleAccept : undefined}
                                        onReject={canAcceptMember ? handleReject : undefined}
                                        onBanUser={canAcceptMember ? (userId, requestId) => {

                                            const requestData = requests.find((r: any) => r.user_id === userId);
                                            if (requestData?.request_id) {
                                                handleBanUser(userId, requestData.request_id);
                                            } else {
                                                handleBanUser(userId);
                                            }
                                        } : undefined}
                                        index={index}
                                        totalCount={filteredRequests.length}
                                    />
                                ))}
                                {filteredRequests.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        {t('dashboardWorkspace.noData.noRequests')}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Invites Tab - Only show if user has management permissions */}
                        {activeTab === 'invites' && canViewMemberManagement && (
                            <div className="space-y-4">
                                {/* Invite Search */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <input
                                        type="text"
                                        placeholder={t('dashboardWorkspace.filters.searchInvites')}
                                        value={inviteSearchTerm}
                                        onChange={(e) => setInviteSearchTerm(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none text-sm"
                                        style={{ borderColor: '#d1d5db' }}
                                        onFocus={(e) => (e.target as HTMLElement).style.borderColor = '#21b4ca'}
                                        onBlur={(e) => (e.target as HTMLElement).style.borderColor = '#d1d5db'}
                                    />
                                </div>

                                {filteredInvites.map((invite, index) => (
                                    <MemberCard
                                        key={invite.id}
                                        user={invite}
                                        type="invite"
                                        onAccept={canAcceptMember ? handleAccept : undefined}
                                        onReject={canAcceptMember ? handleCancelInvitation : undefined}
                                        onToBlacklist={canAcceptMember ? handleRequestToBlacklist : undefined}
                                        index={index}
                                        totalCount={filteredInvites.length}
                                    />
                                ))}
                                {filteredInvites.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        {t('dashboardWorkspace.noData.noInvites')}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Banned Tab - Only show if user has management permissions */}
                        {activeTab === 'banned' && canViewMemberManagement && (
                            <div className="space-y-4">
                                {/* Banned Search */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <input
                                        type="text"
                                        placeholder={t('dashboardWorkspace.filters.searchBanned')}
                                        value={bannedSearchTerm}
                                        onChange={(e) => setBannedSearchTerm(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none text-sm"
                                        style={{ borderColor: '#d1d5db' }}
                                        onFocus={(e) => (e.target as HTMLElement).style.borderColor = '#21b4ca'}
                                        onBlur={(e) => (e.target as HTMLElement).style.borderColor = '#d1d5db'}
                                    />
                                </div>

                                {filteredBanned.map((user, index) => (
                                    <MemberCard
                                        key={user.id}
                                        user={user}
                                        type="banned"
                                        onUnbanAndKick={handleUnbanAndKick}
                                        onUnbanAndBack={handleUnbanAndBack}
                                        index={index}
                                        totalCount={filteredBanned.length}
                                    />
                                ))}
                                {filteredBanned.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        {t('dashboardWorkspace.noData.noBanned')}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Password Modal */}
            {/* Password Modal */}
            <PasswordModal
                isOpen={isPasswordModalOpen}
                newPassword={newPassword}
                hasPassword={hasPassword}
                onClose={() => setIsPasswordModalOpen(false)}
                onPasswordChange={(e) => setNewPassword(e.target.value)}
                onSetPassword={handleSetPassword}
            />

            {/* Permission Modal */}
            {selectedMember && (
                <MemberPermissionModal
                    isOpen={isPermissionModalOpen}
                    onClose={handleClosePermissionModal}
                    member={{
                        user_id: selectedMember.user_id,
                        full_name: selectedMember.name,
                        email: selectedMember.email,
                        avatar_url: selectedMember.avatar,
                        role: selectedMember.rawRole || selectedMember.role?.toLowerCase() || 'user',
                        isOwner: selectedMember.isOwner,
                        permissions: selectedMember.permissions || []
                    }}
                    currentUserRole={currentUserRole || 'member'}
                    currentUserPermissions={workspace?.permissions || []}
                    onPromoteAdmin={handleUpRole}
                    onDemoteAdmin={handleUpRole}
                    onRemoveUser={handleKick}
                    onBanUser={handleBanUser}
                    onUpdatePermissions={handleUpdatePermissions}
                />
            )}

            {/* Invite Members Modal */}
            <InviteMembersModal
                isOpen={isInviteMembersModalOpen}
                onClose={handleCloseInviteMembersModal}
                onInvite={handleInviteMembers}
                workspaceData={{
                    members: workspaceDetail?.members?.active || [],
                    requests: requests || [],
                    invites: invites || [],
                    banned: workspaceDetail?.members?.banned || []
                }}
            />

            {/* Transfer Owner Modal - shown when owner wants to leave */}
            <TransferOwnerModal
                isOpen={isTransferOwnerModalOpen}
                members={workspaceDetail?.members?.active || []}
                currentUserId={currentUser?._id}
                onCancel={() => setIsTransferOwnerModalOpen(false)}
                onConfirm={(newOwnerId: string) => confirmLeaveWithNewOwner(newOwnerId)}
            />

            {/* Toast Container */}
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </div>
    );
};

export default DashboardWorkspacePage;
