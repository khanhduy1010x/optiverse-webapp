import React from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import useWorkspaceHub from '../../hooks/workspace/useWorkspaceHub.hook';
import Icon from '../../components/common/Icon/Icon.component';

interface WorkspaceHubModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const WorkspaceHubModal: React.FC<WorkspaceHubModalProps> = ({
    isOpen,
    onClose
}) => {
    const { t } = useAppTranslate('workspace');
    const {
        activeTab,
        setActiveTab,
        searchCode,
        setSearchCode,
        searchResults,
        isSearching,
        handleSearch,
        showPasswordModal,
        password,
        setPassword,
        selectedWorkspace,
        passwordError,
        openPasswordModal,
        closePasswordModal,
        handlePasswordSubmit,
        handleRequestJoin,
        invitations,
        isLoadingInvitations,
        acceptInvitation,
        rejectInvitation,
        requests,
        isLoadingRequests,
        cancelRequest
    } = useWorkspaceHub(onClose);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] ">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50  backdrop-blur-sm" onClick={onClose} />

            {/* Modal panel */}
            <div className="absolute inset-0 flex items-center justify-center p-4 ">
                <div className="w-full max-w-4xl rounded-lg bg-white shadow-xl h-110 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900">{t('workspaceHub.title')}</h3>
                        <button
                            type="button"
                            className="rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab('search')}
                                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'search'
                                    ? 'border-b-2 bg-cyan-50'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                    }`}
                                style={activeTab === 'search' ? {
                                    color: '#21b4ca',
                                    borderBottomColor: '#21b4ca'
                                } : {}}
                            >
                                {t('workspaceHub.tabs.search')}
                            </button>
                            <button
                                onClick={() => setActiveTab('invitations')}
                                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'invitations'
                                    ? 'border-b-2 bg-cyan-50'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                    }`}
                                style={activeTab === 'invitations' ? {
                                    color: '#21b4ca',
                                    borderBottomColor: '#21b4ca'
                                } : {}}
                            >
                                {t('workspaceHub.tabs.invitations')}
                            </button>
                            <button
                                onClick={() => setActiveTab('requests')}
                                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'requests'
                                    ? 'border-b-2 bg-cyan-50'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                    }`}
                                style={activeTab === 'requests' ? {
                                    color: '#21b4ca',
                                    borderBottomColor: '#21b4ca'
                                } : {}}
                            >
                                {t('workspaceHub.tabs.requests')}
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-6 overflow-y-auto" style={{ height: '500px', maxHeight: 'calc(90vh - 200px)' }}>
                        {/* Search Tab */}
                        {activeTab === 'search' && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                                        {t('workspaceHub.searchTab.title')}
                                    </h4>
                                </div>

                                <div className="max-w-md mx-auto">
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            placeholder={t('workspaceHub.searchTab.placeholder')}
                                            value={searchCode}
                                            onChange={(e) => setSearchCode(e.target.value)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none text-sm"
                                            style={{ borderColor: '#d1d5db' }}
                                            onFocus={(e) => (e.target as HTMLElement).style.borderColor = '#21b4ca'}
                                            onBlur={(e) => (e.target as HTMLElement).style.borderColor = '#d1d5db'}
                                        />
                                        <button
                                            onClick={handleSearch}
                                            disabled={!searchCode.trim() || isSearching}
                                            type="button"
                                            className="px-4 py-2 text-white rounded-lg hover:opacity-80 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{ backgroundColor: '#21b4ca' }}
                                        >
                                            {isSearching ? t('workspaceHub.searching') : t('workspaceHub.searchTab.searchButton')}
                                        </button>
                                    </div>
                                </div>

                                {searchResults.length > 0 ? (
                                    <div className="space-y-3">
                                        {searchResults.map((workspace) => (
                                            <div key={workspace.id} className="p-4 border border-gray-200 rounded-lg">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h5 className="font-medium text-gray-900">{workspace.name}</h5>
                                                            {workspace.hasPassword && (
                                                                <div className="flex items-center gap-1 text-orange-600">
                                                                    <span className="text-xs">Protected</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {workspace.description && (
                                                            <p className="text-sm text-gray-600 mb-2">{workspace.description}</p>
                                                        )}

                                                        <div className="flex items-center gap-2 mb-2">
                                                            {workspace.owner?.avatar_url ? (
                                                                <img
                                                                    src={workspace.owner.avatar_url}
                                                                    alt={workspace.owner.full_name || workspace.owner.email}
                                                                    className="w-6 h-6 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-white text-xs font-medium">
                                                                    {workspace.owner?.full_name?.[0] || workspace.owner?.email?.[0] || '?'}
                                                                </div>
                                                            )}
                                                            <span className="text-sm text-gray-600">
                                                                Owner: {workspace.owner?.full_name || workspace.owner?.email || 'Unknown'}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                                            <span className="flex items-center gap-1">
                                                                <Icon name='group' />
                                                                {workspace.memberCount} {workspace.memberCount === 1 ? 'member' : 'members'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {(() => {
                                                        switch (workspace.userStatus) {
                                                            case 'owner':
                                                                return (
                                                                    <div className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md border border-green-200">
                                                                        {t('workspaceHub.searchTab.owner')}
                                                                    </div>
                                                                );
                                                            case 'member':
                                                                return (
                                                                    <div className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md border border-blue-200">
                                                                        {t('workspaceHub.searchTab.member')}
                                                                    </div>
                                                                );
                                                            case 'pending_request':
                                                                return (
                                                                    <div className="px-3 py-2 text-sm bg-yellow-100 text-yellow-700 rounded-md border border-yellow-200">
                                                                        {t('workspaceHub.searchTab.pending')}
                                                                    </div>
                                                                );
                                                            case 'pending_invitation':
                                                                return (
                                                                    <div className="px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-md border border-purple-200">
                                                                        {t('workspaceHub.searchTab.invited')}
                                                                    </div>
                                                                );
                                                            case 'banned':
                                                                return (
                                                                    <div className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md border border-red-200">
                                                                        {t('workspaceHub.searchTab.banned')}
                                                                    </div>
                                                                );
                                                            default:
                                                                return (
                                                                    <div className="flex gap-2">
                                                                        {workspace.hasPassword && (
                                                                            <button
                                                                                onClick={() => openPasswordModal(workspace)}
                                                                                className="px-3 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600"
                                                                            >
                                                                                Enter Password
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            onClick={() => handleRequestJoin(workspace)}
                                                                            className="px-3 py-2 text-sm bg-[#21b4ca] text-white rounded-md hover:bg-[#1da0b5]"
                                                                        >
                                                                            {t('workspaceHub.searchTab.requestJoin')}
                                                                        </button>
                                                                    </div>
                                                                );
                                                        }
                                                    })()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : searchCode && !isSearching ? (
                                    <div className="text-center py-8 text-gray-500">
                                        {t('workspaceHub.searchTab.noResults')}
                                    </div>
                                ) : !searchCode ? (
                                    <div className="text-center py-8 text-gray-500">
                                        {t('workspaceHub.searchTab.enterCode')}
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {/* Invitations Tab */}
                        {activeTab === 'invitations' && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                                        {t('workspaceHub.invitationsTab.title')}
                                    </h4>
                                </div>

                                {isLoadingInvitations ? (
                                    <div className="text-center py-8 text-gray-500">
                                        Loading...
                                    </div>
                                ) : invitations.length > 0 ? (
                                    <div className="space-y-3">
                                        {invitations.map((invitation) => (
                                            <div key={invitation.requestId} className="p-4 border border-gray-200 rounded-lg">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h5 className="font-medium text-gray-900">{invitation.workspace.name}</h5>
                                                            {invitation.workspace.hasPassword && (
                                                                <div className="w-4 h-4 text-gray-400">
                                                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2 mb-2">
                                                            {invitation.workspace.owner?.avatar_url ? (
                                                                <img
                                                                    src={invitation.workspace.owner.avatar_url}
                                                                    alt={invitation.workspace.owner.full_name || invitation.workspace.owner.email}
                                                                    className="w-6 h-6 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                                                                    <span className="text-xs text-gray-600">
                                                                        {(invitation.workspace.owner?.full_name || invitation.workspace.owner?.email || 'U').charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <p className="text-sm text-gray-500">
                                                                {t('workspaceHub.invitationsTab.invitedBy')} {invitation.requester?.full_name || invitation.requester?.email}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                                            <span className="flex items-center gap-1">
                                                                <Icon name='group' />
                                                                {invitation.workspace.memberCount} {t('workspaceHub.invitationsTab.members')}
                                                            </span>

                                                        </div>

                                                        {invitation.message && (
                                                            <p className="text-sm text-gray-600 mt-2 italic">"{invitation.message}"</p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => acceptInvitation(invitation.requestId)}
                                                            className="px-3 py-2 text-sm bg-[#21b4ca] text-white rounded-md hover:bg-[#1da0b5]"
                                                        >
                                                            {t('workspaceHub.invitationsTab.accept')}
                                                        </button>
                                                        <button
                                                            onClick={() => rejectInvitation(invitation.requestId)}
                                                            className="px-3 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                                        >
                                                            {t('workspaceHub.invitationsTab.reject')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-cyan-100 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8" style={{ color: '#21b4ca' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        {t('workspaceHub.invitationsTab.noInvitations')}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Requests Tab */}
                        {activeTab === 'requests' && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                                        {t('workspaceHub.requestsTab.title')}
                                    </h4>
                                </div>

                                {isLoadingRequests ? (
                                    <div className="text-center py-8 text-gray-500">
                                        Loading...
                                    </div>
                                ) : requests.length > 0 ? (
                                    <div className="space-y-3">
                                        {requests.map((request) => (
                                            <div key={request.requestId} className="p-4 border border-gray-200 rounded-lg">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h5 className="font-medium text-gray-900">{request.workspace.name}</h5>
                                                            {request.workspace.hasPassword && (
                                                                <div className="w-4 h-4 text-gray-400">
                                                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2 mb-2">
                                                            {request.workspace.owner?.avatar_url ? (
                                                                <img
                                                                    src={request.workspace.owner.avatar_url}
                                                                    alt={request.workspace.owner.full_name || request.workspace.owner.email}
                                                                    className="w-6 h-6 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                                                                    <span className="text-xs text-gray-600">
                                                                        {(request.workspace.owner?.full_name || request.workspace.owner?.email || 'U').charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <span className="text-sm text-gray-600">
                                                                {request.workspace.owner?.full_name || request.workspace.owner?.email || t('workspaceHub.requestsTab.unknownOwner')}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                                            <span className="flex items-center gap-1">
                                                                <Icon name='group' />
                                                                {request.workspace.memberCount} {t('workspaceHub.requestsTab.members')}
                                                            </span>
                                                            <span className="text-gray-400">•</span>
                                                            <span>
                                                                {t('workspaceHub.requestsTab.requestedAt')} {new Date(request.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>

                                                        {request.message && (
                                                            <p className="text-sm text-gray-600 italic">"{request.message}"</p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => cancelRequest(request.requestId)}
                                                        className="px-3 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                                                    >
                                                        {t('workspaceHub.requestsTab.cancel')}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-cyan-100 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8" style={{ color: '#21b4ca' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        </div>
                                        {t('workspaceHub.requestsTab.noRequests')}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                        <button
                            type="button"
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            onClick={onClose}
                        >
                            {t('workspaceHub.close')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={closePasswordModal} />
                    <div className="relative bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Enter Workspace Password
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            "{selectedWorkspace?.name}" requires a password to join.
                        </p>
                        <input
                            type="password"
                            placeholder="Enter password..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#21b4ca] mb-2 ${passwordError ? 'border-red-500' : 'border-gray-300'
                                }`}
                            onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                        />
                        {passwordError && (
                            <p className="text-sm text-red-500 mb-4">{passwordError}</p>
                        )}
                        <div className="flex gap-3 justify-end mt-4">
                            <button
                                onClick={closePasswordModal}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePasswordSubmit}
                                disabled={!password.trim()}
                                className="px-4 py-2 bg-[#21b4ca] text-white rounded-lg hover:bg-[#1da0b5] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Join Workspace
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkspaceHubModal;