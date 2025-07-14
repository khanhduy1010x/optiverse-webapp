import React, { useState } from 'react';
import Modal from 'react-modal';
import { User, UserRole, UserStatus } from '../../types/admin/user.types';
import { UserModalHook } from '../../types/admin/user-modal.types';
import { GROUP_CLASSNAMES } from '../../styles';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface UserDetailModalProps {
    modal: UserModalHook;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ modal }) => {
    const { isOpen, user, actionLoading, closeModal, suspendUser, activateUser, changeUserRole } = modal;
    const currentUser = useSelector((state: RootState) => state.auth.user);

    // Kiểm tra xem user hiện tại có phải là user đang xem không
    const isCurrentUser = currentUser?._id === user?._id;

    const handleRoleChange = async () => {
        if (user) {
            const oppositeRole = getOppositeRole(user.role);
            await changeUserRole(user._id, oppositeRole);
        }
    };

    const handleSuspend = async () => {
        if (user) {
            await suspendUser(user._id);
        }
    };

    const handleActivate = async () => {
        if (user) {
            await activateUser(user._id);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Get the opposite role for the button text
    const getOppositeRole = (currentRole: UserRole) => {
        return currentRole === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
    };

    // Get the button text based on current role
    const getRoleChangeButtonText = (currentRole: UserRole) => {
        const oppositeRole = getOppositeRole(currentRole);
        return `Change role to  ${oppositeRole === UserRole.ADMIN ? 'Admin' : 'User'}`;
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            className={GROUP_CLASSNAMES.modalContainer + " w-full max-w-xl"}
            overlayClassName={GROUP_CLASSNAMES.modalOverlay}
        >
            <div className="p-6">
                {/* Header */}
                <div className={GROUP_CLASSNAMES.flexJustifyBetween + " mb-6"}>
                    <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
                    <button
                        onClick={closeModal}
                        className="text-gray-500 cursor-pointer hover:text-gray-700 p-1 rounded-lg"
                        disabled={actionLoading}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M18 6L6 18M6 6L18 18"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>

                {user && (
                    <>
                        {/* User Avatar and Basic Info */}
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="flex-shrink-0">
                                {user.avatar_url ? (
                                    <img
                                        className="h-20 w-20 rounded-full object-cover ring-4 ring-[#21b4ca]/20"
                                        src={user.avatar_url}
                                        alt={user.full_name || 'User avatar'}
                                    />
                                ) : (
                                    <div className="h-20 w-20 rounded-full bg-[#21b4ca]/10 flex items-center justify-center ring-4 ring-[#21b4ca]/20">
                                        <span className="text-3xl font-medium text-[#21b4ca]">
                                            {(user.full_name || user.email).charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-xl font-semibold text-gray-900 mb-1">
                                    {user.full_name || 'Not updated'}
                                </h4>
                                <p className="text-sm text-gray-500 mb-2">{user.email}</p>
                                <div className="flex items-center space-x-3">
                                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${user.role === UserRole.ADMIN
                                        ? 'bg-[#21b4ca]/20 text-[#21b4ca]'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {user.role === UserRole.ADMIN ? 'Admin' : 'User'}
                                    </span>
                                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${user.status === UserStatus.ACTIVE
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {user.status === UserStatus.ACTIVE ? 'Active' : 'Suspended'}
                                    </span>
                                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${user.isVerified
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {user.isVerified ? 'Verified' : 'Not Verified'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* User Details */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h5 className="text-sm font-medium text-gray-700 mb-3">Account Information</h5>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Email:</span>
                                    <span className="text-sm text-gray-900 font-medium">{user.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Full Name:</span>
                                    <span className="text-sm text-gray-900 font-medium">{user.full_name || 'Not updated'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Created:</span>
                                    <span className="text-sm text-gray-900 font-medium">
                                        {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Last Updated:</span>
                                    <span className="text-sm text-gray-900 font-medium">
                                        {user.updatedAt ? formatDate(user.updatedAt) : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions Section */}
                        <div className="border-t border-gray-200 pt-6">
                            <h4 className="text-sm font-medium text-gray-900 mb-4">Actions</h4>

                            <div className="flex space-x-3">
                                {/* Role Change */}
                                <button
                                    onClick={handleRoleChange}
                                    disabled={actionLoading || isCurrentUser}
                                    className="flex-1 bg-[#21b4ca] cursor-pointer flex items-center justify-center px-3 py-2 gap-2 text-white rounded-lg text-sm font-medium hover:bg-[#1a8fa3] disabled:bg-gray-300 disabled:text-gray-400 transition-colors"
                                    title={isCurrentUser ? "You cannot change your own role" : ""}
                                >
                                    {actionLoading ? (
                                        <>
                                            <div className={GROUP_CLASSNAMES.loadingSpinnerSmall}></div>
                                            <span>Changing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>{getRoleChangeButtonText(user.role)}</span>
                                        </>
                                    )}
                                </button>

                                {/* Status Actions */}
                                {user.status === UserStatus.ACTIVE ? (
                                    <button
                                        onClick={handleSuspend}
                                        disabled={actionLoading || isCurrentUser}
                                        className="flex-1 px-3 py-2 bg-red-100 cursor-pointer text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors duration-200 border border-red-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={isCurrentUser ? "You cannot suspend yourself" : ""}
                                    >
                                        {actionLoading ? (
                                            <>
                                                <div className={GROUP_CLASSNAMES.loadingSpinnerSmall}></div>
                                                <span>Suspending...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Suspend User</span>
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleActivate}
                                        disabled={actionLoading || isCurrentUser}
                                        className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors duration-200 border border-green-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={isCurrentUser ? "You cannot activate yourself" : ""}
                                    >
                                        {actionLoading ? (
                                            <>
                                                <div className={GROUP_CLASSNAMES.loadingSpinnerSmall}></div>
                                                <span>Activating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Activate User</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="px-3 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                                disabled={actionLoading}
                            >
                                Close
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default UserDetailModal; 