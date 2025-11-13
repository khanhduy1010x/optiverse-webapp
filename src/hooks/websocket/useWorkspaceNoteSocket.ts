import { useEffect, useRef, useCallback } from 'react';
import SocketService from '../../services/socket.service';

interface UseWorkspaceNoteSocketProps {
  noteId: string | null;
  workspaceId: string | null;
}

/**
 * Hook for workspace notes - wraps SocketService but with per-note listener
 * Fixes race condition by not relying on global currentNoteId
 */
export const useWorkspaceNoteSocket = ({
  noteId,
  workspaceId,
}: UseWorkspaceNoteSocketProps) => {
  const noteListenerRef = useRef<((data: any) => void) | null>(null);
  const currentNoteIdRef = useRef<string | null>(null);

  // Join note room and setup listener
  useEffect(() => {
    if (!noteId || !workspaceId) return;

    // Update current note tracking
    currentNoteIdRef.current = noteId;

    // Join note room via SocketService
    SocketService.joinNote(noteId);

    // Create listener that checks if update is for current note
    const handleNoteUpdate = (data: any) => {
      // Only process if this update is for the current note
      if (data.noteId === currentNoteIdRef.current) {
        console.log('📥 Workspace note update (per-note listener):', {
          noteId: data.noteId,
          currentNote: currentNoteIdRef.current,
        });
        if (noteListenerRef.current) {
          noteListenerRef.current(data);
        }
      }
    };

    // Register listener
    SocketService.on('note_update', handleNoteUpdate);

    return () => {
      // Cleanup: unregister listener and leave room
      SocketService.off('note_update', handleNoteUpdate);
      SocketService.leaveNote(noteId);
      currentNoteIdRef.current = null;
    };
  }, [noteId, workspaceId]);

  /**
   * Register callback for note updates - can be called multiple times
   */
  const onNoteUpdate = useCallback((callback: (data: any) => void) => {
    noteListenerRef.current = callback;

    // Return unsubscribe function
    return () => {
      noteListenerRef.current = null;
    };
  }, []);

  /**
   * Emit note update - uses SocketService.updateNote with debounce
   */
  const emitNoteUpdate = useCallback((noteId: string, content: string) => {
    // SocketService.updateNote internally manages currentNoteId
    // But we already joined this note, so it should work
    SocketService.updateNote(content);
  }, []);

  return {
    onNoteUpdate,
    emitNoteUpdate,
  };
};
