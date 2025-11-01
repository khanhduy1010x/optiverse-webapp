import { useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';

type NoteEvent = {
  _id: string;
  title: string;
  content?: string;
  live_room_id: string;
  user_id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

type UseNoteRoomEventsOptions = {
  socket: Socket | null;
  roomId: string;
  isOpen: boolean;
  onNoteCreated?: (note: NoteEvent) => void;
  onNoteUpdated?: (note: NoteEvent) => void;
  onNoteDeleted?: (noteId: string) => void;
  onNoteRenamed?: (note: {
    _id: string;
    title: string;
    live_room_id: string;
  }) => void;
  onError?: (error: { error: string; message?: string }) => void;
};

/**
 * Hook để quản lý WebSocket events cho notes trong live room
 * - Join vào note-room khi panel mở
 * - Listen những events: noteCreated, noteUpdated, noteDeleted
 * - Leave room khi panel đóng
 */
export function useNoteRoomEvents({
  socket,
  roomId,
  isOpen,
  onNoteCreated,
  onNoteUpdated,
  onNoteDeleted,
  onNoteRenamed,
  onError,
}: UseNoteRoomEventsOptions) {
  const joinedRef = useRef(false);

  // 1️⃣ Join room khi panel mở, leave khi panel đóng
  useEffect(() => {
    if (!socket || !roomId || !isOpen) {
      // Leave room khi panel đóng
      if (joinedRef.current && socket && roomId) {
        console.log(`🚪 Leaving note room: note-room-${roomId}`);
        socket.emit('leaveNoteRoom', { live_room_id: roomId });
        joinedRef.current = false;
      }
      return;
    }

    // Join room khi panel mở
    if (!joinedRef.current) {
      console.log(`📌 Joining note room for room ${roomId}`);
      socket.emit('joinNoteRoom', { live_room_id: roomId });
      joinedRef.current = true;
    }
  }, [socket, roomId, isOpen]);

  // 2️⃣ Listen for noteCreated events
  useEffect(() => {
    if (!socket) return;

    const handleNoteCreated = (note: NoteEvent) => {
      console.log('📝 Note created event received:', note);
      onNoteCreated?.(note);
    };

    const handleNoteUpdated = (note: NoteEvent) => {
      console.log('✏️ Note updated event received:', note);
      onNoteUpdated?.(note);
    };

    const handleNoteDeleted = (data: { _id: string; live_room_id: string }) => {
      console.log('🗑️ Note deleted event received:', data);
      onNoteDeleted?.(data._id);
    };

    const handleNoteRenamed = (data: {
      _id: string;
      title: string;
      live_room_id: string;
    }) => {
      console.log('✏️ Note renamed event received:', data);
      onNoteRenamed?.(data);
    };

    const handleCreateError = (error: any) => {
      console.error('❌ Create note error:', error);
      onError?.(error);
    };

    const handleUpdateError = (error: any) => {
      console.error('❌ Update note error:', error);
      onError?.(error);
    };

    const handleDeleteError = (error: any) => {
      console.error('❌ Delete note error:', error);
      onError?.(error);
    };

    const handleRenameError = (error: any) => {
      console.error('❌ Rename note error:', error);
      onError?.(error);
    };

    // Register all listeners
    socket.on('noteCreated', handleNoteCreated);
    socket.on('noteUpdated', handleNoteUpdated);
    socket.on('noteDeleted', handleNoteDeleted);
    socket.on('noteRenamed', handleNoteRenamed);
    socket.on('createNoteInRoomError', handleCreateError);
    socket.on('updateNoteInRoomError', handleUpdateError);
    socket.on('deleteNoteInRoomError', handleDeleteError);
    socket.on('renameNoteInRoomError', handleRenameError);

    // Cleanup listeners
    return () => {
      socket.off('noteCreated', handleNoteCreated);
      socket.off('noteUpdated', handleNoteUpdated);
      socket.off('noteDeleted', handleNoteDeleted);
      socket.off('noteRenamed', handleNoteRenamed);
      socket.off('createNoteInRoomError', handleCreateError);
      socket.off('updateNoteInRoomError', handleUpdateError);
      socket.off('deleteNoteInRoomError', handleDeleteError);
      socket.off('renameNoteInRoomError', handleRenameError);
    };
  }, [
    socket,
    onNoteCreated,
    onNoteUpdated,
    onNoteDeleted,
    onNoteRenamed,
    onError,
  ]);

  // 3️⃣ Leave room on cleanup
  useEffect(() => {
    return () => {
      if (joinedRef.current && socket && roomId) {
        console.log(`🚪 Cleanup: Leaving note room ${roomId}`);
        socket.emit('leaveNoteRoom', { live_room_id: roomId });
        joinedRef.current = false;
      }
    };
  }, [socket, roomId]);
}

/**
 * Helper function để emit note events
 */
export function emitNoteEvent(
  socket: Socket | null,
  eventName: string,
  payload: any
) {
  if (!socket) {
    console.warn('❌ Socket not available');
    return;
  }
  socket.emit(eventName, payload);
}
