import { ApiResponse } from '../types/api/api.interface';
import { UserResponse } from '../types/auth/auth.types';
import api from './api.service';

class ChatService {
  /**
   * Lấy thông tin nhiều người dùng theo danh sách ID
   * Sử dụng API từ core-service
   */
  async getUsersByIds(userIds: string[]): Promise<UserResponse[]> {
    try {
      const response = await api.post<ApiResponse<UserResponse[]>>(
        '/core/auth/get-users-by-ids',
        { userIds }
      );
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching users by IDs:', error);
      return [];
    }
  }
}

export default new ChatService(); 