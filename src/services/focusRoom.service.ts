import { ApiResponse } from '../types/api/api.interface';
import api from './api.service';

export interface CreateFocusRoomRequest {
  title: string;
  type: 'public' | 'private';
  accessMode: 'free' | 'approval' | 'password';
  password?: string;
}

export interface JoinRoomRequest {
  roomId: string;
  password?: string;
}

export interface ApproveJoinRequest {
  roomId: string;
  userId: string;
  approved: boolean;
}

export interface User {
  user_id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
}
export interface FocusRoomResponse {
  _id: string;
  name: string;
  roomId: string;
  type: 'public' | 'private';
  accessMode: 'free' | 'approval' | 'password';
  description?: string;
  hostUser: User | null;
  participants: string[];
  visible: boolean;
  maxParticipants?: number;
  startAt?: string | null;
  endAt?: string | null;
  category?: string;
  isLocked: boolean;
  approvalQueue: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

class FocusRoomService {
  private basePath = '/productivity/focus-room';

  /** 🔹 Lấy danh sách tất cả phòng công khai */
  public async getPublicRooms(): Promise<FocusRoomResponse[]> {
    try {
      const response = await api.get<ApiResponse<FocusRoomResponse[]>>(
        `${this.basePath}/public`
      );
      return response.data || [];
    } catch (error) {
      console.error('⚠️ Lỗi khi lấy danh sách phòng:', error);
      return [];
    }
  }

  /** 🔹 Tạo phòng mới */
  public async createRoom(payload: CreateFocusRoomRequest): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.basePath}/create`,
        payload
      );
      return response.data.data;
    } catch (error) {
      console.error('⚠️ Lỗi khi tạo phòng:', error);
      throw error;
    }
  }

  /** 🔹 Gửi yêu cầu tham gia phòng */
  public async joinRoom(payload: JoinRoomRequest): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.basePath}/${payload.roomId}/request-join`,
        payload
      );
      
      return response.data.data;
    } catch (error) {
      console.error('⚠️ Lỗi khi tham gia phòng:', error);
      throw error;
    }
  }

  /** 🔹 Duyệt yêu cầu tham gia */
  public async approveJoin(payload: ApproveJoinRequest): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.basePath}/approve`,
        payload
      );
      return response.data.data;
    } catch (error) {
      console.error('⚠️ Lỗi khi duyệt yêu cầu:', error);
      throw error;
    }
  }

  /** 🔹 Lấy danh sách participant của phòng */
  public async getParticipants(roomId: string): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>(
        `${this.basePath}/${roomId}/participants`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('⚠️ Lỗi khi lấy danh sách participants:', error);
      return [];
    }
  }

  /** 🔹 Xoá phòng */
  public async deleteRoom(roomId: string): Promise<any> {
    try {
      const response = await api.delete<ApiResponse<any>>(
        `${this.basePath}/${roomId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('⚠️ Lỗi khi xoá phòng:', error);
      throw error;
    }
  }
}

export default new FocusRoomService();
