import { useState, useEffect } from 'react';
import { notificationSettingService } from '../../services/notification-setting.service';
import {
  NotificationSettings,
  UpdateNotificationSettingsDto,
} from '../../types/setting-notify/notification-setting.types';
import { useAppSelector } from '../../store/hooks';

export const useNotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = useAppSelector(state => state.auth.user);

  const fetchSettings = async () => {
    if (!user?._id) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await notificationSettingService.getUserSettings();
      setSettings(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Không thể tải cài đặt thông báo'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (updateData: UpdateNotificationSettingsDto) => {
    if (!user?._id) return;

    setIsUpdating(true);
    setError(null);

    try {
      const updatedSettings =
        await notificationSettingService.updateUserSettings(updateData);
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Không thể cập nhật cài đặt thông báo'
      );
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleSetting = async (
    settingKey: keyof UpdateNotificationSettingsDto
  ) => {
    if (!settings) return;

    const newValue = !settings[settingKey];
    const updateData = { [settingKey]: newValue };

    try {
      await updateSettings(updateData);
    } catch (err) {
      // Error đã được xử lý trong updateSettings
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user?._id]);

  return {
    settings,
    isLoading,
    isUpdating,
    error,
    fetchSettings,
    updateSettings,
    toggleSetting,
  };
};
