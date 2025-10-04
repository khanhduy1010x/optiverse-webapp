import React from 'react';
import View from '../../components/common/View.component';
import Text from '../../components/common/Text.component';
import { useNotificationSettings } from '../../hooks/profile/useNotificationSettings.hook';
import { UpdateNotificationSettingsDto } from '../../types/setting-notify/notification-setting.types';
import { ICONS } from '../../assets/icons';
import { useAppTranslate } from '../../hooks/useAppTranslate';

export default function NotificationSettings() {
  const { settings, isLoading, isUpdating, error, toggleSetting } =
    useNotificationSettings();
  const { t } = useAppTranslate('profile');

  const notificationTypes = [
    {
      key: 'task_notifications' as const,
      label: t('task_notifications'),
      description: t('task_notifications_description'),
      icon: ICONS.task,
    },
    {
      key: 'note_notifications' as const,
      label: t('note_notifications'),
      description: t('note_notifications_description'),
      icon: ICONS.note,
    },
    {
      key: 'flashcard_notifications' as const,
      label: t('flashcard_notifications'),
      description: t('flashcard_notifications_description'),
      icon: ICONS.flashcard,
    },
    {
      key: 'chat_notifications' as const,
      label: t('chat_notifications'),
      description: t('chat_notifications_description'),
      icon: ICONS.message,
    },
    {
      key: 'friend_notifications' as const,
      label: t('friend_notifications'),
      description: t('friend_notifications_description'),
      icon: ICONS.friend,
    },
  ];

  const handleToggle = async (key: keyof UpdateNotificationSettingsDto) => {
    if (isUpdating) return;
    await toggleSetting(key as keyof UpdateNotificationSettingsDto);
  };

  if (isLoading) {
    return (
      <View className="flex items-center justify-center py-8">
        <div className="w-5 h-5 border-2 border-[#21b4ca] border-t-transparent rounded-full animate-spin"></div>
        <Text className="ml-2 text-gray-500 text-sm">{t('loading')}</Text>
      </View>
    );
  }

  return (
    <View className="px-1">
      <View className="mb-4"></View>

      {error && (
        <View className="mb-4">
          <Text className="text-red-700 text-sm">{error}</Text>
        </View>
      )}

      <View className="bg-white overflow-hidden">
        {notificationTypes.map(type => (
          <View
            key={type.key}
            className="flex items-center justify-between py-3.5 border-b border-gray-100"
          >
            <View className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-6 h-6 ml-1">
                <type.icon className="w-[24px] h-[24px] text-[#21b4ca]" />
              </div>
              <span className="text-gray-800 text-[14px] ">{type.label}</span>
            </View>

            <button
              onClick={() => handleToggle(type.key)}
              disabled={isUpdating}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                settings?.[type.key] ? 'bg-[#21b4ca]' : 'bg-gray-200'
              } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200"
                style={{
                  transform: settings?.[type.key]
                    ? 'translateX(20px)'
                    : 'translateX(2px)',
                }}
              />
            </button>
          </View>
        ))}
      </View>

      {isUpdating && (
        <View className="flex items-center justify-center py-3 mt-2">
          <div className="w-4 h-4 border-2 border-[#21b4ca] border-t-transparent rounded-full animate-spin"></div>
        </View>
      )}
    </View>
  );
}
