import React from 'react';
import RoomCard from './RoomCard.component';

export interface Room {
    id: string;
    title: string;
    host: string;
    description: string;
    type: 'public' | 'private';
    accessMode: 'free' | 'approval' | 'password' | 'code';
    participants: number;
    date: string;
}

export interface RoomListProps {
    rooms: Room[];
    isEmpty?: boolean;
    joinRoom: (roomId: string, password: string | null) => void;
}

const RoomList: React.FC<RoomListProps> = ({ rooms, isEmpty = false, joinRoom }) => {
    if (isEmpty) {
        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">🌳</div>
                <p className="text-xl text-gray-600 mb-2">No public rooms yet</p>
                <p className="text-gray-500">Be the first to create a room!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
                <RoomCard
                    joinRoom={joinRoom}
                    key={room.id}
                    id={room.id}
                    title={room.title}
                    host={room.host}
                    description={room.description}
                    type={room.type}
                    accessMode={room.accessMode}
                    participants={room.participants}
                    date={room.date}
                />
            ))}
        </div>
    );
};

export default RoomList;
