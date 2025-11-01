import React, { useState, useEffect } from 'react';
import PendingRequestsPanel from './PendingRequestsPanel.component';

interface VideoRoomPendingRequestsProps {
    roomId: string;
    isManager: boolean;
    workspaceId?: string;
    variant?: 'floating' | 'inline';
    align?: 'left' | 'right';
}

const VideoRoomPendingRequests: React.FC<VideoRoomPendingRequestsProps> = ({
    roomId,
    isManager,
    workspaceId,
    variant = 'floating',
    align = 'left',
}) => {
    const [isOpen, setIsOpen] = useState(false);



    return (



        <div className={variant === 'inline' ? 'relative overflow-visible' : 'flex-1 overflow-hidden'}>
            <PendingRequestsPanel
                roomId={roomId}
                isManager={isManager}
                workspaceId={workspaceId}
                variant={variant}
                align={align}
            />
        </div>

    );
};

export default VideoRoomPendingRequests;
