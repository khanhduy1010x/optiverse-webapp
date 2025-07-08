import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MessageType, ReactionType, MessageStatus } from '../../types/chat/MessageType';
import { Avatar, Box, Typography, IconButton, Menu, MenuItem, Tooltip, Badge, ImageList, ImageListItem } from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    PushPin as PinIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Done as DoneIcon,
    DoneAll as DoneAllIcon,
    Reply as ReplyIcon,
} from '@mui/icons-material';
import { useMessageActions } from '../../hooks/chat/useMessageActions';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import AudioMessage from './AudioMessage';
import ReplyMessage from './ReplyMessage';
import NoteMessage from './NoteMessage.component';
import { UserResponse } from '../../types/auth/auth.types';
import './MessageItem.css';

interface MessageItemProps {
    message: MessageType;
    conversationId: string;
    isCurrentUser: boolean;
    onPin?: (messageId: string) => void;
    onReply?: (message: MessageType) => void;
    users?: Record<string, UserResponse>;
    messageRef?: React.Ref<HTMLDivElement>;
    highlight?: boolean;
    textColor?: string;
}

const StyledReactionButton = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px 8px',
    borderRadius: '12px',
    backgroundColor: theme.palette.grey[100],
    margin: '0 4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: theme.palette.grey[200],
    },
}));

const ReactionPicker = styled(Box)(({ theme }) => ({
    display: 'flex',
    backgroundColor: theme.palette.background.paper,
    borderRadius: '24px',
    padding: '4px',
    boxShadow: theme.shadows[3],
    position: 'absolute',
    bottom: '100%',
    marginBottom: '8px',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease-in-out',
    '@keyframes fadeIn': {
        '0%': {
            opacity: 0,
            transform: 'translateY(10px)',
        },
        '100%': {
            opacity: 1,
            transform: 'translateY(0)',
        },
    },
}));

const ReactionEmoji = styled(Typography)(({ theme }) => ({
    fontSize: '20px',
    padding: '4px',
    cursor: 'pointer',
    borderRadius: '50%',
    '&:hover': {
        backgroundColor: theme.palette.grey[100],
    },
}));

const MessageActionsContainer = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: '-28px',
    display: 'flex',
    opacity: 0,
    transition: 'opacity 0.2s ease',
    backgroundColor: theme.palette.background.paper,
    borderRadius: '20px',
    boxShadow: theme.shadows[1],
    zIndex: 10,
}));

const ReactionButtonsContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    marginTop: '4px',
    flexWrap: 'wrap',
    gap: '4px',
}));

const MessageItem: React.FC<MessageItemProps> = ({
    message,
    conversationId,
    isCurrentUser,
    onPin,
    onReply,
    users = {},
    messageRef,
    highlight,
    textColor
}) => {
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
                    toast.success('Đã hiện tin nhắn');
                } else {
                    toast.error('Không thể hiện tin nhắn');
                }
            } else {
                success = await hideMessage(message.id);
                if (success) {
                    toast.success('Đã ẩn tin nhắn');
                } else {
                    toast.error('Không thể ẩn tin nhắn');
                }
            }
        } catch (error) {
            console.error('Error toggling message visibility:', error);
            toast.error('Đã xảy ra lỗi khi thay đổi trạng thái tin nhắn');
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
        if (!message.createdAt) return { time: '', date: '' };

        // Tách thời gian và ngày để hiển thị tốt hơn
        const date = new Date(message.createdAt);
        const timeStr = format(date, 'HH:mm', { locale: vi });
        const dateStr = format(date, 'dd/MM/yyyy', { locale: vi });

        return { time: timeStr, date: dateStr };
    }, [message.createdAt]);

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

        // Debug: Log thông tin tin nhắn
        console.log('Message debug:', {
            messageId: message.id,
            senderId: message.senderId,
            currentUserId: currentUserId,
            readBy: message.readBy,
            isCurrentUser: isCurrentUser
        });

        // Kiểm tra xem có người khác đã đọc tin nhắn này chưa
        const readByOthers = message.readBy && Object.keys(message.readBy).some(uid => uid !== currentUserId);

        console.log('readByOthers:', readByOthers);

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

    // Nếu tin nhắn bị xóa hoặc ẩn, vẫn render bubble giữ layout đúng phía người gửi
    if (isDeleted || isHidden) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
                    mb: 1,
                    mx: 2,
                    position: 'relative',
                    maxWidth: '100%',
                }}
                ref={messageRef}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                        alignItems: 'flex-end',
                        maxWidth: '100%',
                    }}
                >
                    {!isCurrentUser && (
                        <Avatar
                            sx={{ width: 32, height: 32, mr: 1, flexShrink: 0 }}
                            alt={users[message.senderId]?.full_name || 'User Avatar'}
                            src={users[message.senderId]?.avatar_url || '/static/images/avatar/1.jpg'}
                        />
                    )}
                    <Box
                        sx={{
                            minWidth: { xs: '120px', sm: '180px' },
                            width: 'auto',
                            bgcolor: isCurrentUser ? 'primary.main' : 'grey.100',
                            color: isCurrentUser ? 'white' : textColor || 'text.primary',
                            borderRadius: 2,
                            p: 1.5,
                            opacity: 0.7,
                            display: 'flex',
                            alignItems: 'center',
                            ...(highlight ? { boxShadow: '0 0 0 2px #facc15' } : {}),
                        }}
                        className={highlight ? 'highlight-animate' : ''}
                    >
                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: isCurrentUser ? 'white' : textColor || 'text.disabled', mr: isHidden && isCurrentUser ? 1 : 0 }}>
                            {isDeleted ? 'Message deleted' : 'Message hidden'}
                        </Typography>
                        {/* Nếu là tin nhắn bị ẩn và là người nhận (không phải người gửi), hiển thị icon để hiện lại */}
                        {isHidden && !isCurrentUser && (
                            <Tooltip title="Unhide message">
                                <IconButton size="small" onClick={handleToggleVisibility} sx={{ color: textColor || 'text.primary', p: 0.5 }}>
                                    <VisibilityIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {/* Nếu là tin nhắn bị ẩn và là người gửi, vẫn giữ icon như cũ */}
                        {isHidden && isCurrentUser && (
                            <Tooltip title="Unhide message">
                                <IconButton size="small" onClick={handleToggleVisibility} sx={{ color: 'white', p: 0.5 }}>
                                    <VisibilityIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                </Box>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
                mb: 1,
                mx: 2,
                position: 'relative',
                maxWidth: '100%',
            }}
            ref={messageRef}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    maxWidth: '100%',
                }}
            >
                {!isCurrentUser && (
                    <Avatar
                        sx={{ width: 32, height: 32, mr: 1, flexShrink: 0 }}
                        alt={users[message.senderId]?.full_name || 'User Avatar'}
                        src={users[message.senderId]?.avatar_url || '/static/images/avatar/1.jpg'}
                    />
                )}
                <Box
                    sx={{
                        position: 'relative',
                        maxWidth: { xs: '85%', sm: '75%', md: '70%' },
                        minWidth: { xs: '120px', sm: '180px' },
                        width: 'auto',
                        bgcolor: isCurrentUser ? 'primary.main' : 'grey.100',
                        color: isCurrentUser ? 'white' : textColor || 'text.primary',
                        borderRadius: 2,
                        p: 1.5,
                        '&:hover .message-actions': {
                            opacity: 1,
                        },
                        ...(highlight ? { boxShadow: '0 0 0 2px #facc15' } : {}),
                    }}
                    className={highlight ? 'highlight-animate' : ''}
                >
                    {/* Hiển thị tin nhắn trả lời */}
                    {renderReply()}

                    {message.text && (
                        noteData ? (
                            <NoteMessage title={noteData.title} content={noteData.content} />
                        ) : (
                            <Typography variant="body1" sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                {message.text}
                            </Typography>
                        )
                    )}

                    {/* Hiển thị hình ảnh */}
                    {renderImages()}

                    {/* Hiển thị tin nhắn thoại */}
                    {renderAudio()}

                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            mt: 0.5,
                            flexWrap: 'nowrap',
                            gap: '2px',
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                color: isCurrentUser ? 'rgba(255,255,255,0.7)' : textColor || 'text.secondary',
                                whiteSpace: 'nowrap',
                                fontSize: '0.7rem',
                            }}
                        >
                            {formattedTime.time}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: isCurrentUser ? 'rgba(255,255,255,0.6)' : textColor || 'text.disabled',
                                mx: '2px',
                                fontSize: '0.7rem',
                            }}
                        >
                            •
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: isCurrentUser ? 'rgba(255,255,255,0.7)' : textColor || 'text.secondary',
                                whiteSpace: 'nowrap',
                                fontSize: '0.7rem',
                            }}
                        >
                            {formattedTime.date}
                        </Typography>
                        {renderReadStatus()}
                    </Box>

                    {/* Reaction button */}
                    <MessageActionsContainer
                        className="message-actions"
                        sx={{
                            right: isCurrentUser ? 'auto' : '0',
                            left: isCurrentUser ? '0' : 'auto',
                        }}
                    >
                        <Tooltip title="Reply">
                            <IconButton size="small" onClick={handleReplyMessage}>
                                <ReplyIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Add reaction">
                            <IconButton size="small" onClick={handleReactionPickerOpen}>
                                😊
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="More options">
                            <IconButton size="small" onClick={handleMenuOpen}>
                                <MoreVertIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </MessageActionsContainer>

                    {/* Reaction picker */}
                    {showReactionPicker && (
                        <ReactionPicker
                            ref={reactionPickerRef}
                            sx={{
                                left: isCurrentUser ? '0' : 'auto',
                                right: isCurrentUser ? 'auto' : '0',
                            }}
                        >
                            <ReactionEmoji onClick={() => handleAddReaction(ReactionType.LIKE)}>
                                {ReactionType.LIKE}
                            </ReactionEmoji>
                            <ReactionEmoji onClick={() => handleAddReaction(ReactionType.LOVE)}>
                                {ReactionType.LOVE}
                            </ReactionEmoji>
                            <ReactionEmoji onClick={() => handleAddReaction(ReactionType.HAHA)}>
                                {ReactionType.HAHA}
                            </ReactionEmoji>
                            <ReactionEmoji onClick={() => handleAddReaction(ReactionType.WOW)}>
                                {ReactionType.WOW}
                            </ReactionEmoji>
                            <ReactionEmoji onClick={() => handleAddReaction(ReactionType.SAD)}>
                                {ReactionType.SAD}
                            </ReactionEmoji>
                            <ReactionEmoji onClick={() => handleAddReaction(ReactionType.ANGRY)}>
                                {ReactionType.ANGRY}
                            </ReactionEmoji>
                        </ReactionPicker>
                    )}
                </Box>
            </Box>

            {/* Hiển thị reactions */}
            {Object.entries(reactionCounts).length > 0 && (
                <ReactionButtonsContainer
                    sx={{ justifyContent: isCurrentUser ? 'flex-end' : 'flex-start' }}
                >
                    {Object.entries(reactionCounts).map(([reaction, info]) => {
                        const isMine = message.reactions?.[currentUserId]?.[reaction];
                        return (
                            <StyledReactionButton key={reaction}>
                                <span style={{ fontSize: 18 }}>{reaction}</span>
                                <Typography variant="caption" sx={{ ml: 0.5 }}>{info.count}</Typography>
                                {isMine && (
                                    <IconButton size="small" onClick={() => removeReaction(message.id, reaction as ReactionType)} sx={{ ml: 0.5, p: 0.2 }}>
                                        <span style={{ fontSize: 12 }}>✕</span>
                                    </IconButton>
                                )}
                            </StyledReactionButton>
                        );
                    })}
                    {/* Nút clear tất cả reaction của mình */}
                    {message.reactions?.[currentUserId] && (
                        <StyledReactionButton onClick={() => removeReaction(message.id)}>
                            <span style={{ fontSize: 14 }}>🧹</span>
                            <Typography variant="caption" sx={{ ml: 0.5 }}>Clear</Typography>
                        </StyledReactionButton>
                    )}
                </ReactionButtonsContainer>
            )}

            {/* Menu tùy chọn */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem onClick={handleReplyMessage}>
                    <ReplyIcon fontSize="small" sx={{ mr: 1 }} />
                    Reply to message
                </MenuItem>
                <MenuItem onClick={handlePinMessage}>
                    <PinIcon fontSize="small" sx={{ mr: 1 }} />
                    Pin message
                </MenuItem>
                <MenuItem onClick={handleToggleVisibility}>
                    {isHidden ? (
                        <>
                            <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
                            Show message
                        </>
                    ) : (
                        <>
                            <VisibilityOffIcon fontSize="small" sx={{ mr: 1 }} />
                            Hide message
                        </>
                    )}
                </MenuItem>
                <MenuItem onClick={handleDeleteMessage}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                    Delete message
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default MessageItem; 