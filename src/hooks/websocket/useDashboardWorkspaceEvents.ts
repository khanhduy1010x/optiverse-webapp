import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Socket } from 'socket.io-client';
import { RootState } from '../../store';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

interface UseDashboardWorkspaceEventsProps {
  socket: Socket | null;
  onRefreshWorkspace?: () => void;
}

export const useDashboardWorkspaceEvents = ({
  socket,
  onRefreshWorkspace,
}: UseDashboardWorkspaceEventsProps) => {
  const { t } = useTranslation();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!socket || !currentUser) return;

    // Handle role changed event
    const handleRoleChanged = (data: {
      userId: string;
      newRole: string;
      oldRole: string;
      changedBy: string;
      timestamp: Date;
      workspaceId: string;
    }) => {
      console.log('🔄 Role changed event:', data);

      // Check if the current user's role was changed
      if (data.userId === currentUser._id) {
        // Show notification about role change
        toast.info(
          t('workspace.notifications.roleChanged', {
            oldRole: data.oldRole,
            newRole: data.newRole,
          }),
          {
            position: 'top-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );

        // No need to refresh workspace data since we're using optimistic updates
        if (onRefreshWorkspace) {
          onRefreshWorkspace();
        }
      } else {
        // Another member's role changed, no need to refresh since we use optimistic updates
      }
    };

    // Handle permissions changed event
    const handlePermissionsChanged = (data: {
      userId: string;
      newPermissions: string[];
      changedBy: string;
      timestamp: Date;
      workspaceId: string;
    }) => {
      console.log('🔐 Permissions changed event:', data);

      // Check if the current user's permissions were changed
      if (data.userId === currentUser._id) {
        // Show notification about permission change
        toast.info(t('workspace.notifications.permissionsChanged'), {
          position: 'top-right',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // No need to refresh workspace data since we're using optimistic updates
        // if (onRefreshWorkspace) {
        //   onRefreshWorkspace();
        // }
      } else {
        // Another member's permissions changed, no need to refresh since we use optimistic updates
        // if (onRefreshWorkspace) {
        //   onRefreshWorkspace();
        // }
      }
    };

    // Handle member banned event (for dashboard updates)
    const handleMemberBannedDashboard = (data: {
      userId: string;
      bannedBy: string;
      timestamp: Date;
      workspaceId: string;
    }) => {
      console.log('🚫 Member banned (dashboard) event:', data);

      // Refresh workspace data to update member list
      if (onRefreshWorkspace) {
        onRefreshWorkspace();
      }
    };

    // Handle member removed event (for dashboard updates)
    const handleMemberRemovedDashboard = (data: {
      userId: string;
      removedBy: string;
      timestamp: Date;
      workspaceId: string;
    }) => {
      console.log('🗑️ Member removed (dashboard) event:', data);

      // Refresh workspace data to update member list
      if (onRefreshWorkspace) {
        onRefreshWorkspace();
      }
    };

    // Register event listeners
    socket.on('role-changed', handleRoleChanged);
    socket.on('permissions-changed', handlePermissionsChanged);
    socket.on('member-banned', handleMemberBannedDashboard);
    socket.on('member-removed', handleMemberRemovedDashboard);

    console.log('🎧 Dashboard workspace event listeners registered');

    // Cleanup function
    return () => {
      socket.off('role-changed', handleRoleChanged);
      socket.off('permissions-changed', handlePermissionsChanged);
      socket.off('member-banned', handleMemberBannedDashboard);
      socket.off('member-removed', handleMemberRemovedDashboard);
      console.log('🧹 Dashboard workspace event listeners cleaned up');
    };
  }, [socket, currentUser, onRefreshWorkspace, t]);
};
