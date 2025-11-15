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
   * Xóa mềm conversation - chỉ ẩn conversation đối với user hiện tại
   */
  async softDeleteConversation(conversationId: string) {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      const conversationRef = ref(db, `conversations/${conversationId}`);
      
      const timestamp = Date.now();
      // Cập nhật cả deletedBy (ẩn khỏi list) và messagesDeletedAt (filter messages)
      await update(conversationRef, {
        [`deletedBy/${userId}`]: timestamp,
        [`messagesDeletedAt/${userId}`]: timestamp
      });

      return true;
    } catch (error) {
      console.error('Error soft deleting conversation:', error);
      return false;
    }
  }

  /**
   * Khôi phục conversation đã bị xóa mềm
   */
  async restoreConversation(conversationId: string) {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      const conversationRef = ref(db, `conversations/${conversationId}`);
      
      // Xóa field deletedBy cho user hiện tại
      await update(conversationRef, {
        [`deletedBy/${userId}`]: null
      });

      return true;
    } catch (error) {
      console.error('Error restoring conversation:', error);
      return false;
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

  /**
   * Cập nhật theme cho group conversation
   */
  async updateGroupConversationTheme(groupId: string, themeData: {
    backgroundColor?: string;
    backgroundUrl?: string;
    textColor?: string;
  }) {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      const groupRef = ref(db, `groupConversations/${groupId}`);
      await update(groupRef, {
        theme: {
          ...themeData,
          updatedAt: Date.now(),
          updatedBy: userId,
        },
      });

      return true;
    } catch (error) {
      console.error('Error updating group conversation theme:', error);
      return false;
    }
  }

  /**
   * Tải lên hình ảnh làm theme cho group conversation
   */
  async uploadGroupThemeImage(groupId: string, file: File) {
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

      // Cập nhật theme cho group conversation
      await this.updateGroupConversationTheme(groupId, {
        backgroundUrl: downloadURL,
      });

      return downloadURL;
    } catch (error) {
      console.error('Error uploading group theme image:', error);
      throw error;
    }
  }

  /**
   * Lấy theme của group conversation
   */
  async getGroupConversationTheme(groupId: string) {
    try {
      const groupRef = ref(db, `groupConversations/${groupId}`);
      const snapshot = await get(groupRef);

      if (snapshot.exists()) {
        const group = snapshot.val();
        return group.theme || null;
      }

      return null;
    } catch (error) {
      console.error('Error getting group conversation theme:', error);
      return null;
    }
  }

  /**
   * Tải lên hình ảnh cho tin nhắn
   * @param file File hình ảnh cần tải lên
   * @returns URL của hình ảnh sau khi tải lên
   */
  async uploadMessageImage(file: File): Promise<string> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      // Tạo FormData để gửi file
      const formData = new FormData();
      formData.append('file', file);

      // Sử dụng cùng endpoint với theme nhưng có thể thay đổi sau này nếu cần
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
      return downloadURL;
    } catch (error) {
      console.error('Error uploading message image:', error);
      throw error;
    }
  }

  /**
   * Tải lên nhiều hình ảnh cho tin nhắn
   * @param files Danh sách file hình ảnh cần tải lên
   * @returns Danh sách URL của các hình ảnh sau khi tải lên
   */
  async uploadMessageImages(files: File[]): Promise<string[]> {
    try {
      const uploadPromises = files.map(file => this.uploadMessageImage(file));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading multiple message images:', error);
      throw error;
    }
  }

  /**
   * Tải lên file âm thanh cho tin nhắn thoại
   * @param file File âm thanh cần tải lên
   * @returns URL của file âm thanh sau khi tải lên và thời lượng
   */
  async uploadAudioMessage(
    file: File
  ): Promise<{ url: string; duration: number }> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      // Tạo FormData để gửi file
      const formData = new FormData();
      formData.append('file', file);

      // Sử dụng cùng endpoint với theme
      const response = await api.post<ApiResponse<string>>(
        '/core/profile/chat/theme',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Lấy URL của file âm thanh từ response
      const downloadURL = response.data.data;

      // Lấy thời lượng của file âm thanh
      const duration = await this.getAudioDuration(file);

      return {
        url: downloadURL,
        duration,
      };
    } catch (error) {
      console.error('Error uploading audio message:', error);
      throw error;
    }
  }

  /**
   * Lấy thời lượng của file âm thanh
   * @param file File âm thanh
   * @returns Thời lượng tính bằng giây
   */
  private getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);

      audio.addEventListener('loadedmetadata', () => {
        // Giải phóng URL object
        URL.revokeObjectURL(audio.src);
        resolve(audio.duration);
      });

      audio.addEventListener('error', err => {
        URL.revokeObjectURL(audio.src);
        reject(err);
      });
    });
  }
}

export default new ChatService();
