import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { RootState } from '../../../store';
import { useAppTranslate } from '../../../hooks/useAppTranslate';
import { useWorkspaceWebSocket } from '../../../hooks/websocket/useWorkspaceWebSocket';
import livekitTokenService from '../../../services/livekitToken.service';
import { FocusRoomResponse } from '../../../services/focusRoom.service';

interface WaitingForApprovalScreenProps {
    room: FocusRoomResponse;
    workspaceId?: string;
    onCancel: () => void;
    onApproved?: (token: string) => void;
}

const WaitingForApprovalScreen: React.FC<WaitingForApprovalScreenProps> = ({
    room,
    workspaceId,
    onCancel,
    onApproved,
}) => {
    const { t } = useAppTranslate('focus-room');
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const [isApproved, setIsApproved] = useState(false);
    const [isLoadingToken, setIsLoadingToken] = useState(false);

    // Setup WebSocket connection
    const { socket, isConnected } = useWorkspaceWebSocket({
        workspaceId: workspaceId || null,
        isDashboard: true,
    });

    useEffect(() => {
        if (!socket || !isConnected || !currentUser || !room) return;

        // Listen for approval event
        const handleApproved = async (data: {
            roomId: string;
            requestId: string;
            targetUserId: string;
            approvedBy: string;
            workspaceId?: string;
            timestamp: Date;
        }) => {
            console.log('✅ Request approved event:', data);

            // Check if this approval is for current user
            if (data.targetUserId === currentUser._id && data.roomId === room._id) {
                setIsApproved(true);
                toast.success(t('pending.approveSuccess'));

                // Call API to get token
                try {
                    setIsLoadingToken(true);
                    const response = await livekitTokenService.getJoinToken(room._id);
                    if (response.token && onApproved) {
                        onApproved(response.token);
                    }
                } catch (error) {
                    console.error('Failed to get join token:', error);
                    toast.error(t('errors.failedToGetToken'));
                } finally {
                    setIsLoadingToken(false);
                }
            }
        };

        // Listen for rejection event
        const handleRejected = (data: {
            roomId: string;
            requestId: string;
            targetUserId: string;
            rejectedBy: string;
            workspaceId?: string;
            timestamp: Date;
        }) => {
            console.log('❌ Request rejected event:', data);

            if (data.targetUserId === currentUser._id && data.roomId === room._id) {
                toast.error(t('pending.rejectFailed'));
                // Navigate back to room list via onCancel
                onCancel();
            }
        };

        socket.on('focus-room-join-request-approved', handleApproved);
        socket.on('focus-room-join-request-rejected', handleRejected);

        return () => {
            socket.off('focus-room-join-request-approved', handleApproved);
            socket.off('focus-room-join-request-rejected', handleRejected);
        };
    }, [socket, isConnected, currentUser, room, onApproved]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                        {isApproved && isLoadingToken ? (
                            <svg
                                className="w-10 h-10 text-green-600 animate-spin"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-10 h-10 text-blue-600 animate-pulse"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        )}
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {isApproved ? t('waiting.approved') : t('waiting.title')}
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-2">
                    {t('waiting.requestTo')}
                </p>
                <p className="text-lg font-semibold text-gray-900 mb-6">
                    "{room.name}"
                </p>

                {/* Host Info */}
                <div className="flex items-center justify-center gap-3 mb-8 p-4 bg-gray-50 rounded-lg">
                    {room.hostUser?.avatar_url && (
                        <img
                            src={room.hostUser.avatar_url}
                            alt={room.hostUser.full_name}
                            className="w-10 h-10 rounded-full"
                        />
                    )}
                    <div className="text-left">
                        <p className="text-xs text-gray-500">{t('waiting.hostedBy')}</p>
                        <p className="text-sm font-medium text-gray-900">
                            {room.hostUser?.full_name || 'Unknown'}
                        </p>
                    </div>
                </div>

                {/* Status Message */}
                <div className={`mb-8 p-4 rounded-lg border ${isApproved
                    ? 'bg-green-50 border-green-200'
                    : 'bg-blue-50 border-blue-200'
                    }`}>
                    <p className={`text-sm ${isApproved
                        ? 'text-green-800'
                        : 'text-blue-800'
                        }`}>
                        {isApproved ? (
                            isLoadingToken ? (
                                t('waiting.joiningNow')
                            ) : (
                                t('waiting.approvedSuccess')
                            )
                        ) : (
                            t('waiting.waitForApproval')
                        )}
                    </p>
                </div>

                {/* Actions */}
                {!isApproved && (
                    <div className="space-y-3">
                        <button
                            onClick={onCancel}
                            className="w-full px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
                        >
                            {t('waiting.cancelRequest')}
                        </button>
                    </div>
                )}

                {/* Additional Info */}
                <p className="text-xs text-gray-500 mt-6">
                    {isApproved ? (
                        isLoadingToken ? t('waiting.gettingToken') : t('waiting.redirecting')
                    ) : (
                        t('waiting.checkLater')
                    )}
                </p>
            </div>
        </div>
    );
};

export default WaitingForApprovalScreen;