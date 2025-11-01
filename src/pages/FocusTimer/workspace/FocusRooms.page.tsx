import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppTranslate } from '../../../hooks/useAppTranslate';
import RoomList from './RoomList.component';
import CreateRoomForm from './CreateRoomForm.component';
import VideoRoom from './VideoRoom.component';
import WaitingForApprovalScreen from './WaitingForApprovalScreen.component';
import { useFocusRoom } from '../../../hooks/focus-room/useFocusRoom.hook';

const FocusRoomsPage: React.FC = () => {
    const { workspaceId: paramWorkspaceId } = useParams<{ workspaceId?: string }>();
    const { t } = useAppTranslate('focus-room');
    const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');

    const workspaceId = paramWorkspaceId;

    const {
        rooms,
        loading,
        error,
        token,
        setToken,
        joinRoom,
        currentRoom,
        canCreateRoom,
        permission,
        isWaitingForApproval,
        setIsWaitingForApproval,
        setCurrentRoom,
        refresh
    } = useFocusRoom(workspaceId || undefined);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isOwner = currentRoom?.host_id === user?.userId;
    const isRoomAdmin = (permission?.is_owner || permission?.actions?.includes('ROOM_ADMIN')) ?? false;
    // Manager concept = host or room admin for moderation tasks
    const isManager = !!(isOwner || isRoomAdmin);
    const isAdmin = !!isRoomAdmin;

    const mappedRooms = rooms.map((r) => ({
        id: r._id,
        title: r.name,
        host: r.hostUser,
        description: r.description || t('roomCard.noDescription'),
        type: r.access_type as 'public' | 'private',
        have_password: r.have_password,
        userAccessStatus: r.userAccessStatus,
        participants: 0,
        date: new Date(r.created_at).toLocaleDateString(),
        isOwner: r.isOwner,
        memberCount: r.memberCount || 0,
    }));
    useEffect(() => {
        document.title = 'Focus Rooms | Optiverse'

    }, [])

    const leaveRoom = () => {
        setToken('');
        setCurrentRoom(null);
    }
    // Show waiting for approval screen
    if (isWaitingForApproval && currentRoom) {
        return (
            <WaitingForApprovalScreen
                room={currentRoom}
                workspaceId={workspaceId || undefined}
                onCancel={() => {
                    setIsWaitingForApproval(false);
                }}
                onApproved={(token: string) => {
                    setToken(token);
                    setIsWaitingForApproval(false);
                }}
            />
        );
    }
    console.log(currentRoom)
    // Show video room
    if (token && currentRoom) {
        return (
            <VideoRoom
                leaveRoom={leaveRoom}
                token={token}
                roomName={currentRoom.name}
                roomId={currentRoom._id}
                isAdmin={isAdmin}
                isManager={isManager}
                workspaceId={workspaceId || undefined}
                isPublic={currentRoom.access_type === 'public'}
            />
        );
    }

    return (
        <div className="w-full bg-white" style={{ minHeight: '100vh' }}>
            {/* Header */}
            <div className="border-b" style={{ borderColor: '#e5e5e5' }}>
                <div className="max-w-7xl mx-auto px-6 py-10 sm:px-8">
                    <div className="mb-1">
                        <h1 className="text-4xl font-semibold text-gray-900">Focus Rooms</h1>
                    </div>
                    <p className="text-base text-gray-500 font-normal">
                        {mappedRooms.length} {t('roomList.roomCount')}
                    </p>
                </div>
            </div>
            <div className="flex gap-0 max-w-7xl  mx-auto px-6 sm:px-8" style={{ borderColor: '#e5e5e5' }}>
                <button
                    onClick={() => {
                        setActiveTab('browse');
                        refresh();
                    }}
                    className="px-0 py-4 text-base font-medium transition-colors relative"
                    style={{
                        color: activeTab === 'browse' ? '#000' : '#666',
                        borderBottom: activeTab === 'browse' ? '2px solid #000' : 'none',
                        marginBottom: '-1px'
                    }}
                >
                    {t('roomList.browseTab')}
                </button>

                {canCreateRoom && (
                    <button
                        onClick={() => {
                            setActiveTab('create');
                        }}
                        className="px-6 py-4 text-base font-medium transition-colors relative"
                        style={{
                            color: activeTab === 'create' ? '#000' : '#666',
                            borderBottom: activeTab === 'create' ? '2px solid #000' : 'none',
                            marginBottom: '-1px'
                        }}
                    >
                        {t('roomList.createTab')}
                    </button>
                )}

            </div>
            {/* Main Content */}
            <div className="max-w-7xl h-screen scrollbar-hide  mx-auto px-6 sm:px-8 py-8 pb-70">
                {/* Tabs */}


                {/* Content Area */}
                {activeTab === 'browse' && (
                    <div className="">
                        {error && (
                            <div className="p-5 rounded-xl mb-6 border" style={{
                                backgroundColor: '#fef2f2',
                                borderColor: '#fecaca',
                                color: '#991b1b'
                            }}>
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}
                        {loading ? (
                            <div className="text-center py-16">
                                <p className="text-base text-gray-500 font-normal">{t('permissions.loadingWorkspace')}</p>
                            </div>
                        ) : (
                            <RoomList
                                joinRoom={joinRoom}
                                rooms={mappedRooms}
                                isEmpty={mappedRooms.length === 0}
                                onRoomUpdated={() => refresh()}
                            />
                        )}
                    </div>
                )}

                {canCreateRoom && activeTab === 'create' && (
                    <div>
                        <CreateRoomForm onSuccess={() => {
                            setActiveTab('browse');
                            refresh();
                        }} />
                    </div>
                )}

                {!canCreateRoom && activeTab === 'create' && (
                    <div className="text-center py-16 px-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            {t('permissions.noPermission')}
                        </h3>
                        <p className="text-gray-500 text-base font-normal mb-4">
                            {t('permissions.noPermission')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FocusRoomsPage;
