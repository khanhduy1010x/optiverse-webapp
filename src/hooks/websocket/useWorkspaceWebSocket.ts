import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { BASE_URL } from '../../config/env.config';

interface UseWorkspaceWebSocketProps {
  workspaceId: string | null;
  isDashboard?: boolean;
}

export const useWorkspaceWebSocket = ({
  workspaceId,
  isDashboard = false,
}: UseWorkspaceWebSocketProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!workspaceId || !currentUser) return;

    console.log('🔗 Connecting to workspace WebSocket...', {
      workspaceId,
      isDashboard,
    });

    // Create socket connection to workspace namespace
    const newSocket = io(`${BASE_URL}workspace`, {
      path: '/productivity/socket.io',
      transports: ['websocket'],
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Connected to workspace WebSocket');
      setIsConnected(true);

      // Join workspace room for general events (ban, remove)
      newSocket.emit('join-workspace', {
        workspaceId,
        userId: currentUser._id,
      });

      // If on dashboard, also join dashboard room for detailed events
      if (isDashboard) {
        newSocket.emit('join-dashboard', {
          workspaceId,
          userId: currentUser._id,
        });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from workspace WebSocket');
      setIsConnected(false);
    });

    newSocket.on('connect_error', error => {
      console.error('🚫 WebSocket connection error:', error);
    });

    setSocket(newSocket);

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up WebSocket connection');

      if (newSocket.connected) {
        // Leave rooms before disconnecting
        newSocket.emit('leave-workspace', { workspaceId });
        if (isDashboard) {
          newSocket.emit('leave-dashboard', { workspaceId });
        }
      }

      newSocket.disconnect();
    };
  }, [workspaceId, currentUser, isDashboard]);

  return { socket, isConnected };
};
