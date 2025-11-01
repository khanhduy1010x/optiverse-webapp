import { ApiResponse } from '../types/api/api.interface';
import api from './api.service';

export interface JoinRequest {
  _id: string;
  room_id: string;
  user_id: string;
  user?: {
    user_id: string;
    full_name: string;
    avatar_url?: string;
    email?: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

class LiveRoomJoinRequestService {
  private basePath = '/productivity/focus-room';

  public async getPendingRequests(roomId: string): Promise<JoinRequest[]> {
    try {
      const response = await api.get<ApiResponse<JoinRequest[]>>(
        `${this.basePath}/${roomId}/join-requests/pending`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      return [];
    }
  }

  public async approveRequest(roomId: string, userId: string): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.basePath}/${roomId}/join-requests/approve`,
        { user_id: userId }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error approving request:', error);
      throw error;
    }
  }

  public async rejectRequest(roomId: string, userId: string): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.basePath}/${roomId}/join-requests/reject`,
        { user_id: userId }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }
  }
}

export default new LiveRoomJoinRequestService();
