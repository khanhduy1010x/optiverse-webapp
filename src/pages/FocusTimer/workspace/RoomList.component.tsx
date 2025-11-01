import React, { useState } from 'react';
import RoomCard from './RoomCard.component';
import { useAppTranslate } from '../../../hooks/useAppTranslate';

export interface Room {
    id: string;
    title: string;
    host: any;
    description: string;
    type: 'public' | 'private';
    have_password: boolean;
    userAccessStatus?: 'allowed' | 'pending' | 'password_required' | 'denied';
    participants: number;
    date: string;
    isOwner?: boolean;
    memberCount?: number;
}


export interface RoomListProps {
    rooms: Room[];
    isEmpty?: boolean;
    joinRoom: (roomId: string, password?: string, joinType?: 'password' | 'request') => Promise<void>;
    onRoomUpdated?: () => void;
}

const RoomList: React.FC<RoomListProps> = ({ rooms, isEmpty = false, joinRoom, onRoomUpdated }) => {
    const { t } = useAppTranslate('focus-room');
    const [filterMode, setFilterMode] = useState<'all' | 'myRooms'>('all');

    if (isEmpty) {
        return (
            <div className="text-center py-16 ">
                <div className="text-6xl mb-4">🌳</div>
                <p className="text-xl text-gray-600 mb-2">{t('roomList.noRooms')}</p>
                <p className="text-gray-500">{t('roomList.beFirst')}</p>
            </div>
        );
    }

    // Filter rooms based on mode
    const filteredRooms = filterMode === 'myRooms' ? rooms.filter(r => r.isOwner) : rooms;

    // Separate rooms by type
    const publicRooms = filteredRooms.filter(r => r.type === 'public');
    const privateNoPassRooms = filteredRooms.filter(r => r.type === 'private' && !r.have_password);
    const privateWithPassRooms = filteredRooms.filter(r => r.type === 'private' && r.have_password);

    const renderSection = (title: string, icon: string, rooms: Room[], bgColor: string, textColor: string, borderColor: string) => {
        if (rooms.length === 0) return null;

        return (
            <div key={title} className="mb-10">
                {/* Section Header */}
                <div className="flex items-center gap-2 mb-5">
                    <span
                        className="inline-flex items-center px-3 py-1 rounded-lg font-semibold text-sm"
                        style={{
                            backgroundColor: bgColor,
                            color: borderColor,
                        }}
                    >
                        {title}
                    </span>
                    <span className="text-xs text-gray-500">({rooms.length} {rooms.length === 1 ? 'room' : 'rooms'})</span>
                </div>

                {/* Grid of Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        <RoomCard
                            key={room.id}
                            id={room.id}
                            title={room.title}
                            host={room.host}
                            description={room.description}
                            type={room.type}
                            have_password={room.have_password}
                            userAccessStatus={room.userAccessStatus}
                            participants={room.participants}
                            date={room.date}
                            joinRoom={joinRoom}
                            isOwner={room.isOwner}
                            onRoomUpdated={onRoomUpdated}
                            memberCount={room.memberCount}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="!pb-12">
            {/* Filter Tabs */}
            <div className="flex gap-3 mb-8">
                <button
                    onClick={() => setFilterMode('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterMode === 'all'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    All Rooms
                </button>
                <button
                    onClick={() => setFilterMode('myRooms')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterMode === 'myRooms'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    My Rooms
                </button>
            </div>

            {/* Public Rooms Section */}
            {renderSection(
                'Public Rooms',
                '',
                publicRooms,
                '#e9d5ff',      // Light Purple Pastel
                'text-purple-700',
                '#a855f7'
            )}

            {/* Private Rooms (No Password) Section */}
            {renderSection(
                'Private Rooms',
                '',
                privateNoPassRooms,
                '#dcfce7',      // Light Green Pastel
                'text-green-700',
                '#22c55e'
            )}

            {/* Protected Rooms (With Password) Section */}
            {renderSection(
                'Protected Rooms',
                '',
                privateWithPassRooms,
                '#fed7aa',      // Light Orange Pastel
                'text-orange-700',
                '#f97316'
            )}

            {/* Show message if all sections are empty */}
            {publicRooms.length === 0 && privateNoPassRooms.length === 0 && privateWithPassRooms.length === 0 && (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">🌳</div>
                    <p className="text-xl text-gray-600 mb-2">
                        {filterMode === 'myRooms' ? 'No rooms created yet' : t('roomList.noRooms')}
                    </p>
                    <p className="text-gray-500">{t('roomList.beFirst')}</p>
                </div>
            )}
        </div>
    );
};

export default RoomList;
