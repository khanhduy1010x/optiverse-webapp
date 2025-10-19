import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Socket } from 'socket.io-client';
import { RootState } from '../../store';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

interface UseGlobalWorkspaceEventsProps {
  socket: Socket | null;
  workspaceId: string | null;
}

export const useGlobalWorkspaceEvents = ({
  socket,
  workspaceId,
}: UseGlobalWorkspaceEventsProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation('workspace');
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!socket || !currentUser) return;

    // Handle member banned event
    const handleMemberBanned = (data: {
      userId: string;
      bannedBy: string;
      timestamp: Date;
      workspaceId: string;
    }) => {
      console.log('🚫 Member banned event:', data);

      // Check if the current user was banned
      if (data.userId === currentUser._id) {
        // Show notification
        toast.error(t('dashboardWorkspace.notifications.youWereBanned'), {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Redirect to home after a short delay
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      }
    };

    // Handle member removed event
    const handleMemberRemoved = (data: {
      userId: string;
      removedBy: string;
      timestamp: Date;
      workspaceId: string;
    }) => {
      console.log('🗑️ Member removed event:', data);

      // Check if the current user was removed
      if (data.userId === currentUser._id) {
        // Show notification
        toast.warning(t('dashboardWorkspace.notifications.youWereRemoved'), {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Redirect to home after a short delay
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      }
    };

    // Register event listeners for global (redirect) events
    socket.on('user-banned', handleMemberBanned);
    socket.on('user-removed', handleMemberRemoved);

    console.log('🎧 Global workspace event listeners registered');

    // Cleanup function
    return () => {
      socket.off('user-banned', handleMemberBanned);
      socket.off('user-removed', handleMemberRemoved);
      console.log('🧹 Global workspace event listeners cleaned up');
    };
  }, [socket, currentUser, navigate, t]);
};
