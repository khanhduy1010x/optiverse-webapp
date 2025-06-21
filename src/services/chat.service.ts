import { ApiResponse } from '../types/api/api.interface';
import { UserResponse } from '../types/auth/auth.types';
import api from './api.service';
import { ref, update, get } from 'firebase/database';
import { db } from '../firebase';

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

  /**
   * Cập nhật theme cho hội thoại
   */
  async updateConversationTheme(
    conversationId: string,
    theme: {
      backgroundUrl?: string;
      backgroundColor?: string;
      textColor?: string;
    }
  ) {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      const conversationRef = ref(db, `conversations/${conversationId}`);

      await update(conversationRef, {
        theme: {
          ...theme,
          updatedAt: Date.now(),
          updatedBy: userId,
        },
      });

      return true;
    } catch (error) {
      console.error('Error updating conversation theme:', error);
      return false;
    }
  }

  /**
   * Tải lên hình ảnh làm theme cho hội thoại
   */
  async uploadThemeImage(conversationId: string, file: File) {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      // Tạo FormData để gửi file
      const formData = new FormData();
      formData.append('file', file);

      // Gọi API để tải lên hình ảnh
      const response = await api.post<ApiResponse<string>>(
        '/core/profile/chat/theme',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Lấy URL của hình ảnh từ response
      const downloadURL = response.data.data;

      // Cập nhật theme cho hội thoại
      await this.updateConversationTheme(conversationId, {
        backgroundUrl: downloadURL,
      });

      return downloadURL;
    } catch (error) {
      console.error('Error uploading theme image:', error);
      throw error;
    }
  }

  /**
   * Lấy theme của hội thoại
   */
  async getConversationTheme(conversationId: string) {
    try {
      const conversationRef = ref(db, `conversations/${conversationId}`);
      const snapshot = await get(conversationRef);

      if (snapshot.exists()) {
        const conversation = snapshot.val();
        return conversation.theme || null;
      }

      return null;
    } catch (error) {
      console.error('Error getting conversation theme:', error);
      return null;
    }
  }
}

export default new ChatService();
