import React from 'react';
import { User } from '../../services/focusRoom.service';

interface RoomCardProps {
    title: string;
    host: User | null;
    description: string;
    type: 'public' | 'private';
    accessMode: 'free' | 'approval' | 'password' | 'code';
    participants: number;
    joinRoom: (roomId: string, password: string | null) => void;
    date: string;
    key: string;
    id: string;
}

const RoomCard: React.FC<RoomCardProps> = ({
    id,
    title,
    host,
    description,
    type,
    accessMode,
    participants,
    date,
    joinRoom,
    key,
}) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500 mt-1">by {host?.full_name}</p>
                </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">{description}</p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
                <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${type === 'public'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}
                >
                    {type === 'public' ? 'Public' : 'Private'}
                </span>
                <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${accessMode === 'free'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                        }`}
                >
                    {accessMode === 'free'
                        ? 'Free'
                        : accessMode.charAt(0).toUpperCase() + accessMode.slice(1)}
                </span>
            </div>

            {/* Participants */}
            <div className="flex items-center gap-1 text-sm text-gray-700 mb-4">
                <span>👥 {participants} participants</span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">{date}</span>
                <button
                    onClick={() => joinRoom(id, null)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    Join {id}
                </button>
            </div>
        </div>
    );
};

export default RoomCard;
