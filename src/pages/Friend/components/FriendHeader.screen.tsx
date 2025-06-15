import React from 'react';
import { FriendHeaderProps } from '../../../types/friend/props/component.props';
import { useTranslation } from 'react-i18next';

const FriendHeader: React.FC<FriendHeaderProps> = ({
  activeTab,
  loading,
  onRefresh,
}) => {
  const { t } = useTranslation();

  // Map tab keys to display titles
  const tabTitles: Record<string, string> = {
    friends: t('All Friends'),
    pending: t('Pending Requests'),
    sent: t('Sent Requests'),
    search: t('Search Users'),
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {tabTitles[activeTab] || t('Friend Management')}
        </h1>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 bg-[#21b4ca] text-white rounded-lg hover:bg-[#1c9eb1] transition-colors duration-300 flex items-center gap-2 disabled:opacity-50"
        >
          <svg
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {loading ? t('Refreshing...') : t('Refresh')}
        </button>
      </div>
      <p className="text-gray-500 mt-1">
        {activeTab === 'friends' && t('View and manage your friend connections')}
        {activeTab === 'pending' && t('Accept or decline friend requests')}
        {activeTab === 'sent' && t('View and manage your sent friend requests')}
        {activeTab === 'search' && t('Search for users to add as friends')}
      </p>
      <div className="h-1 bg-gray-200 mt-4"></div>
    </div>
  );
};

export default FriendHeader; 