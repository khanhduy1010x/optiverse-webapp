import React from 'react';
import { useTranslation } from 'react-i18next';
import { FriendHeaderProps } from '../../../types/friend/props/component.props';


const FriendHeader: React.FC<FriendHeaderProps> = ({ activeTab, loading, onRefresh }) => {
  const { t } = useTranslation();

  // Xác định tiêu đề và mô tả dựa trên tab hiện tại
  const getHeaderContent = () => {
    switch (activeTab) {
      case 'friends':
        return {
          title: t('All Friends'),
          description: t('Manage your connections with other users')
        };
      case 'pending':
        return {
          title: t('Pending Requests'),
          description: t('Friend requests waiting for your approval')
        };
      case 'sent':
        return {
          title: t('Sent Requests'),
          description: t('Friend requests you have sent to others')
        };
      case 'search':
        return {
          title: t('Search Users'),
          description: t('Find and connect with other users')
        };
      default:
        return {
          title: t('Friend Management'),
          description: t('Manage your social connections')
        };
    }
  };

  const { title, description } = getHeaderContent();

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {title}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? t('Refreshing...') : t('Refresh')}
        </button>
      </div>
      <div className="mt-4 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
    </div>
  );
};

export default FriendHeader; 