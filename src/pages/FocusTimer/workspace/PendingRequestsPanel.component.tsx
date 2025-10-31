import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useWorkspaceWebSocket } from '../../../hooks/websocket/useWorkspaceWebSocket';
import { useFocusRoomWebSocketEvents } from '../../../hooks/websocket/useFocusRoomWebSocketEvents';
import { useAppTranslate } from '../../../hooks/useAppTranslate';
import liveRoomJoinRequestService, { JoinRequest } from '../../../services/liveRoomJoinRequest.service';
import focusRoomService from '../../../services/focusRoom.service';
import Icon from '../../../components/common/Icon/Icon.component';

interface PendingRequestsPanelProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    roomId: string;
    isManager: boolean;
    workspaceId?: string;
    width?: number;
    isResizing?: boolean;
    members?: any[];
    isPublic?: boolean;
}

const PendingRequestsPanel: React.FC<PendingRequestsPanelProps> = ({
    isOpen,
    onOpenChange,
    roomId,
    isManager,
    workspaceId,
    width = 45,
    isResizing = false,
    members = [],
    isPublic = false,
}) => {
    const { t } = useAppTranslate('focus-room');
    const [requests, setRequests] = useState<JoinRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'pending' | 'members'>(isPublic ? 'members' : 'pending');
    const rootRef = useRef<HTMLDivElement | null>(null);

    // Determine current viewer and roles from members
    const viewer = members.find((m) => m?.isCurrent);
    const viewerIsHost = Boolean(viewer?.host);
    const viewerIsAdmin = Boolean(viewer?.admin);

    const canKick = (target: any) => {
        if (!target || target.isCurrent) return false; // cannot kick self
        if (viewerIsHost) return true; // host can kick anyone else
        if (viewerIsAdmin) return !target.host && !target.admin; // admin can't kick host/admin
        return false; // others cannot kick
    };
    console.log('is public day ', isPublic)
    // Setup WebSocket connection
    const { socket, isConnected } = useWorkspaceWebSocket({
        workspaceId: workspaceId || null,
        isDashboard: true,
    });

    // Fetch pending requests
    const fetchRequests = async () => {
        if (!isManager) return;

        try {
            setLoading(true);
            console.log('🔄 Fetching pending requests for room:', roomId);
            const data = await liveRoomJoinRequestService.getPendingRequests(roomId);
            console.log('✅ Received requests:', data);
            setRequests(data);
        } catch (error) {
            console.error('❌ Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    // Listen for WebSocket events
    useFocusRoomWebSocketEvents({
        socket,
        roomId,
        onJoinRequestUpdate: fetchRequests,
    });

    // Initial fetch when panel opens
    useEffect(() => {
        if (isOpen && isManager && isConnected) {
            console.log('📌 Panel opened, fetching requests. isOpen:', isOpen, 'isManager:', isManager, 'isConnected:', isConnected, 'roomId:', roomId);
            fetchRequests();
        } else {
            console.log('⚠️ Not fetching. Conditions:', { isOpen, isManager, isConnected, roomId });
        }
    }, [isOpen, isManager, isConnected, roomId]);

    const handleApprove = async (userId: string) => {
        try {
            await liveRoomJoinRequestService.approveRequest(roomId, userId);
            toast.success(t('pending.approveSuccess'));
            // Refresh requests list
            await fetchRequests();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message;
            toast.error(errorMsg || t('pending.approveFailed'));
        }
    };

    const handleReject = async (userId: string) => {
        try {
            await liveRoomJoinRequestService.rejectRequest(roomId, userId);
            toast.success(t('pending.rejectSuccess'));
            // Refresh requests list
            await fetchRequests();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message;
            toast.error(errorMsg || t('pending.rejectFailed'));
        }
    };

    const handleKickMember = async (userId: string, memberName: string) => {
        try {
            await focusRoomService.kickMember(roomId, userId);
            toast.success(t('pending.kickSuccess', { name: memberName }));
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message;
            toast.error(errorMsg || t('pending.kickFailed'));
        }
    };

    // Close when clicking outside
    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e: MouseEvent) => {
            const target = e.target as Node;
            if (rootRef.current && !rootRef.current.contains(target)) {
                onOpenChange(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen, onOpenChange]);

    if (!isManager || !isOpen) return null;

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
            <>
                {/* Premium Header with Gradient */}
                <div
                    className="flex items-center  justify-between px-6 py-5 border-b backdrop-blur-xl"
                    style={{
                        borderColor: '#404040',
                        background: 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    }}
                >
                    <div>
                        <h3 className="text-base font-semibold text-white tracking-tight">{t('pending.requestsAndMembers')}</h3>
                        <p className="text-xs text-gray-500 mt-1">{t('pending.manageAccess')}</p>
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

                {/* Simple Apple-style Tabs */}
                <div
                    className="flex gap-6 px-6 py-3 border-b"
                    style={{
                        borderColor: '#404040',
                        background: 'transparent'
                    }}
                >
                    {
                        !isPublic && (<button
                            onClick={() => setActiveTab('pending')}
                            className={`px-0 py-2 text-sm font-medium transition-colors duration-200 ${activeTab === 'pending'
                                ? 'text-white'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                            style={{
                                borderBottom: activeTab === 'pending' ? '2px solid #888' : 'none'
                            }}
                        >
                            <span className="flex items-center gap-2">
                                {t('pending.tabs.pending')}
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${activeTab === 'pending'
                                    ? 'bg-gray-600 text-gray-100'
                                    : 'bg-gray-700 text-gray-400'
                                    }`}>
                                    {requests.length}
                                </span>
                            </span>
                        </button>)
                    }

                    <button
                        onClick={() => setActiveTab('members')}
                        className={`px-0 py-2 text-sm font-medium transition-colors duration-200 ${activeTab === 'members'
                            ? 'text-white'
                            : 'text-gray-500 hover:text-gray-300'
                            }`}
                        style={{
                            borderBottom: activeTab === 'members' ? '2px solid #888' : 'none'
                        }}
                    >
                        <span className="flex items-center gap-2">
                            {t('pending.tabs.members')}
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${activeTab === 'members'
                                ? 'bg-gray-600 text-gray-100'
                                : 'bg-gray-700 text-gray-400'
                                }`}>
                                {members.length}
                            </span>
                        </span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto" style={{
                    background: 'linear-gradient(180deg, rgba(42, 42, 42, 0.2) 0%, rgba(31, 31, 31, 0.2) 100%)'
                }}>
                    <div className="px-6 py-5">
                        {/* Pending Requests Tab */}
                        {activeTab === 'pending' && !isPublic && (
                            <>
                                {loading && (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="relative w-8 h-8 mb-3">
                                            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-500 animate-spin" style={{ animationDuration: '1s' }}></div>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium">{t('pending.loading')}</p>
                                    </div>
                                )}

                                {!loading && requests.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <div className="w-12 h-12 rounded-full mb-4" ></div>
                                        <p className="text-sm font-medium text-white">{t('pending.noRequests')}</p>
                                        <p className="text-xs text-gray-500 mt-1">{t('pending.allApproved')}</p>
                                    </div>
                                )}

                                {!loading && requests.length > 0 && (
                                    <div className="space-y-3">
                                        {requests.map((request) => (
                                            <div
                                                key={request._id}
                                                className="group p-4 rounded-2xl transition-all duration-300 hover:shadow-lg"
                                                style={{
                                                    background: 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
                                                    border: '1px solid #404040',
                                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)';
                                                }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className="relative">
                                                            {request.user?.avatar_url ? (
                                                                <img
                                                                    src={request.user.avatar_url}
                                                                    alt={request.user.full_name}
                                                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20"
                                                                />
                                                            ) : (
                                                                <div className="w-12 h-12 rounded-full flex items-center justify-center ring-2 ring-blue-500/20" style={{ backgroundColor: '#3a3a3a' }}>
                                                                    <span className="text-base font-semibold text-gray-400">
                                                                        {request.user?.full_name?.charAt(0).toUpperCase() || '?'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-[#272727]"></span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-semibold text-white">
                                                                {request.user?.full_name || t('pending.unknownUser')}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                {t('pending.requestedAt', {
                                                                    date: new Date(request.created_at).toLocaleString('vi-VN', {
                                                                        day: '2-digit',
                                                                        month: '2-digit',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <button
                                                            onClick={() => handleApprove(request.user_id)}
                                                            className="px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                                                            style={{
                                                                background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.3) 0%, rgba(34, 197, 94, 0.2) 100%)',
                                                                border: '1px solid rgba(74, 222, 128, 0.4)',
                                                                color: '#86efac'
                                                            }}
                                                            title={t('pending.approveTooltip')}
                                                        >
                                                            {t('pending.approve')}
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(request.user_id)}
                                                            className="px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                                                            style={{
                                                                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.2) 100%)',
                                                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                                                color: '#fca5a5'
                                                            }}
                                                            title={t('pending.rejectTooltip')}
                                                        >
                                                            {t('pending.reject')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Members Tab */}
                        {activeTab === 'members' && (
                            <>
                                {members.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <div className="w-12 h-12 rounded-full mb-4" style={{
                                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(74, 222, 128, 0.05) 100%)',
                                            border: '1px solid rgba(34, 197, 94, 0.2)'
                                        }}></div>
                                        <p className="text-sm font-medium text-white">{t('pending.noMembers')}</p>
                                        <p className="text-xs text-gray-500 mt-1">{t('pending.waitingForMembers')}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {members.map((member) => (
                                            <div
                                                key={member.identity}
                                                className="p-3 rounded-2xl transition-all duration-300 flex items-center gap-3 hover:shadow-lg"
                                                style={{
                                                    background: member.isCurrent
                                                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)'
                                                        : 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
                                                    border: member.isCurrent
                                                        ? '1px solid rgba(59, 130, 246, 0.3)'
                                                        : '1px solid #404040',
                                                    boxShadow: member.isCurrent
                                                        ? 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                                                        : '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                                                }}
                                            >
                                                <div className="relative flex-shrink-0">
                                                    {member.avatarUrl ? (
                                                        <img
                                                            src={member.avatarUrl}
                                                            alt={member.name}
                                                            className="w-10 h-10 rounded-full object-cover ring-2 ring-offset-1"
                                                            style={{
                                                                boxShadow: member.isCurrent
                                                                    ? '0 0 0 2px rgba(59, 130, 246, 0.5), 0 0 0 4px #272727'
                                                                    : '0 0 0 2px rgba(255, 255, 255, 0.1), 0 0 0 4px #272727'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full flex items-center justify-center ring-2 ring-offset-1 font-semibold text-sm" style={{
                                                            backgroundColor: '#3a3a3a',
                                                            color: '#888',
                                                            boxShadow: member.isCurrent
                                                                ? '0 0 0 2px rgba(59, 130, 246, 0.5), 0 0 0 4px #272727'
                                                                : '0 0 0 2px rgba(255, 255, 255, 0.1), 0 0 0 4px #272727'
                                                        }}>
                                                            {member.name?.charAt(0).toUpperCase() || '?'}
                                                        </div>
                                                    )}
                                                    <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#272727] ${member.isCurrent ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-white truncate">
                                                        {member.name || member.identity}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <p className={`text-xs font-medium ${member.isCurrent ? 'text-blue-300' : 'text-green-300'}`}>
                                                            {member.isCurrent ? t('pending.you') : t('pending.online')}
                                                        </p>
                                                        {member.host && (
                                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-yellow-500/40 text-yellow-300 bg-yellow-500/10">
                                                                {t('pending.host')}
                                                            </span>
                                                        )}
                                                        {!member.host && member.admin && (
                                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-500/40 text-blue-300 bg-blue-500/10">
                                                                {t('pending.admin')}
                                                            </span>
                                                        )}
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="flex items-center justify-center w-4 h-4 rounded-full">
                                                                {member.micEnabled ? (
                                                                    <Icon name="mic" size={28} className='text-blue-400' />
                                                                ) : (
                                                                    <Icon name="unMic" size={28} className='text-gray-400' />
                                                                )}
                                                            </div>
                                                            <div className="flex items-center justify-center w-4 h-4 rounded-full" >
                                                                {member.camEnabled ? (
                                                                    <Icon name="cam" size={28} className='text-blue-400' />
                                                                ) : (
                                                                    <Icon name="unCam" size={28} className='text-gray-400' />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {canKick(member) && (
                                                    <button
                                                        onClick={() => handleKickMember(member.identity, member.name)}
                                                        className="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 transition-all duration-200"
                                                        title={t('pending.kickTooltip')}
                                                        style={{
                                                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.2) 100%)',
                                                            border: '1px solid rgba(239, 68, 68, 0.4)',
                                                            color: '#fca5a5'
                                                        }}
                                                    >
                                                        {t('pending.kick')}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </>

        </div>
    );
};

export default PendingRequestsPanel;
