import { io, Socket } from 'socket.io-client';

// Thêm interface để định nghĩa kiểu dữ liệu cho vị trí con trỏ
interface CursorPosition {
  index: number;
  length: number;
}

class SocketService {
  private socket: Socket | null = null;
  private currentNoteId: string | null = null;
  private listeners: Map<string, Array<(data: any) => void>> = new Map();
  private updateTimeout: NodeJS.Timeout | null = null;
  private updateDelay = 300; // Độ trễ 300ms
  private typingTimeout: NodeJS.Timeout | null = null;
  private typingDelay = 1000; // 1 giây
  private cursorUpdateTimeout: NodeJS.Timeout | null = null;
  private cursorUpdateDelay = 100; // Độ trễ 100ms cho cập nhật con trỏ

  // Khởi tạo kết nối socket
  public connect(): void {
    if (this.socket) return;

    this.socket = io('http://localhost:81', {
      path: '/productivity/socket.io',
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // Lắng nghe sự kiện note_update từ server
    this.socket.on('note_update', data => {
      if (data.noteId === this.currentNoteId) {
        this.notifyListeners('note_update', data);
      }
    });

    // Lắng nghe sự kiện lỗi từ server
    this.socket.on('note_error', data => {
      console.error('Note error:', data);
      this.notifyListeners('note_error', data);
    });

    // Lắng nghe sự kiện typing
    this.socket.on('typing', data => {
      if (data.noteId === this.currentNoteId) {
        this.notifyListeners('typing', data);
      }
    });

    // Lắng nghe sự kiện stop_typing
    this.socket.on('stop_typing', data => {
      if (data.noteId === this.currentNoteId) {
        this.notifyListeners('stop_typing', data);
      }
    });

    // Thêm lắng nghe sự kiện user_cursors
    this.socket.on('user_cursors', data => {
      if (data.noteId === this.currentNoteId) {
        this.notifyListeners('user_cursors', data);
      }
    });

    // Thêm lắng nghe sự kiện user_left
    this.socket.on('user_left', data => {
      if (data.noteId === this.currentNoteId) {
        this.notifyListeners('user_left', data);
      }
    });
  }

  // Lấy ID của người dùng hiện tại
  public getUserId(): string | null {
    return this.socket?.id || null;
  }

  // Ngắt kết nối socket
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

    if (this.cursorUpdateTimeout) {
      clearTimeout(this.cursorUpdateTimeout);
      this.cursorUpdateTimeout = null;
    }
  }

  // Tham gia vào phòng của note
  public joinNote(noteId: string): void {
    if (!this.socket) {
      this.connect();
    }

    // Nếu đang ở phòng khác, rời phòng cũ trước
    if (this.currentNoteId && this.currentNoteId !== noteId) {
      this.leaveNote(this.currentNoteId);
    }

    // Tham gia phòng mới
    this.currentNoteId = noteId;
    this.socket?.emit('join_note', { noteId });
    console.log('Joined note room:', noteId);
  }

  // Rời khỏi phòng của note
  public leaveNote(noteId: string): void {
    if (!this.socket) return;

    // Gửi sự kiện rời phòng
    this.socket.emit('leave_note', { noteId });
    console.log('Left note room:', noteId);

    // Xóa noteId hiện tại nếu là phòng đang tham gia
    if (this.currentNoteId === noteId) {
      this.currentNoteId = null;
    }
  }

  // Gửi cập nhật nội dung note với debounce
  public updateNote(content: string): void {
    if (!this.socket || !this.currentNoteId) return;

    // Gửi sự kiện typing
    this.sendTypingStatus();

    // Hủy timeout cũ nếu có
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    // Tạo timeout mới
    this.updateTimeout = setTimeout(() => {
      this.socket?.emit('note_update', {
        noteId: this.currentNoteId,
        content,
      });
      this.updateTimeout = null;
    }, this.updateDelay);
  }

  // Gửi cập nhật ngay lập tức, không debounce
  public updateNoteImmediate(content: string): void {
    if (!this.socket || !this.currentNoteId) return;

    // Hủy timeout cũ nếu có
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = null;
    }

    // Gửi ngay lập tức
    this.socket.emit('note_update', {
      noteId: this.currentNoteId,
      content,
    });
  }

  // Gửi trạng thái đang gõ
  private sendTypingStatus(): void {
    if (!this.socket || !this.currentNoteId) return;

    // Gửi sự kiện typing
    this.socket.emit('typing', {
      noteId: this.currentNoteId,
      userId: this.socket.id,
    });

    // Đặt lại timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    // Sau 1 giây không gõ, gửi sự kiện stop_typing
    this.typingTimeout = setTimeout(() => {
      this.socket?.emit('stop_typing', {
        noteId: this.currentNoteId,
        userId: this.socket.id,
      });
      this.typingTimeout = null;
    }, this.typingDelay);
  }

  // Thêm phương thức để gửi vị trí con trỏ
  public updateCursorPosition(
    position: CursorPosition,
    userName: string = 'User'
  ): void {
    if (!this.socket || !this.currentNoteId) return;

    // Hủy timeout cũ nếu có
    if (this.cursorUpdateTimeout) {
      clearTimeout(this.cursorUpdateTimeout);
    }

    // Tạo timeout mới để giảm số lượng cập nhật
    this.cursorUpdateTimeout = setTimeout(() => {
      this.socket?.emit('cursor_position', {
        noteId: this.currentNoteId,
        position,
        userName,
      });
      this.cursorUpdateTimeout = null;
    }, this.cursorUpdateDelay);
  }

  // Đăng ký lắng nghe sự kiện
  public on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  // Hủy đăng ký lắng nghe sự kiện
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

  // Thông báo cho các listeners khi có sự kiện
  private notifyListeners(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

// Singleton instance
export const socketService = new SocketService();
