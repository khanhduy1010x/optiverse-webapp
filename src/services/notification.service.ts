import api from './api.service';
import { ApiResponse } from '../types/api/api.interface';

class NotificationService {
  // Gửi thông báo nhắc nhở cho task quá hạn
  async sendTaskOverdueNotification(taskId: string, taskTitle: string) {
    // try {
    //   const response = await api.post<ApiResponse<any>>('/notification', {
    //     title: 'Task Overdue Reminder',
    //     content: `Your task "${taskTitle}" is overdue!`,
    //     type: 'task_overdue',
    //     metadata: {
    //       taskId,
    //     },
    //   });
    //   return response.data;
    // } catch (error) {
    //   console.error('Error sending task overdue notification:', error);
    //   throw error;
    // }
  }

  // Gửi thông báo nhắc nhở khi task đã qua 3/4 thời gian mà chưa hoàn thành
  async sendTaskNearDueNotification(taskId: string, taskTitle: string) {
    // try {
    //   const response = await api.post<ApiResponse<any>>('/notification', {
    //     title: 'Task Due Soon',
    //     content: `Your task "${taskTitle}" is 75% through its timeframe and still pending!`,
    //     type: 'task_near_due',
    //     metadata: {
    //       taskId,
    //     },
    //   });
    //   return response.data;
    // } catch (error) {
    //   console.error('Error sending task near due notification:', error);
    //   throw error;
    // }
  }

  // Gửi thông báo nhắc nhở cho task event quá hạn
  async sendTaskEventOverdueNotification(
    taskId: string,
    eventId: string,
    taskTitle: string,
    eventTitle: string
 ) {
  //   try {
  //     const response = await api.post<ApiResponse<any>>('/notification', {
  //       title: 'Event Overdue Reminder',
  //       content: `Your event "${eventTitle}" for task "${taskTitle}" is overdue!`,
  //       type: 'task_event_overdue',
  //       metadata: {
  //         taskId,
  //         eventId,
  //       },
  //     });
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error sending task event overdue notification:', error);
  //     throw error;
  //   }
  }

  // Gửi thông báo nhắc nhở cho event quá hạn (không gắn với task)
  async sendEventOverdueNotification(eventId: string, eventTitle: string) {
    // try {
    //   const response = await api.post<ApiResponse<any>>('/notification', {
    //     title: 'Event Overdue Reminder',
    //     content: `Your event "${eventTitle}" is overdue!`,
    //     type: 'event_overdue',
    //     metadata: {
    //       eventId,
    //     },
    //   });
    //   return response.data;
    // } catch (error) {
    //   console.error('Error sending event overdue notification:', error);
    //   throw error;
    // }
  }

  // Lấy danh sách thông báo của người dùng hiện tại
  async getUserNotifications() {
    // try {
    //   const response = await api.get<ApiResponse<any>>('/notification/user');
    //   return response.data.data?.notifications || [];
    // } catch (error) {
    //   console.error('Error fetching user notifications:', error);
    //   return [];
    // }
  }

  // Đánh dấu thông báo là đã đọc
  async markNotificationAsRead(notificationId: string) {
    // try {
    //   const response = await api.put<ApiResponse<any>>(
    //     `/notification/${notificationId}/read`
    //   );
    //   return response.data;
    // } catch (error) {
    //   console.error('Error marking notification as read:', error);
    //   throw error;
    // }
  }

  // Xóa thông báo
  async deleteNotification(notificationId: string) {
    // try {
    //   const response = await api.delete<ApiResponse<any>>(
    //     `/notification/${notificationId}`
    //   );
    //   return response.data;
    // } catch (error) {
    //   console.error('Error deleting notification:', error);
    //   throw error;
    // }
  }
}

export default new NotificationService();
