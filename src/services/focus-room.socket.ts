import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '../config/env.config';

class FocusRoomSocket {
  private socket: Socket | null = null;
  private listeners: Map<string, Array<(data: any) => void>> = new Map();

  public connect(): void {
    if (this.socket) return;

    const userId = localStorage.getItem('user_id');
    if (!userId) {
      console.warn('⚠️ Không có user_id trong localStorage');
      return;
    }

    this.socket = io(`${BASE_URL}`, {
      path: '/productivity/focus/socket.io',
      transports: ['websocket'],
      query: { userId },
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket FocusRoom connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.warn('🔌 Socket FocusRoom disconnected');
    });

    // --- SOCKET EVENTS ---
    this.socket.on('room_created', data => this.notify('room_created', data));
    this.socket.on('room_updated', data => this.notify('room_updated', data));
    this.socket.on('join_request', data => this.notify('join_request', data));
    this.socket.on('join_approved', data => this.notify('join_approved', data));
    this.socket.on('user_joined', data => this.notify('user_joined', data));
    this.socket.on('user_left', data => this.notify('user_left', data));
  }

  public emitJoinRequest(roomId: string): void {
    this.socket?.emit('join_request', { roomId });
  }

  public emitApproveJoin(
    roomId: string,
    userId: string,
    approved: boolean
  ): void {
    this.socket?.emit('approve_request', { roomId, userId, approved });
  }

  public emitLeaveRoom(roomId: string): void {
    this.socket?.emit('leave_room', { roomId });
  }

  public emitCreateRoom(roomData: any): void {
    this.socket?.emit('create_room', roomData);
  }

  public on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)?.push(callback);
  }

  public off(event: string, callback: (data: any) => void): void {
    const callbacks = this.listeners.get(event);
    if (!callbacks) return;
    const index = callbacks.indexOf(callback);
    if (index !== -1) callbacks.splice(index, 1);
  }

  private notify(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) callbacks.forEach(cb => cb(data));
  }

  public disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.listeners.clear();
    console.log('🔌 Socket FocusRoom disconnected cleanly');
  }
}

export default new FocusRoomSocket();
