import { ApiResponse } from '../types/api/api.interface';
import api from './api.service';

export interface CreateLiveRoomRequest {
  name: string;
  workspace_id?: string | null;
  access_type: 'public' | 'private';
  password?: string;
  description?: string;
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
  workspace_id?: string;
  host_id: string;
  hostUser: User | null;
  room_sid: string;
  access_type: 'public' | 'private';
  have_password: boolean;
  userAccessStatus?: 'allowed' | 'pending' | 'password_required' | 'denied';
  description?: string;
  is_recording: boolean;
  record_count: number;
  created_at: string;
  updated_at: string;
  isOwner?: boolean;
  memberCount?: number;
}

class FocusRoomService {
  private basePath = '/productivity/focus-room';

  public async getPublicRooms(): Promise<FocusRoomResponse[]> {
    try {
      const response = await api.get<ApiResponse<FocusRoomResponse[]>>(
        `${this.basePath}/public`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching public rooms:', error);
      return [];
    }
  }

  public async getRoomsByWorkspace(
    workspaceId: string
  ): Promise<FocusRoomResponse[]> {
    try {
      const response = await api.get<ApiResponse<FocusRoomResponse[]>>(
        `${this.basePath}/workspace/${workspaceId}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching workspace rooms:', error);
      return [];
    }
  }

  public async createRoom(payload: CreateLiveRoomRequest): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.basePath}/create`,
        payload
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  public async joinRoom(payload: JoinRoomRequest): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.basePath}/${payload.roomId}/request-join`,
        payload
      );

      return response.data.data;
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  }

  public async approveJoin(payload: ApproveJoinRequest): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.basePath}/approve`,
        payload
      );
      return response.data.data;
    } catch (error) {
      console.error('Error approving join request:', error);
      throw error;
    }
  }

  public async getParticipants(roomId: string): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>(
        `${this.basePath}/${roomId}/participants`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  }

  public async deleteRoom(roomId: string): Promise<any> {
    try {
      const response = await api.delete<ApiResponse<any>>(
        `${this.basePath}/${roomId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  }

  public async kickMember(roomId: string, userId: string): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.basePath}/${roomId}/kick`,
        { user_id: userId }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error kicking member:', error);
      throw error;
    }
  }

  public async updateRoom(
    roomId: string,
    updateData: {
      name?: string;
      access_type?: 'public' | 'private';
      description?: string;
      new_password?: string;
      old_password?: string;
      remove_password?: boolean;
    }
  ): Promise<FocusRoomResponse> {
    try {
      const response = await api.put<ApiResponse<FocusRoomResponse>>(
        `${this.basePath}/${roomId}`,
        updateData
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  }
}

export default new FocusRoomService();
