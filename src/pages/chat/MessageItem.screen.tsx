import React, { useMemo } from 'react';
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
import { useMessageItem } from "../../hooks/chat/useMessageItem";
import AudioMessage from '../../components/chat/AudioMessage';
import ReplyMessage from '../../components/chat/ReplyMessage';
import NoteMessage from '../../components/chat/NoteMessage.component';
import { UserResponse } from '../../types/auth/auth.types';
import {
    StyledReactionButton,
    ReactionPicker,
    ReactionEmoji,
    MessageActionsContainer,
    ReactionButtonsContainer
} from './MessageItem.styles';
import './MessageItem.css';
import { useAppTranslate } from '../../hooks/useAppTranslate';

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
    
    // Group chat props
    isGroupChat?: boolean;
    showSenderName?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
    message,
    conversationId,
    isCurrentUser,
    onPin,
    onReply,
    users = {},
    messageRef,
    highlight,
    textColor,
    isGroupChat = false,
    showSenderName = false
}) => {
    const { t } = useAppTranslate('chat');
    const {
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
        renderReadStatus,
        renderImages,
        renderAudio,
        renderReply
    } = useMessageItem({
        message,
        conversationId,
        users,
        isCurrentUser,
        onPin,
        onReply
    });



    // Nếu tin nhắn bị xóa hoặc ẩn, vẫn render bubble giữ layout đúng phía người gửi
    if (isDeleted || isHidden) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
                    mb: 0.5,
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
                            alt={message.senderInfo?.full_name || users[message.senderId]?.full_name || 'User Avatar'}
                            src={message.senderInfo?.avatar_url || users[message.senderId]?.avatar_url || '/static/images/avatar/1.jpg'}
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
                mb: 0.5,
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
                            alt={message.senderInfo?.full_name || users[message.senderId]?.full_name || 'User Avatar'}
                            src={message.senderInfo?.avatar_url || users[message.senderId]?.avatar_url || '/static/images/avatar/1.jpg'}
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

                    {/* Hiển thị tên người gửi trong group chat */}
                    {isGroupChat && showSenderName && !isCurrentUser && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: textColor || 'text.secondary',
                                fontWeight: 'medium',
                                mb: 0.5,
                                display: 'block',
                                fontSize: '0.75rem',
                            }}
                        >
                            {message.senderInfo?.full_name || users[message.senderId]?.full_name || 'Unknown User'}
                        </Typography>
                    )}

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
                        <Tooltip title={t('reply')}>
                            <IconButton size="small" onClick={handleReplyMessage}>
                                <ReplyIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('attach_image')}>
                            <IconButton size="small" onClick={handleReactionPickerOpen}>
                                😊
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('reply')}>
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
                                    <IconButton size="small" onClick={() => handleRemoveSpecificReaction(reaction as ReactionType)} sx={{ ml: 0.5, p: 0.2 }}>
                                        <span style={{ fontSize: 12 }}>✕</span>
                                    </IconButton>
                                )}
                            </StyledReactionButton>
                        );
                    })}
                    {/* Nút clear tất cả reaction của mình */}
                    {message.reactions?.[currentUserId] && (
                        <StyledReactionButton onClick={handleRemoveReaction}>
                            <span style={{ fontSize: 14 }}>🧹</span>
                            <Typography variant="caption" sx={{ ml: 0.5 }}>{t('clear_reactions')}</Typography>
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
                    {t('reply_to_message')}
                </MenuItem>
                <MenuItem onClick={handlePinMessage}>
                    <PinIcon fontSize="small" sx={{ mr: 1 }} />
                    {t('pin_message')}
                </MenuItem>
                <MenuItem onClick={handleToggleVisibility}>
                    {isHidden ? (
                        <>
                            <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
                            {t('show_message')}
                        </>
                    ) : (
                        <>
                            <VisibilityOffIcon fontSize="small" sx={{ mr: 1 }} />
                            {t('hide_message')}
                        </>
                    )}
                </MenuItem>
                <MenuItem onClick={handleDeleteMessage}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                    {t('delete_message')}
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default MessageItem;