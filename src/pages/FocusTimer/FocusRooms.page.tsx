import React from 'react';
import RoomList from './RoomList.component';
import CreateRoomModal from './CreateRoomModal.component';
import { useFocusRoom } from '../../hooks/focus-room/useFocusRoom.hook';
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";


const FocusRoomsPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const { rooms, loading, error, token, joinRoom } = useFocusRoom();

    // 🔥 Chuyển dữ liệu API → UI format
    const mappedRooms = rooms.map((r) => ({
        id: r._id,
        title: r.name,
        host: r.hostUser,
        description: r.description || 'No description',
        type: r.type,
        accessMode: r.accessMode,
        participants: r.participants?.length || 0,
        date: new Date(r.createdAt).toLocaleDateString(),
    }));
    if (token) {
        return (
            <div className="w-full h-screen flex flex-col bg-gray-50">
                <LiveKitRoom
                    token={token}
                    serverUrl="wss://optiverse-oci4s4dr.livekit.cloud"
                    connect
                    data-lk-theme="default"
                    style={{ height: "100vh", width: "100%" }}
                    onDisconnected={() => window.location.reload()}
                >
                    <div className="h-full w-full">
                        <VideoConference />
                    </div>
                </LiveKitRoom>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Focus Rooms</h1>
                <p className="text-gray-600">
                    Create or join collaborative study rooms
                </p>
            </div>

            {/* Main Container */}
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex gap-4">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
                    >
                        + Create Room
                    </button>
                </div>

                {error && (
                    <div className="text-red-600 font-medium mb-4">{error}</div>
                )}

                {loading ? (
                    <p className="text-gray-500">Đang tải phòng...</p>
                ) : (
                    <RoomList joinRoom={joinRoom} rooms={mappedRooms} isEmpty={mappedRooms.length === 0} />
                )}
            </div>

            <CreateRoomModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default FocusRoomsPage;
