import React from 'react';
import { useTranslation } from 'react-i18next';

interface FriendUserInfo {
  email?: string;
  full_name?: string;
  avatar_url?: string;
}

interface Friend {
  _id: string;
  user_id: string;
  friend_id: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  friendInfo?: FriendUserInfo;
}

interface PendingRequestsProps {
  pendingRequests: Friend[];
  loading: boolean;
  onAcceptFriend: (id: string) => void;
  renderUserInfo: (userId: string, showId?: boolean) => React.ReactNode;
}

const PendingRequests: React.FC<PendingRequestsProps> = ({ 
  pendingRequests, 
  loading, 
  onAcceptFriend, 
  renderUserInfo 
}) => {
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
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md">
            <div className="animate-pulse flex items-center space-x-4">
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

  if (pendingRequests.length === 0) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-8 text-center border border-yellow-100 dark:border-gray-700">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white mb-6 shadow-md">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">{t('No pending requests')}</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-base">
          {t('You have no pending friend requests at the moment. When someone adds you as a friend, you will see their request here.')}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center text-white mr-3 shadow-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <p className="text-lg font-bold text-gray-700 dark:text-gray-200">
            {t('Total')}: <span className="text-yellow-600 dark:text-yellow-400">{pendingRequests.length}</span> {t('pending requests')}
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          {t('Last updated')}: <span className="font-medium">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {pendingRequests.map((request) => {
          // Lấy chữ cái đầu tiên từ tên hoặc email
          const initial = request.friendInfo?.full_name 
            ? request.friendInfo.full_name.charAt(0).toUpperCase() 
            : request.friendInfo?.email?.charAt(0).toUpperCase() || request.user_id.charAt(0).toUpperCase();
          
          // Lấy màu dựa trên ID
          const gradientClass = getColorFromString(request.user_id);
          
          return (
            <div
              key={request._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 border border-gray-100 dark:border-gray-700 overflow-hidden group"
            >
              <div className="h-2 bg-gradient-to-r w-full group-hover:scale-105 transition-transform duration-300 ease-out" style={{backgroundImage: `linear-gradient(to right, #eab308, #f59e0b)`}}></div>
              <div className="p-5 flex items-start justify-between">
                <div className="flex items-center">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white text-2xl font-bold mr-4 shadow-md transform transition-transform group-hover:scale-105`}>
                    {initial}
                  </div>
                  <div>
                    {request.friendInfo ? (
                      <div className="flex flex-col">
                        {request.friendInfo.full_name && (
                          <span className="font-semibold text-lg text-gray-800 dark:text-white">{request.friendInfo.full_name}</span>
                        )}
                        {request.friendInfo.email && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {request.friendInfo.email}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="font-medium text-lg text-gray-900 dark:text-white">
                        {renderUserInfo(request.user_id)}
                      </div>
                    )}
                    <div className="flex items-center mt-2 flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t('Pending')}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(request.createdAt || Date.now()).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => onAcceptFriend(request._id)}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-1 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    disabled={loading}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('Accept')}
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

export default PendingRequests; 