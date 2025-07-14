import React from 'react';
import { RootItem } from '../../types/note/note.types';
import { Friend } from '../../types/friend/response/friend.response';
import { useSendNoteToChatModal } from '../../hooks/note/useSendNoteToChatModal.hook';
import { GROUP_CLASSNAMES } from '../../styles';

interface SendToChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedItem: RootItem | null;
}

const SendToChatModal: React.FC<SendToChatModalProps> = ({
    isOpen,
    onClose,
    selectedItem,
}) => {
    const {
        loading,
        searchQuery,
        setSearchQuery,
        filteredFriends,
        selectedFriends,
        sending,
        isFocused,
        setIsFocused,
        handleSendNote,
        handleFriendSelect,
        isFriendSelected,
        selectAllFriends,
        deselectAllFriends,
        sendProgress
    } = useSendNoteToChatModal(isOpen, onClose, selectedItem);

    if (!isOpen) return null;

    return (
        <div className={GROUP_CLASSNAMES.modalOverlay}>
            <div className={GROUP_CLASSNAMES.modalContainer + ' p-6'}>
                <div className={GROUP_CLASSNAMES.flexJustifyBetween + ' mb-4'}>
                    <h3 className="text-lg font-semibold text-gray-900">Send note to chat</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 cursor-pointer hover:text-gray-700 p-1 rounded-lg"
                        disabled={sending}
                        aria-label="Close"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Note: <span className="font-semibold">{selectedItem && selectedItem.type === 'file' ? selectedItem.title : 'Untitled Note'}</span></p>
                </div>
                <div className="mb-4 relative">
                    <label
                        htmlFor="search-friend-input"
                        className={`absolute select-none outline-none pointer-events-none duration-300 left-3 text-xs z-10 block transition-all bg-white px-1 ${isFocused || searchQuery ? 'text-[#21b4ca] -top-2' : 'text-gray-500 top-[50%] text-[16px] bg-transparent px-0'} ${isFocused || searchQuery ? '' : '-translate-y-1/2'}`}
                    >
                        Search friends
                    </label>
                    <div className={`relative w-full h-14 border-2 rounded-xl transition-colors duration-200 ${isFocused ? 'border-[#21b4ca]' : 'border-gray-200 focus-within:border-[#21b4ca]'}`}>
                        <input
                            id="search-friend-input"
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className={GROUP_CLASSNAMES.inputTransparent}
                            autoFocus
                            disabled={sending}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder=" "
                        />
                        {loading && (
                            <div className={GROUP_CLASSNAMES.absoluteCenter}>
                                <div className={GROUP_CLASSNAMES.loadingSpinner}></div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-600">
                        {selectedFriends.length} {selectedFriends.length === 1 ? 'recipient' : 'recipients'} selected
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={selectAllFriends}
                            className="text-xs text-[#21b4ca] hover:text-[#1a9db0]"
                            disabled={sending || filteredFriends.length === 0}
                        >
                            Select all
                        </button>
                        {selectedFriends.length > 0 && (
                            <button
                                onClick={deselectAllFriends}
                                className="text-xs text-gray-500 hover:text-gray-700"
                                disabled={sending}
                            >
                                Clear selection
                            </button>
                        )}
                    </div>
                </div>

                <div className="mb-4 max-h-48 overflow-y-auto">
                    {filteredFriends.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No friends found</p>
                    ) : (
                        <div className="space-y-2">
                            {filteredFriends.map((friend) => (
                                <div
                                    key={friend.friend_id}
                                    onClick={() => handleFriendSelect(friend)}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors ${isFriendSelected(friend.friend_id) ? 'bg-[#e6f7f9] border border-[#21b4ca]' : 'bg-gray-50 hover:bg-gray-100'}`}
                                >
                                    <div className="flex items-center">
                                        <div className="flex items-center justify-center mr-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isFriendSelected(friend.friend_id) ? 'border-[#21b4ca] bg-[#21b4ca]' : 'border-gray-300'}`}>
                                                {isFriendSelected(friend.friend_id) && (
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 bg-[#21b4ca] rounded-full flex items-center justify-center text-white font-semibold mr-3">
                                            <img src={friend.friendInfo?.avatar_url} alt="avatar" className="w-full h-full object-cover rounded-full" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {friend.friendInfo?.full_name || 'Unknown'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {friend.friendInfo?.email || ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {sending && sendProgress.total > 0 && (
                    <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-[#21b4ca] h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${(sendProgress.current / sendProgress.total) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">
                            Sending {sendProgress.current} of {sendProgress.total}
                        </p>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className={GROUP_CLASSNAMES.buttonSecondary + ' flex-1 cursor-pointer'}
                        disabled={sending}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSendNote}
                        disabled={selectedFriends.length === 0 || sending}
                        className={GROUP_CLASSNAMES.buttonPrimary + ' flex-1 bg-[#21b4ca] flex items-center justify-center gap-2 cursor-pointer text-sm'}
                    >
                        {sending ? (
                            <>
                                <div className={GROUP_CLASSNAMES.loadingSpinnerSmall}></div>
                                <span>Sending...</span>
                            </>
                        ) : (
                            <>

                                <span>Send to {selectedFriends.length} {selectedFriends.length === 1 ? 'recipient' : 'recipients'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SendToChatModal; 