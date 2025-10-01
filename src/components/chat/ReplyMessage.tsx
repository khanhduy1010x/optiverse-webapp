import React from 'react';
import { ReplyMessageProps } from '../../types/chat/props/component.props';


const ReplyMessage: React.FC<ReplyMessageProps> = ({
    replyText,
    senderName,
    isCurrentUser,
    onClick
}) => {
    // Cắt ngắn nội dung tin nhắn nếu quá dài
    const truncatedText = replyText.length > 50
        ? replyText.substring(0, 50) + '...'
        : replyText;

    return (
        <div
            className="reply-message mb-2 rounded p-2 cursor-pointer"
            style={{
                backgroundColor: isCurrentUser ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                borderLeft: `3px solid ${isCurrentUser ? 'rgba(255,255,255,0.5)' : '#21b4ca'}`
            }}
            onClick={onClick}
        >
            <div className="text-xs font-medium mb-1" style={{ color: isCurrentUser ? 'rgba(255,255,255,0.8)' : '#21b4ca' }}>
                {senderName === 'Bạn' || isCurrentUser ? 'Bạn' : senderName}
            </div>
            <div className="text-sm truncate" style={{ color: isCurrentUser ? 'rgba(255,255,255,0.9)' : 'inherit' }}>
                {truncatedText}
            </div>
        </div>
    );
};

export default ReplyMessage; 