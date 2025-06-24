import api from './api.service';
import { ApiResponse } from '../types/api/api.interface';

class NotificationService {
  // Gửi thông báo nhắc nhở cho task quá hạn
  async sendTaskOverdueNotification(taskId: string, taskTitle: string) {
    try {
      const response = await api.post<ApiResponse<any>>('/notification', {
        title: 'Task Overdue Reminder',
        content: `Your task "${taskTitle}" is overdue!`,
        type: 'task_overdue',
        metadata: {
          taskId
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending task overdue notification:', error);
      throw error;
    }
  }

  // Lấy danh sách thông báo của người dùng hiện tại
  async getUserNotifications() {
    try {
      const response = await api.get<ApiResponse<any>>('/notification/user');
      return response.data.data?.notifications || [];
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  }

  // Đánh dấu thông báo là đã đọc
  async markNotificationAsRead(notificationId: string) {
    try {
      const response = await api.put<ApiResponse<any>>(`/notification/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Xóa thông báo
  async deleteNotification(notificationId: string) {
    try {
      const response = await api.delete<ApiResponse<any>>(`/notification/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}

export default new NotificationService(); 