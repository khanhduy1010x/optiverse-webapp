import React, { useEffect, useState } from 'react';
import { useAppTranslate } from '../../../hooks/useAppTranslate';
import Icon from '../../../components/common/Icon/Icon.component';
import speechService from '../../../services/speech.service';

interface SpeechMessage {
    id?: string;
    _id?: string;
    speaker_name: string;
    text: string;
    avatar_url?: string;
    createdAt?: string;
    user_id?: string;
}

interface SpeechPanelProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    roomId?: string;
    recordingReady?: boolean;
    isMicrophoneEnabled?: boolean;
    onRecordingChange?: (isRecording: boolean) => void;
    width?: number; // percentage
    isResizing?: boolean;
}

/* 💬 Component chính */
const SpeechPanel: React.FC<SpeechPanelProps> = ({
    isOpen,
    onOpenChange,
    roomId,
    recordingReady = false,
    isMicrophoneEnabled = false,
    onRecordingChange = () => { },
    width = 45,
    isResizing = false
}) => {
    const { t } = useAppTranslate('focus-room');
    const [messages, setMessages] = useState<SpeechMessage[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Get current user ID from localStorage
    useEffect(() => {
        const userId = localStorage.getItem('user_id');
        setCurrentUserId(userId);
    }, []);

    // --- Fetch messages ---
    const fetchMessages = async (rid: string) => {
        if (!rid) return;
        setIsLoading(true);
        try {
            const data = await speechService.getMessagesByRoomId(rid, 100, 0);
            setMessages(data || []);
        } catch (err) {
            console.error('❌ Failed to fetch speech messages:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!roomId) return;
        fetchMessages(roomId);

        const handleNewMessage = () => fetchMessages(roomId);
        window.addEventListener('speech:new-message', handleNewMessage as EventListener);
        return () =>
            window.removeEventListener('speech:new-message', handleNewMessage as EventListener);
    }, [roomId]);

    // --- Toggle recording ---
    const toggleRecording = () => {
        const newState = !isRecording;
        setIsRecording(newState);
        onRecordingChange(newState);
    };

    const formatTime = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const diff = Date.now() - date.getTime();
        if (diff < 60000) return 'Vừa xong';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
        return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className={`${isOpen
                ? 'flex flex-col rounded-xl overflow-hidden  max-h-[calc(100%-1rem)] pb-6'
                : 'fixed bottom-36 left-4 w-12 h-12 rounded-full shadow-lg'
                }`}
            style={{
                backgroundColor: '#272727',
                width: isOpen ? `${width}%` : 'auto',
                height: isOpen ? '100%' : 'auto',
                borderRadius: isOpen ? '8px' : '50%',
                margin: isOpen ? '8px 8px 8px 0' : '0',
                marginBottom: isOpen ? '2rem' : '0',
                zIndex: 40,
                transition: isResizing ? 'none' : 'all 0.2s ease-out'
            }}
        >
            <>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b backdrop-blur-xl" style={{
                    borderColor: '#404040',
                    background: 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                }}>
                    <div>
                        <h3 className="text-base font-semibold text-white tracking-tight">{t('speech.title')}</h3>
                        <p className="text-xs text-gray-500 mt-1">{t('speech.subtitle')}</p>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="p-2 rounded-lg hover:bg-white/5 transition-all duration-200 text-gray-400 hover:text-white"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto ">
                    {/* Nút Recording */}
                    <div className="px-6 py-4 border-b" style={{ borderColor: '#404040' }}>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-300">{t('speech.recordConversation')}</span>
                            <button
                                onClick={toggleRecording}
                                disabled={!recordingReady}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 
                                        ${isRecording ? 'bg-blue-500' : 'bg-gray-600'}
                                        ${!recordingReady ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                            >
                                <div
                                    className={`absolute transition-all duration-300 ${isRecording ? 'left-[2px]' : 'right-[4px]'
                                        }`}
                                >
                                    {isRecording ? (
                                        <Icon name="mic" className="text-white" size={18} />
                                    ) : (
                                        <Icon name="unMic" className="text-gray-300" size={16} />
                                    )}
                                </div>

                                <span
                                    className="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300"
                                    style={{
                                        transform: isRecording ? 'translateX(20px)' : 'translateX(2px)',
                                    }}
                                />
                            </button>
                        </div>

                        {/* Trạng thái mic */}
                        <div className="text-xs text-center font-medium mt-2">
                            {!recordingReady && <span className="text-yellow-400">{t('waiting.connecting')}</span>}
                            {recordingReady && !isRecording && <span className="text-gray-400">{t('speech.inactive')}</span>}
                            {recordingReady && isRecording && !isMicrophoneEnabled && (
                                <span className="text-orange-400">{t('speech.waitingForMic')}</span>
                            )}
                            {recordingReady && isRecording && isMicrophoneEnabled && (
                                <span className="text-green-400 flex items-center justify-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div> {t('speech.convertingAudio')}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Danh sách tin nhắn */}
                    <div className="px-6 py-4 flex-1 overflow-y-auto">
                        <div className="flex flex-col gap-3">
                            {isLoading ? (
                                <div className="flex justify-center py-6">
                                    <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">{t('speech.noMessages')}</div>
                            ) : (
                                messages.map((msg) => {
                                    const id = msg._id || msg.id;
                                    const isCurrentUser = currentUserId && msg.user_id === currentUserId;
                                    return (
                                        <div
                                            key={id}
                                            className={`flex gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                                        >
                                            {/* Avatar */}
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={
                                                        msg.avatar_url ||
                                                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.speaker_name}`
                                                    }
                                                    alt={msg.speaker_name}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            </div>

                                            {/* Message Content */}
                                            <div className={`flex flex-col gap-1 max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                                                {/* Name and Time */}
                                                <div className={`flex items-center gap-2 px-1 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    <span className="font-medium text-xs text-gray-400">
                                                        {msg.speaker_name}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {formatTime(msg.createdAt)}
                                                    </span>
                                                </div>

                                                {/* Message Bubble */}
                                                <div
                                                    className={`rounded-2xl px-3 py-2 text-sm leading-relaxed break-words ${isCurrentUser
                                                        ? 'rounded-tr-sm'
                                                        : 'rounded-tl-sm'
                                                        }`}
                                                    style={{
                                                        backgroundColor: isCurrentUser ? '#0084ff' : '#3a3a3a',
                                                        color: '#ffffff'
                                                    }}
                                                >
                                                    {msg.text}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </>
        </div>
    );
};

export default SpeechPanel;