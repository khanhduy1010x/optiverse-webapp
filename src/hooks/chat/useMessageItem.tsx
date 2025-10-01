import React, { useState, useRef, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { Box, Tooltip } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useMessageActions } from './useMessageActions';
import AudioMessage from '../../components/chat/AudioMessage';
import ReplyMessage from '../../components/chat/ReplyMessage';
import { MessageType, ReactionType } from '../../types/chat/MessageType';

interface UseMessageItemProps {
    message: MessageType;
    conversationId: string;
    users: Record<string, any>;
    isCurrentUser: boolean;
    onPin?: (messageId: string) => void;
    onReply?: (message: MessageType) => void;
}

export const useMessageItem = ({
    message,
    conversationId,
    users,
    isCurrentUser,
    onPin,
    onReply
}: UseMessageItemProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [reactionAnchorEl, setReactionAnchorEl] = useState<null | HTMLElement>(null);
    const reactionPickerRef = useRef<HTMLDivElement>(null);
    const currentUserId = localStorage.getItem('user_id') || '';

    const {
        addReaction,
        removeReaction,
        deleteMessage,
        hideMessage,
        unhideMessage,
        isMessageHidden,
        isMessageDeleted,
        getCurrentUserReaction,
    } = useMessageActions(conversationId);

    const isHidden = useMemo(() => isMessageHidden(message), [isMessageHidden, message]);
    const isDeleted = useMemo(() => isMessageDeleted(message), [isMessageDeleted, message]);
    const currentUserReaction = useMemo(() => getCurrentUserReaction(message), [getCurrentUserReaction, message]);

    // Đóng reaction picker khi click ra ngoài
    useEffect(() => {
        if (!showReactionPicker) return;
        function handleClickOutside(event: MouseEvent) {
            if (
                reactionPickerRef.current &&
                !reactionPickerRef.current.contains(event.target as Node)
            ) {
                setShowReactionPicker(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showReactionPicker]);

    // Xử lý mở menu
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    // Xử lý đóng menu
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Xử lý mở reaction picker
    const handleReactionPickerOpen = (event: React.MouseEvent<HTMLElement>) => {
        setReactionAnchorEl(event.currentTarget);
        setShowReactionPicker(true);
    };

    // Xử lý đóng reaction picker
    const handleReactionPickerClose = () => {
        setReactionAnchorEl(null);
        setShowReactionPicker(false);
    };

    // Xử lý thêm reaction
    const handleAddReaction = async (reaction: ReactionType) => {
        try {
            const success = await addReaction(message.id, reaction);
            if (!success) {
                toast.error('Không thể thêm biểu cảm');
            }
        } catch (error) {
            console.error('Error adding reaction:', error);
            toast.error('Đã xảy ra lỗi khi thêm biểu cảm');
        }
        handleReactionPickerClose();
    };

    // Xử lý xóa reaction
    const handleRemoveReaction = async () => {
        try {
            const success = await removeReaction(message.id);
            if (!success) {
                toast.error('Không thể xóa biểu cảm');
            }
        } catch (error) {
            console.error('Error removing reaction:', error);
            toast.error('Đã xảy ra lỗi khi xóa biểu cảm');
        }
    };

    // Xử lý xóa reaction cụ thể
    const handleRemoveSpecificReaction = async (reactionType: ReactionType) => {
        try {
            const success = await removeReaction(message.id, reactionType);
            if (!success) {
                toast.error('Không thể xóa biểu cảm');
            }
        } catch (error) {
            console.error('Error removing specific reaction:', error);
            toast.error('Đã xảy ra lỗi khi xóa biểu cảm');
        }
    };

    // Xử lý ghim tin nhắn
    const handlePinMessage = () => {
        if (onPin) {
            onPin(message.id);
        }
        handleMenuClose();
    };

    // Xử lý xóa tin nhắn
    const handleDeleteMessage = async () => {
        try {
            const success = await deleteMessage(message.id);
            if (success) {
                toast.success('Đã xóa tin nhắn');
            } else {
                toast.error('Không thể xóa tin nhắn');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            toast.error('Đã xảy ra lỗi khi xóa tin nhắn');
        }
        handleMenuClose();
    };

    // Xử lý ẩn/hiện tin nhắn
    const handleToggleVisibility = async () => {
        try {
            let success;
            if (isHidden) {
                success = await unhideMessage(message.id);
                if (success) {
                    toast.success('Message unhidden');
                } else {
                    toast.error('Could not unhide message');
                }
            } else {
                success = await hideMessage(message.id);
                if (success) {
                    toast.success('Message hidden');
                } else {
                    toast.error('Could not hide message');
                }
            }
        } catch (error) {
            console.error('Error toggling message visibility:', error);
            toast.error('An error occurred while changing message visibility');
        }
        handleMenuClose();
    };

    // Xử lý trả lời tin nhắn
    const handleReplyMessage = () => {
        if (onReply) {
            onReply(message);
        }
        handleMenuClose();
    };

    // Hàm để detect và parse note message
    const parseNoteMessage = (text: string) => {
        const notePattern = /📝 \*\*(.*?)\*\*\n\n([\s\S]*)/;
        const match = text.match(notePattern);
        if (match) {
            return {
                title: match[1],
                content: match[2]
            };
        }
        return null;
    };

    const noteData = message.text ? parseNoteMessage(message.text) : null;

    // Định dạng thời gian
    const formattedTime = useMemo(() => {
        // Hỗ trợ cả createdAt (individual chat) và timestamp (group chat)
        const messageTime = message.createdAt || (message as any).timestamp;
        if (!messageTime) return { time: '', date: '' };

        // Tách thời gian và ngày để hiển thị tốt hơn
        const date = new Date(messageTime);
        const timeStr = format(date, 'HH:mm', { locale: vi });
        const dateStr = format(date, 'dd/MM/yyyy', { locale: vi });

        return { time: timeStr, date: dateStr };
    }, [message.createdAt, (message as any).timestamp]);

    // Tính toán reactionCounts mới:
    const reactionCounts = useMemo(() => {
        const counts: Record<string, { count: number, users: string[] }> = {};
        if (message.reactions) {
            Object.entries(message.reactions).forEach(([userId, userReacts]) => {
                Object.entries(userReacts as Record<string, number>).forEach(([emoji, num]) => {
                    if (!counts[emoji]) counts[emoji] = { count: 0, users: [] };
                    counts[emoji].count += num;
                    if (!counts[emoji].users.includes(userId)) counts[emoji].users.push(userId);
                });
            });
        }
        return counts;
    }, [message.reactions]);

    // Hiển thị trạng thái đã đọc
    const renderReadStatus = () => {
        if (!isCurrentUser) return null;

        const currentUserId = localStorage.getItem('user_id');
        if (!currentUserId) return null;

        // Kiểm tra xem có người khác đã đọc tin nhắn này chưa
        const readByOthers = message.readBy && Object.keys(message.readBy).some(uid => uid !== currentUserId);

        if (!readByOthers) {
            return (
                <Tooltip title="Đã gửi">
                    <DoneIcon fontSize="small" sx={{ ml: 0.5, color: 'rgba(255,255,255,0.7)', fontSize: '14px' }} />
                </Tooltip>
            );
        } else {
            return (
                <Tooltip title="Đã xem">
                    <DoneAllIcon fontSize="small" sx={{ ml: 0.5, color: 'rgba(255,255,255,0.9)', fontSize: '14px' }} />
                </Tooltip>
            );
        }
    };

    // Xử lý hiển thị hình ảnh
    const renderImages = () => {
        if (!message.images || message.images.length === 0) return null;

        // Đảm bảo message.images không undefined
        const images = message.images;
        const hasText = message.text ? true : false;

        // Xác định layout dựa vào số lượng ảnh
        const getImageLayout = () => {
            const count = images.length;

            if (count === 1) {
                return (
                    <div className="single-image" style={{ maxWidth: '100%' }}>
                        <img
                            src={images[0]}
                            alt="Hình ảnh"
                            loading="lazy"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '200px',
                                borderRadius: '8px',
                                objectFit: 'cover',
                                cursor: 'pointer'
                            }}
                            onClick={() => window.open(images[0], '_blank')}
                        />
                    </div>
                );
            } else if (count === 2) {
                return (
                    <div style={{
                        display: 'flex',
                        gap: '4px',
                        maxWidth: '100%',
                        flexWrap: 'wrap'
                    }}>
                        {images.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt={`Hình ảnh ${index + 1}`}
                                loading="lazy"
                                style={{
                                    width: 'calc(50% - 2px)',
                                    height: '120px',
                                    borderRadius: '8px',
                                    objectFit: 'cover',
                                    cursor: 'pointer'
                                }}
                                onClick={() => window.open(img, '_blank')}
                            />
                        ))}
                    </div>
                );
            } else if (count === 3) {
                return (
                    <div style={{ maxWidth: '100%' }}>
                        <div style={{ marginBottom: '4px', maxWidth: '100%' }}>
                            <img
                                src={images[0]}
                                alt="Hình ảnh 1"
                                loading="lazy"
                                style={{
                                    width: '100%',
                                    maxWidth: '250px',
                                    height: '150px',
                                    borderRadius: '8px',
                                    objectFit: 'cover',
                                    cursor: 'pointer'
                                }}
                                onClick={() => window.open(images[0], '_blank')}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '4px', maxWidth: '250px' }}>
                            <img
                                src={images[1]}
                                alt="Hình ảnh 2"
                                loading="lazy"
                                style={{
                                    width: 'calc(50% - 2px)',
                                    height: '100px',
                                    borderRadius: '8px',
                                    objectFit: 'cover',
                                    cursor: 'pointer'
                                }}
                                onClick={() => window.open(images[1], '_blank')}
                            />
                            <img
                                src={images[2]}
                                alt="Hình ảnh 3"
                                loading="lazy"
                                style={{
                                    width: 'calc(50% - 2px)',
                                    height: '100px',
                                    borderRadius: '8px',
                                    objectFit: 'cover',
                                    cursor: 'pointer'
                                }}
                                onClick={() => window.open(images[2], '_blank')}
                            />
                        </div>
                    </div>
                );
            } else {
                // 4 ảnh trở lên
                return (
                    <div style={{ maxWidth: '250px' }}>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                            <img
                                src={images[0]}
                                alt="Hình ảnh 1"
                                loading="lazy"
                                style={{
                                    width: 'calc(50% - 2px)',
                                    height: '100px',
                                    borderRadius: '8px',
                                    objectFit: 'cover',
                                    cursor: 'pointer'
                                }}
                                onClick={() => window.open(images[0], '_blank')}
                            />
                            <img
                                src={images[1]}
                                alt="Hình ảnh 2"
                                loading="lazy"
                                style={{
                                    width: 'calc(50% - 2px)',
                                    height: '100px',
                                    borderRadius: '8px',
                                    objectFit: 'cover',
                                    cursor: 'pointer'
                                }}
                                onClick={() => window.open(images[1], '_blank')}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <img
                                src={images[2]}
                                alt="Hình ảnh 3"
                                loading="lazy"
                                style={{
                                    width: 'calc(50% - 2px)',
                                    height: '100px',
                                    borderRadius: '8px',
                                    objectFit: 'cover',
                                    cursor: 'pointer'
                                }}
                                onClick={() => window.open(images[2], '_blank')}
                            />
                            <div style={{ position: 'relative', width: 'calc(50% - 2px)', height: '100px' }}>
                                <img
                                    src={images[3]}
                                    alt="Hình ảnh 4"
                                    loading="lazy"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '8px',
                                        objectFit: 'cover',
                                        filter: images.length > 4 ? 'brightness(0.7)' : 'none',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => window.open(images[3], '_blank')}
                                />
                                {images.length > 4 && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '24px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => window.open(images[3], '_blank')}
                                    >
                                        +{images.length - 4}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            }
        };

        return (
            <Box sx={{
                mt: hasText ? 1 : 0,
                mb: 1,
                maxWidth: '100%',
                overflow: 'hidden'
            }}>
                {getImageLayout()}
            </Box>
        );
    };

    // Xử lý hiển thị tin nhắn thoại
    const renderAudio = () => {
        if (!message.audio) return null;

        return (
            <Box sx={{ mt: message.text ? 1 : 0, mb: 1 }}>
                <AudioMessage
                    audioUrl={message.audio.url}
                    duration={message.audio.duration}
                    isCurrentUser={isCurrentUser}
                />
            </Box>
        );
    };

    // Xử lý hiển thị tin nhắn trả lời
    const renderReply = () => {
        if (!message.replyTo) return null;

        const senderName = message.replyTo.senderId === localStorage.getItem('user_id')
            ? 'Bạn'
            : users[message.replyTo.senderId]?.full_name || 'Người dùng';

        return (
            <Box sx={{ mb: 1 }}>
                <ReplyMessage
                    replyText={message.replyTo.text}
                    senderName={senderName}
                    isCurrentUser={isCurrentUser}
                />
            </Box>
        );
    };

    return {
        // State
        anchorEl,
        showReactionPicker,
        reactionAnchorEl,
        reactionPickerRef,
        currentUserId,
        isHidden,
        isDeleted,
        currentUserReaction,
        noteData,
        formattedTime,
        reactionCounts,
        
        // Handlers
        handleMenuOpen,
        handleMenuClose,
        handleReactionPickerOpen,
        handleReactionPickerClose,
        handleAddReaction,
        handleRemoveReaction,
        handleRemoveSpecificReaction,
        handlePinMessage,
        handleDeleteMessage,
        handleToggleVisibility,
        handleReplyMessage,
        parseNoteMessage,
        
        // Render functions
        renderReadStatus,
        renderImages,
        renderAudio,
        renderReply
    };
};