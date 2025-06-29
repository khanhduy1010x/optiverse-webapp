import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private currentNoteId: string | null = null;
  private currentUserId: string | null = null;
  private listeners: Map<string, Array<(data: any) => void>> = new Map();
  private updateTimeout: NodeJS.Timeout | null = null;
  private updateDelay = 300;
  private typingTimeout: NodeJS.Timeout | null = null;
  private typingDelay = 1000;
  private isViewingSharedItems = false;

  public connect(): void {
    if (this.socket) return;

    this.currentUserId = localStorage.getItem('user_id');

    this.socket = io(`${import.meta.env.VITE_URL_BASE}`, {
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
      if (data.noteId === this.currentNoteId) {
        this.notifyListeners('note_update', data);
      }
    });

    this.socket.on('note_error', data => {
      console.error('Note error:', data);
      this.notifyListeners('note_error', data);
    });

    this.socket.on('typing', data => {
      if (data.noteId === this.currentNoteId) {
        this.notifyListeners('typing', data);
      }
    });

    this.socket.on('stop_typing', data => {
      if (data.noteId === this.currentNoteId) {
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

    this.socket.on('folder_structure_changed', () => {
      this.notifyListenersWithContext(
        'folder_structure_changed',
        {},
        this.isViewingSharedItems
      );
    });

    this.socket.on('permission_changed', data => {
      this.notifyListeners('permission_changed', data);
      this.notifyListenersWithContext(
        'folder_structure_changed',
        {},
        this.isViewingSharedItems
      );
    });

    this.socket.on('note_shared_with_user', data => {
      const currentId = this.getCurrentUserId();
      if (data.userId === currentId) {
        this.notifyListenersWithContext(
          'folder_structure_changed',
          {},
          this.isViewingSharedItems
        );
      }
    });

    this.socket.on('folder_shared_with_user', data => {
      const currentId = this.getCurrentUserId();
      if (data.userId === currentId) {
        this.notifyListenersWithContext(
          'folder_structure_changed',
          {},
          this.isViewingSharedItems
        );
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

  public disconnect(): void {
    const userId = this.getCurrentUserId();
    if (userId) {
      this.leaveUserRoom(userId);
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = null;
    }

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }
  }

  public joinNote(noteId: string): void {
    if (!this.socket) {
      this.connect();
    }

    if (this.currentNoteId && this.currentNoteId !== noteId) {
      this.leaveNote(this.currentNoteId);
    }

    this.currentNoteId = noteId;
    this.socket?.emit('join_note', { noteId });
  }

  public leaveNote(noteId: string): void {
    if (!this.socket) return;

    this.socket.emit('leave_note', { noteId });

    if (this.currentNoteId === noteId) {
      this.currentNoteId = null;
    }
  }

  public updateNote(content: string): void {
    if (!this.socket || !this.currentNoteId) return;

    this.sendTypingStatus();

    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = setTimeout(() => {
      this.socket?.emit('note_update', {
        noteId: this.currentNoteId,
        content,
      });
      this.updateTimeout = null;
    }, this.updateDelay);
  }

  public updateNoteImmediate(content: string): void {
    if (!this.socket || !this.currentNoteId) return;

    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = null;
    }

    this.sendTypingStatus();

    this.socket.emit('note_update', {
      noteId: this.currentNoteId,
      content,
    });
  }

  public emitNoteDeleted(noteId: string): void {
    if (!this.socket) return;

    const userId = this.getCurrentUserId();
    if (!userId) return;

    this.socket.emit('note_deleted', {
      noteId,
      userId,
    });
  }

  public emitNoteRenamed(noteId: string, newTitle: string): void {
    if (!this.socket) return;

    const userId = this.getCurrentUserId();
    if (!userId) return;

    this.socket.emit('note_renamed', {
      noteId,
      newTitle,
      userId,
    });
  }

  public emitFolderStructureChanged(): void {
    if (!this.socket) return;

    const userId = this.getCurrentUserId();
    if (!userId) return;

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
}

export default new SocketService();
