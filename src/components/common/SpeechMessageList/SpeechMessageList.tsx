import React, { useEffect, useState } from 'react';
import speechService from '../../../services/speech.service';

interface SpeechMessage {
    id?: string;
    _id?: string;
    speaker_name: string;
    text: string;
    avatar_url?: string;
    createdAt?: string;
}

interface SpeechMessageListProps {
    roomId?: string;
    messages?: SpeechMessage[];
    isLoading?: boolean;
}

const getDemoMessages = (): SpeechMessage[] => [
    {
        id: '1',
        speaker_name: 'Khánh Duy',
        text: 'Xin chào mọi người, đây là buổi họp hôm nay',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KhanhDuy',
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    {
        id: '2',
        speaker_name: 'Lê An',
        text: 'Mình sẽ báo cáo tình hình dự án trong tuần vừa rồi',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LeAn',
        createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
    },
    {
        id: '3',
        speaker_name: 'Khánh Duy',
        text: 'Được rồi, bạn cứ tiếp tục',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KhanhDuy',
        createdAt: new Date(Date.now() - 1 * 60000).toISOString(),
    },
];

const SpeechMessageList: React.FC<SpeechMessageListProps> = ({
    roomId,
    messages: externalMessages,
    isLoading: externalIsLoading,
}) => {
    const [messages, setMessages] = useState<SpeechMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch messages from API
    const fetchMessages = async (rid: string) => {
        if (!rid) return;
        setIsLoading(true);
        try {
            const data = await speechService.getMessagesByRoomId(rid, 100, 0);
            setMessages(data || []);
            console.log('✅ Fetched speech messages:', data?.length || 0);
        } catch (err) {
            console.error('❌ Failed to fetch speech messages:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Listen for new messages via WebSocket event from useSpeechStream
    useEffect(() => {
        if (!roomId) {
            // Use demo messages if no roomId
            setMessages(externalMessages ?? getDemoMessages());
            setIsLoading(externalIsLoading ?? false);
            return;
        }

        // Fetch initial messages
        fetchMessages(roomId);

        // Listen for new messages via custom event from useSpeechStream
        const handleNewMessage = (event: CustomEvent) => {
            console.log('🔄 New message event received, refetching messages');
            fetchMessages(roomId);
        };

        window.addEventListener('speech:new-message', handleNewMessage as EventListener);

        return () => {
            window.removeEventListener('speech:new-message', handleNewMessage as EventListener);
        };
    }, [roomId, externalMessages, externalIsLoading]);

    // Use fetched messages or demo messages
    const displayMessages = roomId ? messages : (externalMessages ?? getDemoMessages());
    const displayIsLoading = roomId ? isLoading : (externalIsLoading ?? false);
    const formatTime = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        // Less than 1 minute
        if (diff < 60000) {
            return 'Vừa xong';
        }

        // Less than 1 hour
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes} phút trước`;
        }

        // Less than 1 day
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours} giờ trước`;
        }

        // Otherwise show date and time
        return date.toLocaleString('vi-VN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-sm max-h-96 overflow-y-auto">
            {displayIsLoading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : displayMessages.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    Chưa có tin nhắn nào
                </div>
            ) : (
                displayMessages.map((msg) => {
                    const msgId = (msg as any)._id || (msg as any).id;
                    const avatar = (msg as any).avatar_url;
                    return (
                        <div key={msgId} className="flex gap-3">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {avatar ? (
                                    <img
                                        src={avatar}
                                        alt={msg.speaker_name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                        {msg.speaker_name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Message Content */}
                            <div className="flex-1 min-w-0">
                                {/* Name and Time */}
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-800 text-sm">
                                        {msg.speaker_name}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {formatTime(msg.createdAt)}
                                    </span>
                                </div>

                                {/* Message Text */}
                                <div className="bg-gray-100 rounded-lg px-3 py-2 break-words">
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {msg.text}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default SpeechMessageList;
