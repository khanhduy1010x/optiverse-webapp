import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { BASE_URL } from '../../config/env.config';

interface UseWorkspaceWebSocketProps {
  workspaceId: string | null;
  isDashboard?: boolean;
  selectedNoteId?: string | null;
  canEditNote?: boolean;
}

interface NoteUpdatePayload {
  noteId: string;
  workspaceId: string;
  userId: string;
  content: string;
  updatedAt: Date;
}

export const useWorkspaceWebSocket = ({
  workspaceId,
  isDashboard = false,
  selectedNoteId = null,
  canEditNote = false,
}: UseWorkspaceWebSocketProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const noteUpdateListenersRef = useRef<{
    [key: string]: (data: NoteUpdatePayload) => void;
  }>({});
  const noteUpdateDebounceRef = useRef<{
    [key: string]: NodeJS.Timeout;
  }>({});
  const updateDelayMs = 300; // Match SocketService debounce

  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!workspaceId || !currentUser) return;

    console.log('🔗 Connecting to workspace WebSocket...', {
      workspaceId,
      isDashboard,
      selectedNoteId,
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

      // If user selected a note, join note room
      if (selectedNoteId) {
        subscribeToNoteRoom(newSocket, selectedNoteId);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from workspace WebSocket');
      setIsConnected(false);
    });

    newSocket.on('connect_error', error => {
      console.error('🚫 WebSocket connection error:', error);
    });

    // Listen for note updates in real-time
    newSocket.on('note-updated', (data: NoteUpdatePayload) => {
      console.log('📝 Note updated in real-time:', data);
      // Trigger listener if registered
      if (noteUpdateListenersRef.current[data.noteId]) {
        noteUpdateListenersRef.current[data.noteId](data);
      }
    });

    setSocket(newSocket);

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up WebSocket connection');

      // Clear all pending debounce timeouts
      Object.values(noteUpdateDebounceRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
      noteUpdateDebounceRef.current = {};

      if (newSocket.connected) {
        // Leave rooms before disconnecting
        newSocket.emit('leave-workspace', { workspaceId });
        if (isDashboard) {
          newSocket.emit('leave-dashboard', { workspaceId });
        }
        // Leave note room if subscribed
        if (selectedNoteId) {
          newSocket.emit('leave-note-room', { noteId: selectedNoteId });
        }
      }

      newSocket.disconnect();
    };
  }, [workspaceId, currentUser, isDashboard]);

  /**
   * Subscribe to specific note room
   */
  const subscribeToNoteRoom = (socketInstance: Socket, noteId: string) => {
    socketInstance.emit('join-note-room', {
      noteId,
      workspaceId,
      userId: currentUser?._id,
      canEdit: canEditNote,
    });

    console.log(`📌 Subscribed to note room: ${noteId}`, {
      canEdit: canEditNote,
    });
  };

  /**
   * Subscribe to note when user selects it (after connection established)
   */
  useEffect(() => {
    if (!socket || !selectedNoteId || !socket.connected) return;

    console.log('📌 Subscribing to note room:', selectedNoteId);
    subscribeToNoteRoom(socket, selectedNoteId);

    // Cleanup: leave note room when selecting different note or no note
    return () => {
      if (socket.connected) {
        socket.emit('leave-note-room', { noteId: selectedNoteId });
        console.log(`👋 Left note room: ${selectedNoteId}`);
      }
    };
  }, [selectedNoteId, socket, canEditNote]);

  /**
   * Emit note update to all users in the room (with debounce)
   */
  const emitNoteUpdate = useCallback(
    (noteId: string, content: string) => {
      if (!socket || !socket.connected) {
        console.warn('⚠️ Socket not connected, cannot emit note update');
        return;
      }

      // Clear existing debounce timeout for this note
      if (noteUpdateDebounceRef.current[noteId]) {
        clearTimeout(noteUpdateDebounceRef.current[noteId]);
      }

      // Set new debounce timeout (300ms like SocketService)
      noteUpdateDebounceRef.current[noteId] = setTimeout(() => {
        socket.emit('note-update', {
          noteId,
          workspaceId,
          userId: currentUser?._id,
          content,
          updatedAt: new Date(),
        });

        console.log('📤 Emitted note update (debounced):', {
          noteId,
          userId: currentUser?._id,
        });

        // Clean up timeout reference
        delete noteUpdateDebounceRef.current[noteId];
      }, updateDelayMs);
    },
    [socket, workspaceId, currentUser]
  );

  /**
   * Register listener for specific note updates
   */
  const onNoteUpdate = useCallback(
    (noteId: string, callback: (data: NoteUpdatePayload) => void) => {
      // Store callback in ref - won't trigger re-render
      noteUpdateListenersRef.current[noteId] = callback;

      // Return cleanup function
      return () => {
        delete noteUpdateListenersRef.current[noteId];
      };
    },
    []
  );

  return {
    socket,
    isConnected,
    emitNoteUpdate,
    onNoteUpdate,
  };
};
