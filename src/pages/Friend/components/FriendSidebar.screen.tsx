import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/common/Icon/Icon.component';
import NavButton from '../../../components/common/Button/NavButton';
import { IconName } from '../../../assets/icons/index';

interface FriendSidebarProps {
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  currentUser: any;
}

interface SidebarItem {
  key: string;
  label: string;
  icon: IconName;
  path: string;
}

const FriendSidebar: React.FC<FriendSidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  currentUser,
}) => {
  const { t } = useTranslation();

  const sidebarItems: SidebarItem[] = [
    { key: 'friends', label: t('All Friends'), icon: 'group', path: 'friends' },
    { key: 'pending', label: t('Pending Requests'), icon: 'clock', path: 'pending' },
    { key: 'sent', label: t('Sent Requests'), icon: 'arrow', path: 'sent' },
    { key: 'search', label: t('Search Users'), icon: 'search', path: 'search' },
  ];

  return (
    <div className="w-72 border-r border-gray-200 dark:border-gray-700 p-5 flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-lg">
      {/* User info */}
      {currentUser && (
        <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-md">
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
            className={`w-full py-3 px-4 rounded-xl transition-all duration-300 ease-in-out ${
              activeTab === item.path
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