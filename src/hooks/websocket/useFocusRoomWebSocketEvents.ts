import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

interface UseFocusRoomWebSocketEventsProps {
  socket: Socket | null;
  roomId?: string;
  onJoinRequestUpdate?: () => void;
}

export const useFocusRoomWebSocketEvents = ({
  socket,
  roomId,
  onJoinRequestUpdate,
}: UseFocusRoomWebSocketEventsProps) => {
  const { t } = useTranslation();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!socket || !roomId || !currentUser) return;

    // Handle focus room join request created
    const handleJoinRequestCreated = (data: {
      roomId: string;
      userId: string;
      workspaceId?: string;
      timestamp: Date;
    }) => {
      // Only trigger refresh if this is for the current room
      if (data.roomId === roomId && onJoinRequestUpdate) {
        onJoinRequestUpdate();
      }
    };

    // Handle focus room join request approved
    const handleJoinRequestApproved = (data: {
      roomId: string;
      requestId: string;
      targetUserId: string;
      approvedBy: string;
      workspaceId?: string;
      timestamp: Date;
    }) => {
      // Show notification if the current user's request was approved
      if (data.targetUserId === currentUser._id) {
        toast.success(
          t('focusRoom.notifications.requestApproved') ||
            'Your join request was approved!',
          {
            position: 'top-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
      }

      // Refresh pending requests if this is for the current room
      if (data.roomId === roomId && onJoinRequestUpdate) {
        onJoinRequestUpdate();
      }
    };

    // Handle focus room join request rejected
    const handleJoinRequestRejected = (data: {
      roomId: string;
      requestId: string;
      targetUserId: string;
      rejectedBy: string;
      workspaceId?: string;
      timestamp: Date;
    }) => {
      // Show notification if the current user's request was rejected
      if (data.targetUserId === currentUser._id) {
        toast.error(
          t('focusRoom.notifications.requestRejected') ||
            'Your join request was rejected',
          {
            position: 'top-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
      }

      // Refresh pending requests if this is for the current room
      if (data.roomId === roomId && onJoinRequestUpdate) {
        onJoinRequestUpdate();
      }
    };

    // Register event listeners
    socket.on('focus-room-join-request-created', handleJoinRequestCreated);
    socket.on('focus-room-join-request-approved', handleJoinRequestApproved);
    socket.on('focus-room-join-request-rejected', handleJoinRequestRejected);

    // Cleanup function
    return () => {
      socket.off('focus-room-join-request-created', handleJoinRequestCreated);
      socket.off('focus-room-join-request-approved', handleJoinRequestApproved);
      socket.off('focus-room-join-request-rejected', handleJoinRequestRejected);
    };
  }, [socket, roomId, currentUser, onJoinRequestUpdate, t]);
};
