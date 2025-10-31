import React, { useRef, useEffect, useState } from 'react';
import { useChat } from '@livekit/components-react';
import { toast } from 'react-toastify';
import { createPortal } from 'react-dom';
import '@livekit/components-styles';
import { useAppTranslate } from '../../../hooks/useAppTranslate';
import Icon from '../../../components/common/Icon/Icon.component';

interface ChatPanelProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    width?: number; // percentage
    isResizing?: boolean;
}

// Inner component that uses useChat hook (must be inside LiveKitRoom)
const ChatPanelInner: React.FC<ChatPanelProps> = ({
    isOpen,
    onOpenChange,
    width = 45,
    isResizing = false
}) => {
    const { t } = useAppTranslate('focus-room');
    const ulRef = useRef<HTMLUListElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string>('');
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

    const { chatMessages, send } = useChat();

    // Update messages when chatMessages changes
    useEffect(() => {
        setMessages(chatMessages);
    }, [chatMessages]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (ulRef.current) {
            ulRef.current.scrollTo({ top: ulRef.current.scrollHeight });
        }
    }, [messages]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const messageText = inputRef.current?.value.trim() || '';
        const hasFile = selectedFile !== null;

        if (!messageText && !hasFile) {
            return;
        }

        setIsSending(true);
        try {
            // If file is selected, send it first
            if (hasFile && selectedFile) {
                await handleSendFile();
            }

            // Then send the text message if any
            if (messageText && inputRef.current) {
                await send(messageText);
                inputRef.current.value = '';
                inputRef.current.focus();
            }
        } catch (error) {
            console.error('Error sending message/file:', error);
            toast.error(t('errors.failedToSendMessage'));
        } finally {
            setIsSending(false);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file size (max 50MB)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error(t('errors.fileSizeExceeded'));
            return;
        }

        // Validate file type - allow common formats
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'video/mp4',
            'audio/mpeg',
            'application/zip',
            'application/x-rar-compressed'
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error(t('errors.fileTypeNotSupported'));
            return;
        }

        setSelectedFile(file);

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFilePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setFilePreview('');
        }
    };

    const handleSendFile = async () => {
        if (!selectedFile) return;

        try {
            // Convert file to base64 and send as message
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64 = e.target?.result as string;
                const fileMessage = JSON.stringify({
                    type: 'file',
                    fileName: selectedFile.name,
                    fileType: selectedFile.type,
                    fileSize: selectedFile.size,
                    data: base64
                });

                await send(fileMessage);
                setSelectedFile(null);
                setFilePreview('');

                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }

                toast.success(t('chat.fileSentSuccessfully'));
            };
            reader.readAsDataURL(selectedFile);
        } catch (error) {
            console.error('Error sending file:', error);
            toast.error(t('errors.failedToSendFile'));
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setFilePreview('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div
            className={`${isOpen
                ? 'flex flex-col rounded-xl overflow-hidden max-h-[calc(100%-1rem)]'
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
            {isOpen && (
                <>
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-6 py-5 border-b backdrop-blur-xl"
                        style={{
                            borderColor: '#404040',
                            background: 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
                            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                        }}
                    >
                        <div>
                            <h3 className="text-base font-semibold text-white tracking-tight">{t('chat.title')}</h3>
                            <p className="text-xs text-gray-500 mt-1">{t('chat.subtitle')}</p>
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

                    {/* Messages List */}
                    <ul
                        ref={ulRef}
                        className="flex-1 overflow-y-auto space-y-2 p-4"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        {messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <p className="text-sm">{t('chat.noMessages')}</p>
                            </div>
                        ) : (
                            messages.map((msg, idx, allMsg) => {
                                const prevSender = allMsg[idx - 1]?.from?.identity;
                                const currentSender = msg.from?.identity;
                                const hideName = idx >= 1 && prevSender === currentSender;
                                const hideTimestamp =
                                    idx >= 1 && msg.timestamp - allMsg[idx - 1].timestamp < 60_000;

                                // Check if message contains file data
                                let isFileMessage = false;
                                let fileData = null;
                                try {
                                    fileData = JSON.parse(msg.message);
                                    isFileMessage = fileData.type === 'file';
                                } catch {
                                    isFileMessage = false;
                                }

                                const formatFileSize = (bytes: number) => {
                                    if (bytes === 0) return '0 Bytes';
                                    const k = 1024;
                                    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                                    const i = Math.floor(Math.log(bytes) / Math.log(k));
                                    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
                                };

                                return (
                                    <li
                                        key={msg.id ?? idx}
                                        className="text-sm space-y-1"
                                        style={{ color: '#e5e5e5' }}
                                    >
                                        {!hideName && (
                                            <div style={{ color: '#888' }} className="text-xs font-medium">
                                                {msg.from?.name || msg.from?.identity || 'Anonymous'}
                                            </div>
                                        )}
                                        <div
                                            className="px-3 py-2 rounded-md"
                                            style={{
                                                backgroundColor: '#3a3a3a',
                                                wordBreak: 'break-word'
                                            }}
                                        >
                                            {isFileMessage && fileData ? (
                                                <div className="space-y-2">
                                                    <div className="text-xs text-gray-400">
                                                        {t('chat.file')}: {fileData.fileName}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {formatFileSize(fileData.fileSize)}
                                                    </div>
                                                    {fileData.fileType.startsWith('image/') && fileData.data && (
                                                        <img
                                                            src={fileData.data}
                                                            alt={fileData.fileName}
                                                            className="max-w-xs rounded cursor-pointer hover:opacity-80 transition-opacity"
                                                            style={{ maxHeight: '200px' }}
                                                            onClick={() => setFullscreenImage(fileData.data)}
                                                        />
                                                    )}
                                                    <a
                                                        href={fileData.data}
                                                        download={fileData.fileName}
                                                        className="inline-block text-xs px-2 py-1 text-blue-500 rounded transition-colors"
                                                    >
                                                        {t('chat.downloadFile')}
                                                    </a>
                                                </div>
                                            ) : (
                                                msg.message
                                            )}
                                        </div>
                                        {!hideTimestamp && (
                                            <div style={{ color: '#666' }} className="text-xs">
                                                {new Date(msg.timestamp).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        )}
                                    </li>
                                );
                            })
                        )}
                    </ul>

                    {/* Input Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="border-t p-4 space-y-3"
                        style={{ borderColor: '#404040' }}
                    >
                        {/* File Preview */}
                        {selectedFile && (
                            <div
                                className="flex items-center justify-between p-2 rounded-md text-sm"
                                style={{ backgroundColor: '#3a3a3a' }}
                            >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    {filePreview ? (
                                        <img
                                            src={filePreview}
                                            alt="preview"
                                            className="w-8 h-8 rounded object-cover"
                                        />
                                    ) : (
                                        <span className="text-lg">📎</span>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-gray-300 truncate">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveFile}
                                    className="text-gray-400 hover:text-white transition-colors text-lg leading-none ml-2"
                                    title={t('chat.removeFile')}
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {/* Input Row */}
                        <div className="flex items-center gap-2 w-full">
                            {/* Attach button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isSending || selectedFile !== null}
                                className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-md transition-colors   disabled:opacity-50"
                                title={t('chat.attachFile')}
                            >
                                <Icon name="paper_clip" color="white" />
                            </button>

                            {/* Input + Send */}
                            <div className="relative flex-1">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder={t('chat.messagePlaceholder')}
                                    disabled={isSending}
                                    className="w-full px-4 py-2 pr-10 rounded-full text-sm bg-[#3a3a3a] text-[#e5e5e5] placeholder-gray-400 focus:outline-none disabled:opacity-50"
                                    onInput={(ev) => ev.stopPropagation()}
                                    onKeyDown={(ev) => ev.stopPropagation()}
                                    onKeyUp={(ev) => ev.stopPropagation()}
                                />

                                <button
                                    type="submit"
                                    disabled={isSending}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7
                         flex items-center justify-center rounded-full bg-[#1e5a96] hover:bg-[#1b4f84] text-white transition-colors disabled:opacity-50"
                                >
                                    {isSending ? '...' : <Icon name="arrow" className="rotate-90" />}
                                </button>
                            </div>

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileSelect}
                                className="hidden"
                                disabled={isSending}
                            />
                        </div>

                    </form>
                </>
            )}

            {/* Fullscreen Image Modal - Rendered as Portal to escape z-index stacking context */}
            {fullscreenImage && createPortal(
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setFullscreenImage(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={fullscreenImage}
                            alt="fullscreen"
                            className="w-full h-full object-contain rounded-lg"
                        />
                        <button
                            onClick={() => setFullscreenImage(null)}
                            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
                            title={t('chat.close')}
                        >
                            ✕
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

// Wrapper component for easy use
const ChatPanel: React.FC<ChatPanelProps> = (props) => {
    return <ChatPanelInner {...props} />;
};

export default ChatPanel;
