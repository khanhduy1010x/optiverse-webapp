import React from 'react';
import { RootItem } from '../../types/note/note.types';
import friendService from '../../services/friend.service';
import { Friend } from '../../types/friend/response/friend.response';
import { useSendNoteToChat } from '../../hooks/chat/useSendNoteToChat.hook';
import { toast } from 'react-toastify';
import noteService from '../../services/note.service';
import { GROUP_CLASSNAMES } from '../../styles';

interface SendToChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedItem: RootItem | null;
    noteContent?: string;
}

const SendToChatModal: React.FC<SendToChatModalProps> = ({
    isOpen,
    onClose,
    selectedItem,
    noteContent,
}) => {
    const [friends, setFriends] = React.useState<Friend[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filteredFriends, setFilteredFriends] = React.useState<Friend[]>([]);
    const [selectedFriend, setSelectedFriend] = React.useState<Friend | null>(null);
    const [sending, setSending] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    const { sendNoteToChat } = useSendNoteToChat();

    React.useEffect(() => {
        if (isOpen) {
            fetchFriends();
        }
    }, [isOpen]);

    React.useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredFriends(friends);
        } else {
            const filtered = friends.filter(friend =>
                friend.friendInfo?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                friend.friendInfo?.email?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredFriends(filtered);
        }
    }, [searchQuery, friends]);

    const fetchFriends = async () => {
        try {
            setLoading(true);
            const friendsList = await friendService.viewAllFriends();
            setFriends(friendsList);
            setFilteredFriends(friendsList);
        } catch (error) {
            console.error('Error fetching friends:', error);
            toast.error('Could not load friends list');
        } finally {
            setLoading(false);
        }
    };

    const handleSendNote = async () => {
        if (!selectedFriend || !selectedItem) return;
        try {
            setSending(true);
            // Lấy nội dung note từ API
            const note = await noteService.fetchNoteById(selectedItem._id);
            if (!note || !note.content) {
                toast.error('Note has no content');
                setSending(false);
                return;
            }
            const success = await sendNoteToChat(
                selectedFriend.friend_id,
                note.title || 'Untitled Note',
                note.content
            );
            if (success) {
                onClose();
                setSelectedFriend(null);
                setSearchQuery('');
            }
        } catch (error) {
            console.error('Error sending note:', error);
            toast.error('Failed to send note');
        } finally {
            setSending(false);
        }
    };

    const handleFriendSelect = (friend: Friend) => {
        setSelectedFriend(friend);
    };

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
                        className={`absolute select-none outline-none pointer-events-none duration-300 left-3 text-xs z-10 block transition-all bg-white px-1 ${isFocused || searchQuery ? 'text-[#21b4ca] -top-2' : 'text-gray-500 top-[38%] text-[16px] bg-transparent px-0'} ${isFocused || searchQuery ? '' : '-translate-y-1/2'}`}
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
                <div className="mb-4 max-h-48 overflow-y-auto">
                    {filteredFriends.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No friends found</p>
                    ) : (
                        <div className="space-y-2">
                            {filteredFriends.map((friend) => (
                                <div
                                    key={friend.friend_id}
                                    onClick={() => handleFriendSelect(friend)}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedFriend?.friend_id === friend.friend_id ? 'bg-[#e6f7f9] border border-[#21b4ca]' : 'bg-gray-50 hover:bg-gray-100'}`}
                                >
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-[#21b4ca] rounded-full flex items-center justify-center text-white font-semibold mr-3">
                                            {friend.friendInfo?.full_name?.charAt(0)?.toUpperCase() || 'U'}
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
                        disabled={!selectedFriend || sending}
                        className={GROUP_CLASSNAMES.buttonPrimary + ' flex-1 bg-[#21b4ca] flex items-center justify-center gap-2 cursor-pointer'}
                    >
                        {sending ? (
                            <>
                                <div className={GROUP_CLASSNAMES.loadingSpinnerSmall}></div>
                                <span>Sending...</span>
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                <span>Send</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SendToChatModal; 