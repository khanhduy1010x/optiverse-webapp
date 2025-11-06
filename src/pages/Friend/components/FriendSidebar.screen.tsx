import React from 'react';
import View from '../../../components/common/View.component';
import {
  FriendSidebarProps,
  SidebarItem,
} from '../../../types/friend/props/component.props';
import { IconName } from '../../../assets/icons';
import { GROUP_CLASSNAMES } from '../../../styles/group-class-name.style';
import Icon from '../../../components/common/Icon/Icon.component';
import { useAppTranslate } from '../../../hooks/useAppTranslate';

const FriendSidebar: React.FC<FriendSidebarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
}) => {
  const { t } = useAppTranslate('friend');

  const sidebarItems: SidebarItem[] = [
    {
      key: 'friends',
      label: t('all_friends'),
      icon: 'group' as IconName,
      path: 'friends',
    },
    {
      key: 'pending',
      label: t('pending_requests'),
      icon: 'clock' as IconName,
      path: 'pending',
    },
    {
      key: 'sent',
      label: t('sent_requests'),
      icon: 'arrow' as IconName,
      path: 'sent',
    },
    {
      key: 'suggestions',
      label: t('friend_suggestions'),
      icon: 'star' as IconName,
      path: 'suggestions',
    },
    {
      key: 'search',
      label: t('search_users'),
      icon: 'search' as IconName,
      path: 'search',
    },
  ];

  return (
    <View className="w-64 border-r border-gray-200">
      <div className="h-full flex flex-col">
        {/* Header section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {t('friends_title')}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t('manage_connections_description')}
          </p>
        </div>

        {/* User info - Simplified */}
        {currentUser && (
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {currentUser.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={(currentUser as any).full_name || currentUser.email}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={e => {
                    e.currentTarget.onerror = null;
                    const initial = currentUser.email
                      ? currentUser.email.charAt(0).toUpperCase()
                      : 'U';
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${initial}&background=21b4ca&color=fff`;
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#21b4ca] flex items-center justify-center text-white font-medium">
                  {currentUser.email
                    ? currentUser.email.charAt(0).toUpperCase()
                    : 'U'}
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-800">
                  {(currentUser as any).full_name || currentUser.email}
                </h3>
                <p className="text-xs text-gray-500">{currentUser.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation items - Centered with proper spacing */}
        <div className="flex-1 flex flex-col pt-10 px-6 space-y-4">
          {sidebarItems.map(item => (
            <button
              key={item.key}
              onClick={() => onTabChange(item.path)}
              className={`
                px-6 py-3 rounded-lg text-left cursor-pointer transition-all duration-200 flex items-center
                ${
                  activeTab === item.path
                    ? 'bg-[#e7f6f7] text-[#21b4ca]'
                    : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Icon
                name={item.icon || 'home'}
                size={18}
                className={`mr-3 ${activeTab === item.path ? 'text-[#21b4ca]' : 'text-gray-500'}`}
              />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Footer section */}
        <div className="p-6 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>{t('optiverse_friend_system')}</p>
            <p className="mt-1">© {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </View>
  );
};

export default FriendSidebar;
