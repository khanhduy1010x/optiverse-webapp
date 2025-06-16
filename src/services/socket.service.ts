import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private currentNoteId: string | null = null;
  private listeners: Map<string, Array<(data: any) => void>> = new Map();
  private updateTimeout: NodeJS.Timeout | null = null;
  private updateDelay = 300;
  private typingTimeout: NodeJS.Timeout | null = null;
  private typingDelay = 1000;

  public connect(): void {
    if (this.socket) return;

    this.socket = io('https://api.optiverse.io.vn/', {
      path: '/productivity/socket.io',
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

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
      console.log('Folder deleted event received:', data);
      this.notifyListeners('folder_deleted', data);
    });

    this.socket.on('folder_structure_changed', () => {
      console.log('Folder structure changed event received');
      this.notifyListeners('folder_structure_changed', {});
    });
  }

  public getUserId(): string | null {
    return this.socket?.id || null;
  }

  public disconnect(): void {
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

    this.socket.emit('note_deleted', { noteId });
  }

  public emitNoteRenamed(noteId: string, newTitle: string): void {
    if (!this.socket) return;

    this.socket.emit('note_renamed', { noteId, newTitle });
  }

  public emitFolderStructureChanged(): void {
    if (!this.socket) return;

    this.socket.emit('folder_structure_changed');
    console.log('Emitted folder_structure_changed event');
  }

  public emitFolderDeleted(folderId: string): void {
    if (!this.socket) return;

    this.socket.emit('folder_deleted', { folderId });
    console.log('Emitted folder_deleted event for:', folderId);
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
}

export default new SocketService();
