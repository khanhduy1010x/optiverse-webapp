import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '../config/env.config';

class SocketService {
  private socket: Socket | null = null;
  private currentNoteId: string | null = null;
  private currentUserId: string | null = null;
  private activeNoteIds: Set<string> = new Set(); // Track multiple active notes
  private listeners: Map<string, Array<(data: any) => void>> = new Map();
  private updateTimeout: NodeJS.Timeout | null = null;
  private updateDelays: Map<string, NodeJS.Timeout> = new Map(); // Per-note debounce
  private updateDelay = 300;
  private typingTimeout: NodeJS.Timeout | null = null;
  private typingDelay = 1000;
  private isViewingSharedItems = false;

  public connect(): void {
    if (this.socket) return;

    this.currentUserId = localStorage.getItem('user_id');

    this.socket = io(`${BASE_URL}`, {
      path: '/productivity/socket.io',
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      if (this.currentUserId) {
        this.joinUserRoom(this.currentUserId);
      }
    });

    this.socket.on('disconnect', () => {});

    this.socket.on('note_update', data => {
      // Notify ALL active notes, not just currentNoteId (for workspace multi-note)
      if (
        this.activeNoteIds.has(data.noteId) ||
        data.noteId === this.currentNoteId
      ) {
        this.notifyListeners('note_update', data);
      }
    });

    this.socket.on('note_error', data => {
      console.error('Note error:', data);
      this.notifyListeners('note_error', data);
    });

    this.socket.on('typing', data => {
      if (
        this.activeNoteIds.has(data.noteId) ||
        data.noteId === this.currentNoteId
      ) {
        this.notifyListeners('typing', data);
      }
    });

    this.socket.on('stop_typing', data => {
      if (
        this.activeNoteIds.has(data.noteId) ||
        data.noteId === this.currentNoteId
      ) {
        this.notifyListeners('stop_typing', data);
      }
    });

    this.socket.on('note_deleted', data => {
      this.notifyListeners('note_deleted', data);
    });

    this.socket.on('note_renamed', data => {
      this.notifyListeners('note_renamed', data);
    });

    this.socket.on('folder_deleted', data => {
      this.notifyListeners('folder_deleted', data);
    });

    this.socket.on('folder_renamed', data => {
      this.notifyListeners('folder_renamed', data);
    });

    this.socket.on('folder_structure_changed', data => {
      this.notifyListenersWithContext(
        'folder_structure_changed',
        data,
        this.isViewingSharedItems
      );
    });

    this.socket.on('permission_changed', data => {
      this.notifyListeners('permission_changed', data);
      this.notifyListenersWithContext(
        'folder_structure_changed',
        data,
        this.isViewingSharedItems
      );
    });

    this.socket.on('note_shared_with_user', data => {
      const currentId = this.getCurrentUserId();
      if (data.userId === currentId) {
      }
    });

    this.socket.on('folder_shared_with_user', data => {
      const currentId = this.getCurrentUserId();
      if (data.userId === currentId) {
      }
    });
  }

  public getUserId(): string | null {
    return this.socket?.id || null;
  }

  public getCurrentUserId(): string | null {
    this.currentUserId = localStorage.getItem('user_id');
    return this.currentUserId;
  }

  public setCurrentUserId(userId: string): void {
    localStorage.setItem('user_id', userId);
    this.currentUserId = userId;
    if (this.socket?.connected) {
      this.joinUserRoom(userId);
    }
  }

  public joinUserRoom(userId: string): void {
    if (!this.socket) {
      this.connect();
    }

    this.socket?.emit('join_user_room', { userId });
  }

  public leaveUserRoom(userId: string): void {
    if (!this.socket) return;

    this.socket.emit('leave_user_room', { userId });
  }

  public joinWorkspaceRoom(workspaceId: string, userId: string): void {
    if (!this.socket) {
      this.connect();
    }

    // Join workspace room in format expected by backend: `workspace:${workspaceId}`
    const roomName = `workspace:${workspaceId}`;

    // Listen for join confirmation
    this.socket?.once('join_room', response => {
      console.log(`✅ Room join confirmed:`, response);
    });

    this.socket?.emit('join_room', { room: roomName });
    console.log(`🏢 Attempting to join workspace room: ${roomName}`);
  }

  public leaveWorkspaceRoom(workspaceId: string): void {
    if (!this.socket) return;

    // Leave workspace room in format expected by backend
    const roomName = `workspace:${workspaceId}`;
    this.socket.emit('leave_room', { room: roomName });

    console.log(`👋 Left workspace room: ${roomName}`);
  }

  public disconnect(): void {
    const userId = this.getCurrentUserId();
    if (userId) {
      this.leaveUserRoom(userId);
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    // Cleanup all pending debounce timeouts
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = null;
    }

    this.updateDelays.forEach(timeout => clearTimeout(timeout));
    this.updateDelays.clear();

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }

    this.activeNoteIds.clear();
  }

  public joinNote(noteId: string): void {
    if (!this.socket) {
      this.connect();
    }

    if (this.currentNoteId && this.currentNoteId !== noteId) {
      this.leaveNote(this.currentNoteId);
    }

    this.currentNoteId = noteId;
    this.activeNoteIds.add(noteId); // Track as active
    this.socket?.emit('join_note', { noteId });

    console.log('📌 Joined note:', {
      noteId,
      activeNotes: Array.from(this.activeNoteIds),
    });
  }

  public leaveNote(noteId: string): void {
    if (!this.socket) return;

    this.socket.emit('leave_note', { noteId });
    this.activeNoteIds.delete(noteId); // Remove from active

    if (this.currentNoteId === noteId) {
      this.currentNoteId = null;
    }

    console.log('👋 Left note:', {
      noteId,
      activeNotes: Array.from(this.activeNoteIds),
    });
  }

  public updateNote(content: string): void {
    if (!this.socket || !this.currentNoteId) return;

    this.sendTypingStatus();

    const noteId = this.currentNoteId;

    // Per-note debounce: clear existing timeout for this note
    if (this.updateDelays.has(noteId)) {
      clearTimeout(this.updateDelays.get(noteId)!);
    }

    // Set new debounced update for this note
    const timeout = setTimeout(() => {
      this.socket?.emit('note_update', {
        noteId,
        content,
      });
      this.updateDelays.delete(noteId);
    }, this.updateDelay);

    this.updateDelays.set(noteId, timeout);

    console.log('⏱️ Note update debounced:', {
      noteId,
      delay: this.updateDelay,
    });
  }

  public updateNoteImmediate(content: string): void {
    if (!this.socket || !this.currentNoteId) return;

    const noteId = this.currentNoteId;

    // Clear pending debounce for this note
    if (this.updateDelays.has(noteId)) {
      clearTimeout(this.updateDelays.get(noteId)!);
      this.updateDelays.delete(noteId);
    }

    this.sendTypingStatus();

    this.socket.emit('note_update', {
      noteId,
      content,
    });

    console.log('⚡ Note update immediate:', { noteId });
  }

  public emitNoteDeleted(noteId: string, workspaceId?: string): void {
    if (!this.socket) return;

    const userId = this.getCurrentUserId();
    if (!userId) return;

    console.log(
      `Dòng 200 File socket.service.ts - Đã emit sự kiện note_deleted (noteId: ${noteId})`
    );
    this.socket.emit('note_deleted', {
      noteId,
      userId,
      workspaceId,
    });
  }

  public emitNoteRenamed(
    noteId: string,
    newTitle: string,
    workspaceId?: string
  ): void {
    if (!this.socket) return;

    const userId = this.getCurrentUserId();
    if (!userId) return;

    console.log(
      `Dòng 212 File socket.service.ts - Đã emit sự kiện note_renamed (noteId: ${noteId}, newTitle: ${newTitle})`
    );
    this.socket.emit('note_renamed', {
      noteId,
      newTitle,
      userId,
      workspaceId,
    });
  }

  public emitFolderStructureChanged(): void {
    if (!this.socket) return;

    const userId = this.getCurrentUserId();
    if (!userId) return;

    console.log(
      `Dòng 225 File socket.service.ts - Đã emit sự kiện folder_structure_changed`
    );
    this.socket.emit('folder_structure_changed', {
      userId,
    });
  }

  public emitFolderDeleted(folderId: string): void {
    if (!this.socket) {
      this.connect();
    }

    const userId = this.getCurrentUserId();
    if (!userId || !this.socket) return;

    console.log(
      `Dòng 238 File socket.service.ts - Đã emit sự kiện folder_deleted (folderId: ${folderId})`
    );
    this.socket.emit('folder_deleted', {
      folderId,
      userId,
    });
  }

  public emitFolderRenamed(folderId: string, newName: string): void {
    if (!this.socket) {
      this.connect();
    }

    const userId = this.getCurrentUserId();
    if (!userId || !this.socket) return;

    console.log(
      `Dòng 251 File socket.service.ts - Đã emit sự kiện folder_renamed (folderId: ${folderId}, newName: ${newName})`
    );
    this.socket.emit('folder_renamed', {
      folderId,
      newName,
      userId,
    });
  }

  public emitNoteShared(noteId: string, sharedWithUserId: string): void {
    if (!this.socket) return;

    const userId = this.getCurrentUserId();
    if (!userId) return;

    this.socket.emit('note_shared', {
      noteId,
      sharedWithUserId,
      userId,
    });
  }

  public emitFolderShared(folderId: string, sharedWithUserId: string): void {
    if (!this.socket) {
      this.connect();
    }

    const userId = this.getCurrentUserId();
    if (!userId || !this.socket) return;

    this.socket.emit('folder_shared', {
      folderId,
      sharedWithUserId,
      userId,
    });
  }

  public setViewingSharedItems(isViewing: boolean): void {
    if (!this.socket) {
      this.connect();
    }

    this.isViewingSharedItems = isViewing;

    const userId = this.getCurrentUserId();
    if (!userId || !this.socket) return;

    this.socket.emit('viewing_shared_items', {
      userId,
      isViewing,
    });
  }

  private sendTypingStatus(): void {
    if (!this.socket || !this.currentNoteId) return;

    this.socket.emit('typing', {
      noteId: this.currentNoteId,
      userId: this.socket.id,
    });

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    this.typingTimeout = setTimeout(() => {
      this.socket?.emit('stop_typing', {
        noteId: this.currentNoteId,
        userId: this.socket.id,
      });
      this.typingTimeout = null;
    }, this.typingDelay);
  }

  public on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  public off(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private notifyListeners(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  private notifyListenersWithContext(
    event: string,
    data: any,
    isSharedView: boolean
  ): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        callback({ ...data, isSharedView });
      });
    }
  }

  public emitNoteUserRemoved(noteId: string, removedUserId: string): void {
    if (!this.socket) return;
    const userId = this.getCurrentUserId();
    if (!userId) return;
    this.socket.emit('note_user_removed', {
      noteId,
      removedUserId,
      userId,
    });
  }

  public emitFolderUserRemoved(folderId: string, removedUserId: string): void {
    if (!this.socket) return;
    const userId = this.getCurrentUserId();
    if (!userId) return;
    this.socket.emit('folder_user_removed', {
      folderId,
      removedUserId,
      userId,
    });
  }
}

export default new SocketService();
