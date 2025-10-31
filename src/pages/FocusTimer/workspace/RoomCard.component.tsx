import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAppTranslate } from '../../../hooks/useAppTranslate';
import { User } from '../../../services/focusRoom.service';
import focusRoomService from '../../../services/focusRoom.service';

// CSS Styles for different room types
const getRoomCardStyles = (type: 'public' | 'private', havePassword: boolean) => {
    const baseCardStyle = {
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
    };

    const baseCardBg = '#ffffff';
    const cardShadowHover = {
        public: '0 8px 24px rgba(168, 85, 247, 0.15)',
        private_no_pass: '0 8px 20px rgba(34, 197, 94, 0.15)',
        private_pass: '0 12px 32px rgba(249, 115, 22, 0.12)',
    };

    const borderStyles = {
        public: '#e5e7eb',
        private_no_pass: '#e5e7eb',
        private_pass: '#e5e7eb',
    };

    const cardKey = type === 'public' ? 'public' : havePassword ? 'private_pass' : 'private_no_pass';

    return {
        card: {
            ...baseCardStyle,
            backgroundColor: baseCardBg,
            borderColor: borderStyles[cardKey],
            borderWidth: '1px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
        cardHover: {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        },
        typeIndicator: {
            public: {
                bg: '#e9d5ff',
                text: '#6d28d9',
                badge: 'Public',
            },
            private_no_pass: {
                bg: '#dcfce7',
                text: '#15803d',
                badge: 'Private',
            },
            private_pass: {
                bg: '#fed7aa',
                text: '#9a3412',
                badge: 'Protected',
            },
        },
        buttonGradient: {
            public: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
            private_no_pass: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
            private_pass: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
        },
    };
};

const getTypeLabel = (type: 'public' | 'private', havePassword: boolean) => {
    const styles = getRoomCardStyles(type, havePassword);
    const cardKey = type === 'public' ? 'public' : havePassword ? 'private_pass' : 'private_no_pass';
    return {
        label: styles.typeIndicator[cardKey].badge,
        bg: styles.typeIndicator[cardKey].bg,
        text: styles.typeIndicator[cardKey].text,
    };
};

const getButtonStyle = (type: 'public' | 'private', havePassword: boolean, isLoading: boolean = false) => {
    const styles = getRoomCardStyles(type, havePassword);
    const cardKey = type === 'public' ? 'public' : havePassword ? 'private_pass' : 'private_no_pass';
    return {
        background: isLoading ? '#d1d5db' : styles.buttonGradient[cardKey],
    };
};

interface RoomCardProps {
    id: string;
    title: string;
    host: User | null;
    description: string;
    type: 'public' | 'private';
    have_password: boolean;
    userAccessStatus?: 'allowed' | 'pending' | 'password_required' | 'denied';
    participants: number;
    memberCount?: number;
    joinRoom: (roomId: string, password?: string, joinType?: 'password' | 'request') => Promise<void>;
    date: string;
    isOwner?: boolean;
    onRoomUpdated?: () => void;
}

const RoomCard: React.FC<RoomCardProps> = ({
    id,
    title,
    host,
    description,
    type,
    have_password,
    userAccessStatus = 'allowed',
    participants,
    memberCount = 0,
    date,
    joinRoom,
    isOwner = false,
    onRoomUpdated,
}) => {
    const { t } = useAppTranslate('focus-room');
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [showRequestConfirm, setShowRequestConfirm] = useState(false);
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editType, setEditType] = useState<'title' | 'description' | 'access_type' | 'password' | 'add_password' | null>(null);
    const [editValue, setEditValue] = useState('');
    const [addPasswordToPrivate, setAddPasswordToPrivate] = useState(false);
    const [newPrivatePassword, setNewPrivatePassword] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const contextMenuRef = useRef<HTMLDivElement>(null);

    // Handle click outside context menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
                setShowContextMenu(false);
            }
        };

        if (showContextMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showContextMenu]);

    const handleJoinWithPassword = async () => {
        if (!password) return;
        try {
            setIsLoading(true);
            await joinRoom(id, password, 'password');
            setPassword('');
            setShowPasswordInput(false);
            toast.success(t('roomCard.joinedSuccessfully'));
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message;
            if (errorMsg?.includes('Password không chính xác')) {
                toast.error(t('roomCard.incorrectPassword'));
            } else {
                toast.error(errorMsg || t('roomCard.failedToJoin'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestJoin = async () => {
        try {
            setIsLoading(true);
            await joinRoom(id, undefined, 'request');
            setShowRequestConfirm(false);
            toast.success(t('roomCard.requestSent'));
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message;
            if (errorMsg?.includes('Đã gửi yêu cầu')) {
                toast.info(t('roomCard.alreadyRequested'));
            } else {
                toast.error(errorMsg || t('roomCard.failedToSendRequest'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinPublic = async () => {
        try {
            setIsLoading(true);
            await joinRoom(id);
            toast.success(t('roomCard.joinedSuccessfully'));
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message;
            toast.error(errorMsg || t('roomCard.failedToJoin'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemovePassword = async () => {
        try {
            setIsLoading(true);
            await focusRoomService.updateRoom(id, { remove_password: true });
            toast.success(t('roomContext.passwordRemoved'));
            onRoomUpdated?.();
            setShowContextMenu(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('roomContext.failedToRemovePassword'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (oldPass: string, newPass: string) => {
        try {
            setIsLoading(true);
            await focusRoomService.updateRoom(id, {
                old_password: oldPass,
                new_password: newPass,
            });
            toast.success(t('roomContext.passwordChanged'));
            onRoomUpdated?.();
            setShowEditModal(false);
            setEditType(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('roomContext.failedToChangePassword'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangeAccessType = async (newType: 'public' | 'private') => {
        try {
            setIsLoading(true);
            const updateData: any = { access_type: newType };

            // If changing to private and user wants to add password
            if (newType === 'private' && addPasswordToPrivate && newPrivatePassword) {
                updateData.new_password = newPrivatePassword;
            }

            await focusRoomService.updateRoom(id, updateData);
            toast.success(t('roomEdit.accessTypeChanged'));
            onRoomUpdated?.();
            setShowContextMenu(false);
            setShowEditModal(false);
            setEditType(null);
            setAddPasswordToPrivate(false);
            setNewPrivatePassword('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('errors.failedToChangeAccessType'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateField = async (field: 'title' | 'description', value: string) => {
        try {
            setIsLoading(true);
            const updateData = field === 'title' ? { name: value } : { description: value };
            await focusRoomService.updateRoom(id, updateData);
            const successKey = field === 'title' ? 'roomEdit.titleUpdated' : 'roomEdit.descriptionUpdated';
            toast.success(t(successKey));
            onRoomUpdated?.();
            setShowEditModal(false);
            setEditType(null);
            setEditValue('');
        } catch (error: any) {
            const errorKey = field === 'title' ? 'errors.failedToUpdateTitle' : 'errors.failedToUpdateDescription';
            toast.error(error.response?.data?.message || t(errorKey));
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddPassword = async (password: string) => {
        try {
            setIsLoading(true);
            await focusRoomService.updateRoom(id, { new_password: password });
            toast.success(t('roomContext.passwordAdded'));
            onRoomUpdated?.();
            setShowEditModal(false);
            setEditType(null);
            setEditValue('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('errors.failedToAddPassword'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteRoom = async () => {
        try {
            setIsLoading(true);
            await focusRoomService.deleteRoom(id);
            toast.success(t('roomContext.roomDeleted'));
            setShowDeleteConfirm(false);
            onRoomUpdated?.();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('errors.failedToDeleteRoom'));
        } finally {
            setIsLoading(false);
        }
    };



    const renderOwnerMenu = () => {
        if (!isOwner) return null;

        return (
            <div className="flex flex-col w-full ">
                <button
                    onClick={() => {
                        setEditType('title');
                        setEditValue(title);
                        setShowEditModal(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors border-b border-gray-200"
                >
                    {t('roomEdit.changeTitle')}
                </button>
                <button
                    onClick={() => {
                        setEditType('description');
                        setEditValue(description);
                        setShowEditModal(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors border-b border-gray-200"
                >
                    {t('roomEdit.changeDescription')}
                </button>
                <button
                    onClick={() => {
                        setEditType('access_type');
                        setShowEditModal(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors border-b border-gray-200"
                >
                    {t('roomEdit.changeType')}
                </button>
                {type === 'private' && have_password && (
                    <>
                        <button
                            onClick={() => {
                                setEditType('password');
                                setShowEditModal(true);
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors border-b border-gray-200"
                        >
                            {t('roomEdit.changePassword')}
                        </button>
                        <button
                            onClick={handleRemovePassword}
                            disabled={isLoading}
                            className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors border-b border-gray-200 disabled:opacity-50"
                        >
                            {t('roomEdit.removePassword')}
                        </button>
                    </>
                )}
                {type === 'private' && !have_password && (
                    <button
                        onClick={() => {
                            setEditType('add_password');
                            setShowEditModal(true);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors border-b border-gray-200"
                    >
                        {t('roomEdit.addPassword')}
                    </button>
                )}
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-orange-700 hover:bg-orange-50 transition-colors rounded-b-lg"
                >
                    {t('roomContext.deleteRoom')}
                </button>
            </div>
        );
    };

    const cardStyles = getRoomCardStyles(type, have_password);
    const typeLabel = getTypeLabel(type, have_password);

    return (
        <div
            className="rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-lg border cursor-pointer hover:-translate-y-1"
            style={cardStyles.card}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = cardStyles.cardHover.boxShadow;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = cardStyles.card.boxShadow;
            }}
        >
            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                {/* Header */}
                <div className="mb-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 truncate leading-tight">{title}</h3>
                            {/* Type Badge */}
                            <div
                                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold mt-2"
                                style={{ backgroundColor: typeLabel.bg, color: typeLabel.text }}
                            >
                                {typeLabel.label}
                            </div>
                        </div>
                        {isOwner && (
                            <div className="relative flex-shrink-0" ref={contextMenuRef}>
                                <button
                                    onClick={() => setShowContextMenu(!showContextMenu)}
                                    className="px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors border border-gray-300 hover:bg-gray-100"
                                    title={t('roomCard.options')}
                                >
                                    ⋮
                                </button>
                                {showContextMenu && (
                                    <div
                                        className="absolute right-0 top-7 w-56 rounded-xl z-50 border overflow-hidden"
                                        style={{
                                            background: '#ffffff',
                                            borderColor: '#e5e5e5',
                                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                                        }}
                                    >
                                        {renderOwnerMenu()}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Host Info */}
                    {host && (
                        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gray-50">
                            {host?.avatar_url && (
                                <img
                                    src={host.avatar_url}
                                    alt={host.full_name}
                                    className="w-6 h-6 rounded-full border border-gray-300"
                                />
                            )}
                            <span className="text-xs text-gray-700 font-medium">{host?.full_name || t('roomCard.anonymous')}</span>
                        </div>
                    )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-2">{description}</p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-gray-600 mb-4 px-2 py-2 rounded-lg bg-gray-50">
                    <span>{new Date(date).toLocaleDateString('vi-VN')}</span>
                    <span className="font-medium">{memberCount} {t('roomCard.members')}</span>
                </div>

                {/* Password Warning */}
                {have_password && !showPasswordInput && (
                    <div className="mb-4 px-3 py-2 rounded-lg text-xs text-orange-700 font-medium bg-orange-50 border border-orange-200">
                        {t('password.required')}
                    </div>
                )}

                {/* Password Input */}
                {showPasswordInput && have_password && (
                    <div className="mb-4 space-y-2">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t('password.enterPassword')}
                            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && password) {
                                    handleJoinWithPassword();
                                }
                            }}
                            autoFocus
                        />
                        <button
                            onClick={handleJoinWithPassword}
                            disabled={!password || isLoading}
                            className="w-full px-3 py-2 text-sm font-semibold text-white rounded-lg transition-all disabled:opacity-50"
                            style={{
                                background: !password || isLoading ? '#d1d5db' : 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
                            }}
                        >
                            {isLoading ? t('waiting.entering') : t('roomCard.enter')}
                        </button>
                    </div>
                )}

                {/* Request Confirmation */}
                {showRequestConfirm && (
                    <div className="mb-4 space-y-3 border-t border-gray-200 pt-4">
                        <p className="text-sm text-gray-700 font-medium">{t('joinRequest.confirmRequest')}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleRequestJoin}
                                disabled={isLoading}
                                className="flex-1 px-3 py-2 text-sm font-semibold text-white rounded-lg transition-all disabled:opacity-50"
                                style={{
                                    background: isLoading ? '#d1d5db' : 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
                                }}
                            >
                                {isLoading ? t('waiting.sending') : t('joinRequest.sendRequest')}
                            </button>
                            <button
                                onClick={() => setShowRequestConfirm(false)}
                                disabled={isLoading}
                                className="flex-1 px-3 py-2 text-sm font-semibold text-gray-700 rounded-lg transition-all border border-gray-300 hover:bg-gray-50"
                            >
                                {t('roomContext.cancel')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {showEditModal && editType && (
                    <div
                        className="fixed inset-0 bg-black/50 bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm"
                        onClick={() => setShowEditModal(false)}
                    >
                        <div
                            className="rounded-2xl p-6 w-96 max-w-[90%] border bg-white"
                            style={{
                                borderColor: '#e5e5e5',
                                boxShadow: '0 20px 48px rgba(0, 0, 0, 0.2)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Title Edit */}
                            {editType === 'title' && (
                                <>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('roomEdit.changeTitle')}</h3>
                                    <p className="text-xs text-gray-600 mb-4">{t('roomEdit.updateRoomName')}</p>
                                    <input
                                        type="text"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        placeholder={t('createRoom.roomName')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdateField('title', editValue)}
                                            disabled={!editValue || isLoading}
                                            className="flex-1 px-4 py-2 text-white rounded-lg font-semibold text-sm disabled:opacity-50 transition-all"
                                            style={{
                                                background: !editValue || isLoading ? '#d1d5db' : 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
                                            }}
                                        >
                                            {t('roomContext.save')}
                                        </button>
                                        <button
                                            onClick={() => setShowEditModal(false)}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-sm transition-all"
                                        >
                                            {t('roomContext.cancel')}
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Description Edit */}
                            {editType === 'description' && (
                                <>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('roomEdit.changeDescription')}</h3>
                                    <p className="text-xs text-gray-600 mb-4">{t('roomEdit.updateRoomDetails')}</p>
                                    <textarea
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        placeholder={t('createRoom.description')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none h-24 transition-all"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdateField('description', editValue)}
                                            disabled={isLoading}
                                            className="flex-1 px-4 py-2 text-white rounded-lg font-semibold text-sm disabled:opacity-50 transition-all"
                                            style={{
                                                background: isLoading ? '#d1d5db' : 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
                                            }}
                                        >
                                            {t('roomContext.save')}
                                        </button>
                                        <button
                                            onClick={() => setShowEditModal(false)}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-sm transition-all"
                                        >
                                            {t('roomContext.cancel')}
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Access Type Change */}
                            {editType === 'access_type' && (
                                <>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('roomEdit.changeType')}</h3>
                                    <p className="text-xs text-gray-600 mb-4">
                                        {t('roomEdit.currentType')}: <span className="text-gray-900 font-semibold">{type === 'public' ? t('createRoom.public') : t('createRoom.private')}</span>
                                    </p>

                                    {type === 'public' && (
                                        <div className="mb-4 p-3 rounded-lg border border-gray-300 bg-gray-50">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={addPasswordToPrivate}
                                                    onChange={(e) => setAddPasswordToPrivate(e.target.checked)}
                                                    className="w-4 h-4 rounded border-gray-400 cursor-pointer accent-gray-700"
                                                />
                                                <span className="text-sm font-medium text-gray-700">{t('roomEdit.addPasswordForPrivacy')}</span>
                                            </label>

                                            {addPasswordToPrivate && (
                                                <input
                                                    type="password"
                                                    value={newPrivatePassword}
                                                    onChange={(e) => setNewPrivatePassword(e.target.value)}
                                                    placeholder={t('password.enterPassword')}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all"
                                                    autoFocus
                                                />
                                            )}
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleChangeAccessType(type === 'public' ? 'private' : 'public')}
                                            disabled={isLoading || (type === 'public' && addPasswordToPrivate && !newPrivatePassword)}
                                            className="flex-1 px-4 py-2 text-white rounded-lg font-semibold text-sm disabled:opacity-50 transition-all"
                                            style={{
                                                background: isLoading || (type === 'public' && addPasswordToPrivate && !newPrivatePassword) ? '#d1d5db' : 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
                                            }}
                                        >
                                            {t('roomEdit.changeTo')} {type === 'public' ? t('createRoom.private') : t('createRoom.public')}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowEditModal(false);
                                                setAddPasswordToPrivate(false);
                                                setNewPrivatePassword('');
                                            }}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-sm transition-all"
                                        >
                                            {t('roomContext.cancel')}
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Password Change */}
                            {editType === 'password' && (
                                <>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('roomEdit.changePassword')}</h3>
                                    <p className="text-xs text-gray-600 mb-4">{t('roomEdit.updateRoomSecurity')}</p>
                                    <input
                                        type="password"
                                        id="oldPassword"
                                        placeholder={t('password.oldPassword')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all"
                                        autoFocus
                                    />
                                    <input
                                        type="password"
                                        id="newPassword"
                                        placeholder={t('password.newPassword')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                const oldPass = (document.getElementById('oldPassword') as HTMLInputElement)?.value;
                                                const newPass = (document.getElementById('newPassword') as HTMLInputElement)?.value;
                                                if (oldPass && newPass) {
                                                    handleChangePassword(oldPass, newPass);
                                                } else {
                                                    toast.error(t('errors.bothPasswordRequired'));
                                                }
                                            }}
                                            disabled={isLoading}
                                            className="flex-1 px-4 py-2 text-white rounded-lg font-semibold text-sm disabled:opacity-50 transition-all"
                                            style={{
                                                background: isLoading ? '#d1d5db' : 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
                                            }}
                                        >
                                            {t('roomEdit.update')}
                                        </button>
                                        <button
                                            onClick={() => setShowEditModal(false)}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-sm transition-all"
                                        >
                                            {t('roomContext.cancel')}
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Add Password Modal */}
                            {editType === 'add_password' && (
                                <>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('roomEdit.addPassword')}</h3>
                                    <p className="text-xs text-gray-600 mb-4">{t('roomEdit.protectPrivateRoom')}</p>
                                    <input
                                        type="password"
                                        id="addPasswordField"
                                        placeholder={t('password.enterPassword')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                const pass = (document.getElementById('addPasswordField') as HTMLInputElement)?.value;
                                                if (pass) {
                                                    handleAddPassword(pass);
                                                } else {
                                                    toast.error(t('errors.passwordRequired'));
                                                }
                                            }}
                                            disabled={isLoading}
                                            className="flex-1 px-4 py-2 text-white rounded-lg font-semibold text-sm disabled:opacity-50 transition-all"
                                            style={{
                                                background: isLoading ? '#d1d5db' : 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
                                            }}
                                        >
                                            {t('roomEdit.addPassword')}
                                        </button>
                                        <button
                                            onClick={() => setShowEditModal(false)}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-sm transition-all"
                                        >
                                            {t('roomContext.cancel')}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div
                        className="fixed inset-0 bg-black/50 bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm"
                        onClick={() => setShowDeleteConfirm(false)}
                    >
                        <div
                            className="rounded-2xl p-6 w-96 max-w-[90%] border bg-white"
                            style={{
                                borderColor: '#e5e5e5',
                                boxShadow: '0 20px 48px rgba(0, 0, 0, 0.2)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('roomContext.deleteRoom')}</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                {t('roomContext.deleteRoomConfirm')}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDeleteRoom}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 text-white rounded-lg font-semibold text-sm disabled:opacity-50 transition-all"
                                    style={{
                                        background: isLoading ? '#d1d5db' : '#ef4444',
                                    }}
                                >
                                    {isLoading ? t('waiting.deleting') : t('roomContext.delete')}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-sm transition-all"
                                >
                                    {t('roomContext.cancel')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer - Action Buttons (Full Width) */}
            <div className="border-t px-0 py-0" style={{ borderColor: cardStyles.card.borderColor }}>
                {userAccessStatus === 'allowed' && (
                    <button
                        onClick={handleJoinPublic}
                        disabled={isLoading}
                        className="w-full px-4 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50 hover:shadow-lg"
                        style={getButtonStyle(type, have_password, isLoading)}
                    >
                        {isLoading ? t('waiting.joining') : t('roomCard.joinRoom')}
                    </button>
                )}

                {userAccessStatus === 'pending' && (
                    <div className="flex">
                        {have_password && (
                            <button
                                onClick={() => setShowPasswordInput(!showPasswordInput)}
                                disabled={isLoading}
                                className="flex-1 px-4 py-3 text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors border-r disabled:opacity-50"
                                style={{ borderColor: cardStyles.card.borderColor }}
                            >
                                {t('roomCard.joinWithPassword')}
                            </button>
                        )}
                        <button
                            onClick={() => setShowRequestConfirm(true)}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50 hover:shadow-lg"
                            style={getButtonStyle(type, have_password, isLoading)}
                        >
                            {t('joinRequest.requestAccess')}
                        </button>
                    </div>
                )}

                {userAccessStatus === 'password_required' && (
                    <div className="flex">
                        <button
                            onClick={() => setShowPasswordInput(!showPasswordInput)}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors border-r disabled:opacity-50"
                            style={{ borderColor: cardStyles.card.borderColor }}
                        >
                            {t('roomCard.enterPassword')}
                        </button>
                        <button
                            onClick={() => setShowRequestConfirm(true)}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50 hover:shadow-lg"
                            style={getButtonStyle(type, have_password, isLoading)}
                        >
                            {t('joinRequest.requestAccess')}
                        </button>
                    </div>
                )}

                {userAccessStatus === 'denied' && (
                    <button
                        onClick={() => setShowRequestConfirm(true)}
                        disabled={isLoading}
                        className="w-full px-4 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50 hover:shadow-lg"
                        style={getButtonStyle(type, have_password, isLoading)}
                    >
                        {isLoading ? t('waiting.sending') : t('joinRequest.requestAccess')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default RoomCard;
