import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthState } from '../../hooks/useAuthState.hook';
import { useCollaborativeFocus } from '../../hooks/useCollaborativeFocus.hook';
import CollaborativeFocusTimer from '../../components/collaborative-focus/CollaborativeFocusTimer.component';
import CreateFocusSessionModal from '../../components/collaborative-focus/CreateFocusSessionModal.component';
import { FocusSessionStatus } from '../../types/collaborative-focus/collaborative-focus.types';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const WorkspaceMembersPage: React.FC = () => {
    const { workspaceId } = useParams();
    const { t } = useAppTranslate('workspace');
    const { user } = useAuthState();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');

    const {
        sessions,
        activeSession,
        loading,
        error,
        createSession,
        joinSession,
        leaveSession,
        startSession,
        pauseSession,
        resumeSession,
        completeSession,
        deleteSession,
    } = useCollaborativeFocus(workspaceId || '');

    // Lọc sessions theo trạng thái
    const availableSessions = sessions.filter(
        (s) => s.status !== FocusSessionStatus.COMPLETED
    );
    const completedSessions = sessions.filter(
        (s) => s.status === FocusSessionStatus.COMPLETED
    );

    // Debug logs
    React.useEffect(() => {
        console.log('📊 Total sessions:', sessions.length);
        console.log('🟢 Available sessions:', availableSessions.length);
        console.log('✅ Completed sessions:', completedSessions.length);
        console.log('Sessions data:', sessions);
    }, [sessions, availableSessions, completedSessions]);

    // Convert participants object to array for display
    const getParticipantsCount = (participants: Record<string, any>) => {
        return Object.keys(participants || {}).length;
    };

    const handleCreateSession = async (data: {
        title: string;
        description: string;
        duration: number;
    }) => {
        try {
            const session = await createSession({
                title: data.title,
                description: data.description,
                duration: data.duration, // Duration is already in minutes
            });
            // Auto join the created session
            if (session) {
                await joinSession(session.id);
            }
        } catch (error) {
            console.error('Failed to create and join session:', error);
        }
    };

    const handleJoinSession = async (sessionId: string) => {
        try {
            await joinSession(sessionId);
        } catch (error) {
            console.error('Failed to join session:', error);
        }
    };

    const handleLeaveSession = async () => {
        if (!activeSession) return;
        try {
            await leaveSession(activeSession.id);
        } catch (error) {
            console.error('Failed to leave session:', error);
        }
    };

    const handleStartSession = async () => {
        if (!activeSession) return;
        try {
            await startSession(activeSession.id);
        } catch (error) {
            console.error('Failed to start session:', error);
        }
    };

    const handlePauseSession = async () => {
        if (!activeSession) return;
        try {
            // Calculate current time before pause
            const baseTime = activeSession.currentTime || 0;
            const elapsed = activeSession.startedAt 
                ? Math.floor((Date.now() - activeSession.startedAt) / 1000)
                : 0;
            const totalTime = baseTime + elapsed;
            
            await pauseSession(activeSession.id, totalTime);
        } catch (error) {
            console.error('Failed to pause session:', error);
        }
    };

    const handleResumeSession = async () => {
        if (!activeSession) return;
        try {
            await resumeSession(activeSession.id);
        } catch (error) {
            console.error('Failed to resume session:', error);
        }
    };

    const handleCompleteSession = async () => {
        if (!activeSession) return;
        try {
            await completeSession(activeSession.id);
        } catch (error) {
            console.error('Failed to complete session:', error);
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        if (window.confirm('Bạn có chắc muốn xóa phiên tập trung này?')) {
            try {
                await deleteSession(sessionId);
            } catch (error) {
                console.error('Failed to delete session:', error);
            }
        }
    };

    const isCreator = (creatorId: string) => {
        const userId = user?._id || user?.user_id;
        return userId === creatorId;
    };

    // Debug: log activeSession changes
    React.useEffect(() => {
        console.log('🔴 activeSession changed:', activeSession);
    }, [activeSession]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#0092B8] to-[#00B8D4] bg-clip-text text-transparent">
                                {t('collaborativeFocus.title')}
                            </h1>
                            <p className="text-gray-600 mt-2">
                                {t('collaborativeFocus.subtitle')}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-[#0092B8] to-[#00B8D4] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                        >
                            <span className="flex items-center">
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                {t('collaborativeFocus.createNew')}
                            </span>
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    )}
                </div>

                {/* Active Session */}
                {activeSession && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Phiên hiện tại
                        </h2>
                        <CollaborativeFocusTimer
                            session={activeSession}
                            onStart={handleStartSession}
                            onPause={handlePauseSession}
                            onResume={handleResumeSession}
                            onComplete={handleCompleteSession}
                            onLeave={handleLeaveSession}
                            isCreator={isCreator(activeSession.creatorId)}
                        />
                    </div>
                )}

                {/* Tabs */}
                {!activeSession && (
                    <div className="mb-6">
                        <div className="flex space-x-2 border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab('available')}
                                className={`px-6 py-3 font-semibold transition-all relative ${
                                    activeTab === 'available'
                                        ? 'text-[#0092B8] border-b-2 border-[#0092B8]'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <span className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {t('collaborativeFocus.availableSessions')}
                                    {availableSessions.length > 0 && (
                                        <span className="ml-2 px-2 py-0.5 bg-cyan-100 text-[#0092B8] text-xs rounded-full font-bold">
                                            {availableSessions.length}
                                        </span>
                                    )}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`px-6 py-3 font-semibold transition-all relative ${
                                    activeTab === 'history'
                                        ? 'text-[#0092B8] border-b-2 border-[#0092B8]'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <span className="flex items-center">
                                  
                                    {t('collaborativeFocus.history')}
                                    {completedSessions.length > 0 && (
                                        <span className="ml-2 px-2 py-0.5 bg-cyan-100 text-[#0092B8] text-xs rounded-full font-bold">
                                            {completedSessions.length}
                                        </span>
                                    )}
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Available Sessions */}
                {!activeSession && activeTab === 'available' && availableSessions.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            {t('collaborativeFocus.availableSessions')}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {availableSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                {session.title}
                                            </h3>
                                            {session.description && (
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {session.description}
                                                </p>
                                            )}
                                        </div>
                                        {isCreator(session.creatorId) && (
                                            <button
                                                onClick={() => handleDeleteSession(session.id)}
                                                className="text-gray-400 hover:text-red-600 transition-colors"
                                                title="Xóa phiên"
                                            >
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <svg
                                                className="w-4 h-4 mr-2"
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
                                            {Math.floor(session.duration / 60)} phút
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <svg
                                                className="w-4 h-4 mr-2"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                />
                                            </svg>
                                            {getParticipantsCount(session.participants)} người tham gia
                                        </div>
                                        {/* Status Badge */}
                                        <div className="flex items-center">
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    session.status === FocusSessionStatus.ACTIVE
                                                        ? 'text-green-700 bg-green-100'
                                                        : session.status === FocusSessionStatus.PAUSED
                                                        ? 'text-yellow-700 bg-yellow-100'
                                                        : 'text-[#0092B8] bg-cyan-100'
                                                }`}
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                                                {session.status === FocusSessionStatus.ACTIVE
                                                    ? 'Đang chạy'
                                                    : session.status === FocusSessionStatus.PAUSED
                                                    ? 'Tạm dừng'
                                                    : 'Chờ bắt đầu'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {isCreator(session.creatorId) && session.status === FocusSessionStatus.WAITING ? (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    console.log('🎬 Starting session:', session.id);
                                                    console.log('Current activeSession:', activeSession);
                                                    
                                                    // Join the session first
                                                    await handleJoinSession(session.id);
                                                    
                                                    console.log('After join, activeSession:', activeSession);
                                                    
                                                    // Wait a bit for activeSession to be set
                                                    await new Promise(resolve => setTimeout(resolve, 500));
                                                    
                                                    // Then start using the session ID directly
                                                    await startSession(session.id);
                                                    
                                                    console.log('✅ Session started successfully');
                                                    console.log('Final activeSession:', activeSession);
                                                } catch (error) {
                                                    console.error('❌ Failed to start session:', error);
                                                }
                                            }}
                                            disabled={loading}
                                            className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Bắt đầu phiên
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleJoinSession(session.id)}
                                            disabled={loading}
                                            className="w-full px-4 py-2 bg-gradient-to-r from-[#0092B8] to-[#00B8D4] text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Tham gia
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!activeSession && activeTab === 'available' && availableSessions.length === 0 && !loading && (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-100 to-sky-100 flex items-center justify-center">
                            <svg
                                className="w-12 h-12 text-[#0092B8]"
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
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {t('collaborativeFocus.noSessions')}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {t('collaborativeFocus.noSessionsDescription')}
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-8 py-3 bg-gradient-to-r from-[#0092B8] to-[#00B8D4] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                        >
                            {t('collaborativeFocus.createFirst')}
                        </button>
                    </div>
                )}

                {/* Completed Sessions History */}
                {!activeSession && activeTab === 'history' && (
                    <div>
                        {completedSessions.length > 0 ? (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {t('collaborativeFocus.historyTitle')}
                                        </h2>
                                        <p className="text-gray-600 text-sm mt-1">
                                            {t('collaborativeFocus.historySubtitle')}
                                        </p>
                                    </div>
                                    <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold">
                                        {completedSessions.length} {t('collaborativeFocus.sessions')}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {completedSessions.map((session) => {
                                const completedDate = session.completedAt 
                                    ? new Date(session.completedAt).toLocaleDateString('vi-VN', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })
                                    : session.updatedAt
                                    ? new Date(session.updatedAt).toLocaleDateString('vi-VN', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })
                                    : 'N/A';
                                
                                return (
                                    <div
                                        key={session.id}
                                        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all"
                                    >
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">
                                                    {session.title}
                                                </h4>
                                                {session.description && (
                                                    <p className="text-xs text-gray-600 line-clamp-2">
                                                        {session.description}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 ml-2">
                                                <svg
                                                    className="w-3 h-3 mr-1"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                Done
                                            </span>
                                        </div>

                                        {/* Stats */}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center text-sm text-gray-700">
                                                <svg
                                                    className="w-4 h-4 mr-2 text-blue-600"
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
                                                <span className="font-medium">
                                                    {Math.floor(session.duration / 60)} phút
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-700">
                                                <svg
                                                    className="w-4 h-4 mr-2 text-purple-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                    />
                                                </svg>
                                                <span className="font-medium">
                                                    {getParticipantsCount(session.participants)} người
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-700">
                                                <svg
                                                    className="w-4 h-4 mr-2 text-green-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                <span className="font-medium">
                                                    {completedDate}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Participants Avatars */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex -space-x-2">
                                                {Object.values(session.participants || {}).slice(0, 3).map((participant: any) => (
                                                    <div
                                                        key={participant.userId}
                                                        className="relative"
                                                        title={participant.userName}
                                                    >
                                                        {participant.userAvatar ? (
                                                            <img
                                                                src={participant.userAvatar}
                                                                alt={participant.userName}
                                                                className="w-7 h-7 rounded-full border-2 border-white bg-gray-200"
                                                            />
                                                        ) : (
                                                            <div className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                                                                {participant.userName.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {getParticipantsCount(session.participants) > 3 && (
                                                    <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-gray-700 text-[10px] font-bold">
                                                        +{getParticipantsCount(session.participants) - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                            </>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                    <svg
                                        className="w-12 h-12 text-purple-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {t('collaborativeFocus.noHistory')}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {t('collaborativeFocus.noHistoryDescription')}
                                </p>
                                <button
                                    onClick={() => setActiveTab('available')}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                >
                                    {t('collaborativeFocus.viewAvailableSessions')}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="text-gray-600 mt-4">Đang tải...</p>
                    </div>
                )}
            </div>

            {/* Create Session Modal */}
            <CreateFocusSessionModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateSession}
            />
        </div>
    );
};

export default WorkspaceMembersPage;
