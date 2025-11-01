import React from 'react';
import { useNavigate } from 'react-router-dom';
import View from '../../components/common/View.component';
import Text from '../../components/common/Text.component';
import { GROUP_CLASSNAMES } from '../../styles/group-class-name.style';
import ProfileSidebar from './ProfileSidebar.component';
import NotificationSettings from './NotificationSettings.screen';
import { useAppTranslate } from '../../hooks/useAppTranslate';

export default function NotificationSettingsPage() {
  const navigate = useNavigate();
  const selectedMenu = 'notifications';
  const { t } = useAppTranslate('profile');

  const handleNavigate = (menu: string, path: string) => {
    navigate(path);
  };

  return (
    <View className="w-full dark:border-gray-700 rounded-lg h-full overflow-hidden">
      {/* Sidebar and Main Content */}
      <View className="flex flex-1 overflow-hidden h-full">
        {/* Sidebar */}
        <ProfileSidebar
          selectedMenu={selectedMenu}
          handleNavigate={handleNavigate}
        />

        {/* Main Content */}
        <View className={GROUP_CLASSNAMES.profileMainContent}>
          <div className="p-8">
            <div className="flex-col items-center">
              <div className=" text-[22px] text-gray-800 text:bold">
                {t('notification_settings')}
              </div>
              <div className="mb-2 text-[14px] text-gray-400  text:bold">
                {'  '}
                {t('auto_send_email_notification')}
              </div>
            </div>

            <hr className="mb-6 border-gray-200" />

            <NotificationSettings />
          </div>
        </View>
      </View>
    </View>
  );
}
