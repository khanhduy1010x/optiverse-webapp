import api from './api.service';
import {
  NotificationSettings,
  UpdateNotificationSettingsDto,
} from '../types/setting-notify/notification-setting.types';

class NotificationSettingService {
  private readonly baseUrl = 'notification/notification-settings';

  async getUserSettings(): Promise<NotificationSettings> {
    const response = await api.get(`${this.baseUrl}`);
    return response.data.data;
  }

  async updateUserSettings(
    settings: UpdateNotificationSettingsDto
  ): Promise<NotificationSettings> {
    const response = await api.put(`${this.baseUrl}`, settings);
    return response.data.data;
  }
}

export const notificationSettingService = new NotificationSettingService();
