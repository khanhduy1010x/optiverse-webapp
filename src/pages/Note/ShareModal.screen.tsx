import React, { useEffect } from 'react';
import { useShareNote } from '../../hooks/note/useShareNote.hook';
import { SharedWithUser } from '../../types/note/share.types';
import { ShareModalProps } from '../../types/note/props/component.props';
import Modal from 'react-modal';

const ShareModal: React.FC<ShareModalProps> = ({
    isOpen,
    onClose,
    selectedItem,
    onShare,
    loading,
    errorMessage
}) => {
    const {
        searchTerm,
        setSearchTerm,
        selectedUsers,
        permission,
        setPermission,
        filteredFriends,
        loadingFriends,
        shareLoading,
        shareError,
        currentlySharedWith,
        loadingSharedInfo,
        fetchFriends,
        handleSelectUser,
        handleRemoveUser,
        handleShare,
        handleUpdateUserPermission,
        handleUpdateSharedUserPermission,
        handleRemoveSharedUser
    } = useShareNote(isOpen, onClose, selectedItem);

    useEffect(() => {
        if (isOpen) {
            fetchFriends();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const renderAvatar = (name: string, avatarUrl?: string) => {
        if (avatarUrl) {
            return <img src={avatarUrl} alt={name} className="w-6 h-6 rounded-full mr-2" />;
        }
        return (
            <div className="w-6 h-6 rounded-full bg-[#21b4ca] text-white flex items-center justify-center mr-2">
                {(name || '?').charAt(0).toUpperCase()}
            </div>
        );
    };

    const SharedUserSkeleton = () => (
        <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between animate-pulse">
            <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-gray-200 mr-2"></div>
                <div>
                    <div className="h-3 w-24 bg-gray-200 rounded mb-1"></div>
                    <div className="h-2 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
            <div className="flex items-center">
                <div className="h-5 w-12 bg-gray-200 rounded mr-2"></div>
                <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
            </div>
        </div>
    );

    const FriendSearchSkeleton = () => (
        <div className="px-3 py-2 flex items-center animate-pulse">
            <div className="w-6 h-6 rounded-full bg-gray-200 mr-2"></div>
            <div className="flex-1">
                <div className="h-3 w-24 bg-gray-200 rounded mb-1"></div>
                <div className="h-2 w-32 bg-gray-200 rounded"></div>
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            shouldCloseOnOverlayClick={true}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[650px] rounded-2xl shadow-2xl z-[2000] outline-none"
            overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
            ariaHideApp={false}
        >
            <div className="bg-white rounded-lg shadow-lg w-full h-full flex flex-col">
                <div className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">
                            Share {selectedItem?.type === 'folder' ? 'Folder' : 'Note'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 cursor-pointer hover:text-gray-700"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Share "{selectedItem?.type === 'folder' ? selectedItem?.name : selectedItem?.title}" with your friends
                    </p>

                    <div className="flex-1 overflow-y-hidden custom-scrollbar-2 pr-1">
                        {/* Shared Users Section */}
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-2" >
                                {loadingSharedInfo
                                    ? "Loading shared users..."
                                    : currentlySharedWith.length > 0
                                        ? `Already shared with ${currentlySharedWith.length} ${currentlySharedWith.length === 1 ? 'user' : 'users'}`
                                        : "Not shared with anyone yet"}
                            </h4>
                            <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm custom-scrollbar-4" style={{ maxHeight: '150px' }}>
                                {loadingSharedInfo ? (
                                    <>
                                        <SharedUserSkeleton />
                                        <SharedUserSkeleton />
                                        <SharedUserSkeleton />
                                    </>
                                ) : currentlySharedWith.length > 0 ? (
                                    currentlySharedWith.map((user) => (
                                        <div key={user.user_id} className="px-3 py-2 border-b border-gray-200 last:border-b-0 flex items-center justify-between">
                                            <div className="flex items-center">
                                                {renderAvatar(
                                                    user.user_info?.name || 'Unknown',
                                                    user.user_info?.avatar_url
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium">
                                                        {user.user_info?.name || 'Unknown'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {user.user_info?.email || user.user_id}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <select
                                                    value={user.permission}
                                                    onChange={(e) => handleUpdateSharedUserPermission(
                                                        user.user_id,
                                                        e.target.value as 'view' | 'edit'
                                                    )}
                                                    className="mr-2 text-xs border border-gray-300 rounded px-1 py-0.5"
                                                    disabled={shareLoading}
                                                >
                                                    <option value="view">View</option>
                                                    <option value="edit">Edit</option>
                                                </select>
                                                <button
                                                    onClick={() => handleRemoveSharedUser(user.user_id)}
                                                    className="text-red-500 cursor-pointer hover:text-red-700"
                                                    disabled={shareLoading}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    // Empty state
                                    <div className="px-3 py-4 text-center text-sm text-gray-500">
                                        <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        No one has access to this {selectedItem?.type === 'folder' ? 'folder' : 'note'} yet
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-4 relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Add more people
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#21b4ca] focus:outline-none "
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    disabled={loading || loadingFriends}
                                />

                                {loadingFriends && searchTerm.trim() !== '' && (
                                    <div className="absolute z-50 top-full left-0 right-0 mt-1 border border-gray-200 rounded-lg overflow-y-auto bg-white shadow-lg custom-scrollbar-4" style={{ maxHeight: '200px' }}>
                                        <FriendSearchSkeleton />
                                        <FriendSearchSkeleton />
                                        <FriendSearchSkeleton />
                                    </div>
                                )}

                                {filteredFriends.length > 0 && searchTerm.trim() !== '' && !loadingFriends && (
                                    <div className="absolute z-50 top-full left-0 right-0 mt-1 border border-gray-200 rounded-lg overflow-y-auto bg-white shadow-lg custom-scrollbar-4" style={{ maxHeight: '200px' }}>
                                        {filteredFriends.map(friend => (
                                            <div
                                                key={friend._id}
                                                className="px-3 py-2 hover:bg-[#e6f7f9] cursor-pointer flex items-center"
                                                onClick={() => handleSelectUser(friend)}
                                            >
                                                {renderAvatar(
                                                    friend.friendInfo?.full_name || 'Unknown',
                                                    friend.friendInfo?.avatar_url
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium truncate">{friend.friendInfo?.full_name || 'Unknown'}</div>
                                                    <div className="text-xs text-gray-500 truncate">{friend.friendInfo?.email}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {!loadingFriends && searchTerm.trim() !== '' && filteredFriends.length === 0 && (
                                    <p className="text-sm text-gray-500 mt-1">No friends found matching "{searchTerm}"</p>
                                )}

                                {!loadingFriends && filteredFriends.length === 0 && searchTerm.trim() === '' && (
                                    <p className="text-sm text-gray-500 mt-1">Type to search for friends</p>
                                )}
                            </div>
                        </div>

                        {/* Selected Users Section */}
                        {selectedUsers.length > 0 ? (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Selected {selectedUsers.length} {selectedUsers.length === 1 ? 'friend' : 'friends'}
                                </label>
                                <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm custom-scrollbar-4 max-h-[150px]">
                                    {selectedUsers.map(user => (
                                        <div
                                            key={user._id}
                                            className="px-3 py-2 border-b border-gray-200 last:border-b-0 flex items-center justify-between"
                                        >
                                            <div className="flex items-center">
                                                {renderAvatar(user.fullname, user.avatar)}
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium truncate">{user.fullname}</div>
                                                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <select
                                                    value={user.permission || permission}
                                                    onChange={(e) => handleUpdateUserPermission(
                                                        user._id,
                                                        e.target.value as 'view' | 'edit'
                                                    )}
                                                    className="mr-2 text-xs cursor-pointer border border-gray-300 rounded px-1 py-0.5 focus:border-[#21b4ca] focus:outline-none focus:ring-1 focus:ring-[#21b4ca]"
                                                >
                                                    <option className='cursor-pointer' value="view">View</option>
                                                    <option className='cursor-pointer' value="edit">Edit</option>
                                                </select>
                                                <button
                                                    onClick={() => handleRemoveUser(user._id)}
                                                    className="text-red-500 hover:text-red-700 cursor-pointer"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : !loadingFriends && searchTerm.trim() === '' && (
                            <div className="mb-4 p-4 bg-gray-100 rounded-lg text-center">
                                <svg className="w-10 h-10 mx-auto mb-2 text-gray-500" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" fill="currentColor" />
                                </svg>
                                <p className="text-sm text-gray-700">Search for friends to share with</p>
                                <p className="text-xs text-gray-500 mt-1">Type in the search box above to find people</p>
                            </div>
                        )}

                        {(errorMessage || shareError) && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                                {errorMessage || shareError}
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 cursor-pointer rounded-lg hover:bg-gray-200 focus:outline-none"
                            disabled={loading || shareLoading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleShare}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#21b4ca] rounded-lg hover:bg-[#1a8fa3] cursor-pointer focus:outline-none disabled:bg-gray-300 disabled:text-gray-500"
                            disabled={loading || shareLoading || selectedUsers.length === 0}
                        >
                            {loading || shareLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-1"></div>
                                    <span>Sharing...</span>
                                </div>
                            ) : 'Share'}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ShareModal; 