import React from 'react';
import { useTranslation } from 'react-i18next';
import { AllFriendsProps } from '../../../types/friend/props/component.props';
import { GROUP_CLASSNAMES } from '../../../styles/group-class-name.style';


const AllFriends: React.FC<AllFriendsProps> = ({ friends, loading, onRemoveFriend, renderUserInfo }) => {
  const { t } = useTranslation();

  // Hàm tạo màu gradient cho avatar dựa trên chuỗi
  const getColorFromString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = hash % 360;
    const hue2 = (hash + 120) % 360;
    return `from-[hsl(${hue1},70%,60%)] to-[hsl(${hue2},70%,45%)]`;
  };

  if (loading) {
    return (
      <div className={GROUP_CLASSNAMES.flexColGap}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md">
            <div className={GROUP_CLASSNAMES.animatePulse}>
              <div className="rounded-full bg-gray-300 dark:bg-gray-600 h-16 w-16"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-8 text-center border border-blue-100 dark:border-gray-700">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white mb-6 shadow-md">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">{t('No friends yet')}</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-base">
          {t('You have not added any friends yet. Use the search function to find and connect with other users.')}
        </p>
        <button
          className="mt-6 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center mx-auto"
          onClick={() => document.querySelector('[data-tab="search"]')?.dispatchEvent(new Event('click'))}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {t('Find new friends')}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className={GROUP_CLASSNAMES.flexJustifyBetween + " mb-6"}>
        <div className={GROUP_CLASSNAMES.flexItemsCenter}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white mr-3 shadow-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-lg font-bold text-gray-700 dark:text-gray-200">
            {t('Total')}: <span className="text-blue-600 dark:text-blue-400">{friends.length}</span> {t('friends')}
          </p>
        </div>
        <div className={GROUP_CLASSNAMES.statusIndicator}>
          {t('Last updated')}: <span className="font-medium">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className={GROUP_CLASSNAMES.gridResponsive}>
        {friends.map((friend) => {
          // Lấy chữ cái đầu tiên từ tên hoặc email
          const initial = friend.friendInfo?.full_name
            ? friend.friendInfo.full_name.charAt(0).toUpperCase()
            : friend.friendInfo?.email?.charAt(0).toUpperCase() || friend.friend_id.charAt(0).toUpperCase();

          // Lấy màu dựa trên ID
          const gradientClass = getColorFromString(friend.friend_id);

          return (
            <div
              key={friend._id}
              className={GROUP_CLASSNAMES.cardContainer}
            >
              <div className={GROUP_CLASSNAMES.transitionTransform + " h-2 bg-gradient-to-r w-full group-hover:scale-105"} style={{ backgroundImage: `linear-gradient(to right, #3b82f6, #8b5cf6)` }}></div>
              <div className="p-5 flex items-start justify-between">
                <div className={GROUP_CLASSNAMES.flexItemsCenter}>
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white text-2xl font-bold mr-4 shadow-md transform transition-transform group-hover:scale-105`}>
                    {initial}
                  </div>
                  <div>
                    {friend.friendInfo ? (
                      <div className="flex flex-col">
                        {friend.friendInfo.full_name && (
                          <span className="font-semibold text-lg text-gray-800 dark:text-white">{friend.friendInfo.full_name}</span>
                        )}
                        {friend.friendInfo.email && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {friend.friendInfo.email}
                          </span>
                        )}
                      </div>
                    ) : (
                      renderUserInfo(friend.friend_id)
                    )}
                    <div className={GROUP_CLASSNAMES.flexItemsCenter + " mt-2"}>
                      <span className={GROUP_CLASSNAMES.badgeSuccess + " mr-2"}>
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {t('Connected')}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(friend.createdAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => onRemoveFriend(friend._id)}
                    className={GROUP_CLASSNAMES.buttonRemoveFriend}
                    disabled={loading}
                    title={t('Remove friend')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AllFriends; 