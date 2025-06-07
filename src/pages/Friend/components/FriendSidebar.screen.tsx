import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/common/Icon/Icon.component';
import NavButton from '../../../components/common/Button/NavButton';
import { FriendSidebarProps, SidebarItem } from '../../../types/friend/props/component.props';
import { IconName } from '../../../assets/icons';
import { GROUP_CLASSNAMES } from '../../../styles/group-class-name.style';

const FriendSidebar: React.FC<FriendSidebarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
}) => {
  const { t } = useTranslation();

  const sidebarItems: SidebarItem[] = [
    { key: 'friends', label: t('All Friends'), icon: 'group' as IconName, path: 'friends' },
    { key: 'pending', label: t('Pending Requests'), icon: 'clock' as IconName, path: 'pending' },
    { key: 'sent', label: t('Sent Requests'), icon: 'arrow' as IconName, path: 'sent' },
    { key: 'search', label: t('Search Users'), icon: 'search' as IconName, path: 'search' },
  ];

  return (
    <div className={GROUP_CLASSNAMES.sidebarContainer}>
      {/* User info */}
      {currentUser && (
        <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex flex-col items-center">
            <div className={GROUP_CLASSNAMES.avatarSmall}>
              {currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-white">{(currentUser as any).full_name || currentUser.email}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">{currentUser.email}</p>
            <div className="mt-3 w-full pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">{t('Manage your friend connections')}</p>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200 px-2">{t('Friend Management')}</h2>
      <div className="flex-1 space-y-3">
        {sidebarItems.map((item) => (
          <NavButton
            key={item.key}
            label={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Icon
                    name={item.icon}
                    size={24}
                    transparent={true}
                    className="text-gray-600 dark:text-gray-300"
                  />
                  <span className="text-gray-800 dark:text-gray-200 font-semibold text-sm tracking-wide">
                    {item.label}
                  </span>
                </div>
              </div>
            }
            isActive={activeTab === item.path}
            onClick={() => onTabChange(item.path)}
            className={`w-full py-3 px-4 rounded-xl transition-all duration-300 ease-in-out ${activeTab === item.path
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
          />
        ))}
      </div>
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <p>{t('Optiverse Friend System')}</p>
          <p className="mt-1">© {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default FriendSidebar; 