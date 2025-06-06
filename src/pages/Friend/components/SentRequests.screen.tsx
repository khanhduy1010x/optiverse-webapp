import React from 'react';
import { useTranslation } from 'react-i18next';
import { SentRequestsProps } from '../../../types/friend/props/component.props';
import { Friend } from '../../../types/friend/response/friend.response';



const SentRequests: React.FC<SentRequestsProps> = ({
  sentRequests,
  loading,
  onCancelRequest,
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

  if (sentRequests.length === 0) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-8 text-center border border-purple-100 dark:border-gray-700">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 text-white mb-6 shadow-md">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">{t('No sent requests')}</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-base">
          {t('You have not sent any friend requests yet. Use the search function to find and connect with other users.')}
        </p>
        <button
          className="mt-6 px-5 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-full font-medium hover:from-purple-600 hover:to-violet-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center mx-auto"
          onClick={() => document.querySelector('[data-tab="search"]')?.dispatchEvent(new Event('click'))}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {t('Search for friends')}
        </button>
      </div>
    );
  }

  // Nhóm các yêu cầu theo trạng thái
  const groupedRequests: Record<string, Friend[]> = sentRequests.reduce((acc, request) => {
    const status = request.status || 'pending';
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(request);
    return acc;
  }, {} as Record<string, Friend[]>);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center text-white mr-3 shadow-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <p className="text-lg font-bold text-gray-700 dark:text-gray-200">
            {t('Total')}: <span className="text-purple-600 dark:text-purple-400">{sentRequests.length}</span> {t('sent requests')}
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          {t('Last updated')}: <span className="font-medium">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedRequests).map(([status, requests]) => (
          <div key={status} className="space-y-4">
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 capitalize border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${status === 'pending'
                ? 'bg-yellow-400 dark:bg-yellow-500'
                : status === 'accepted'
                  ? 'bg-green-400 dark:bg-green-500'
                  : 'bg-red-400 dark:bg-red-500'
                }`}></span>
              {t(status)} ({requests.length})
            </h3>
            <div className="space-y-4">
              {requests.map((request: Friend) => {
                // Lấy chữ cái đầu tiên từ tên hoặc email
                const initial = request.friendInfo?.full_name
                  ? request.friendInfo.full_name.charAt(0).toUpperCase()
                  : request.friendInfo?.email?.charAt(0).toUpperCase() || request.friend_id.charAt(0).toUpperCase();

                // Lấy màu dựa trên ID
                const gradientClass = getColorFromString(request.friend_id);

                return (
                  <div
                    key={request._id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 border border-gray-100 dark:border-gray-700 overflow-hidden group"
                  >
                    <div className="h-2 bg-gradient-to-r w-full group-hover:scale-105 transition-transform duration-300 ease-out" style={{ backgroundImage: `linear-gradient(to right, #a855f7, #8b5cf6)` }}></div>
                    <div className="p-5 flex items-start justify-between">
                      <div className="flex items-center">
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white text-2xl font-bold mr-4 shadow-md transform transition-transform group-hover:scale-105`}>
                          {initial}
                        </div>
                        <div>
                          <div className="font-medium text-lg text-gray-900 dark:text-white flex items-center">
                            <svg className="w-4 h-4 mr-1 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                            {t('To')}
                          </div>
                          {request.friendInfo ? (
                            <div className="mt-1 ml-2">
                              {request.friendInfo.full_name && (
                                <div className="font-medium text-base text-gray-800 dark:text-white">{request.friendInfo.full_name}</div>
                              )}
                              {request.friendInfo.email && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  {request.friendInfo.email}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="mt-1 ml-2">
                              {renderUserInfo(request.friend_id)}
                            </div>
                          )}
                          <div className="flex items-center mt-2 flex-wrap gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : status === 'accepted'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                              {status === 'pending' && (
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                              {status === 'accepted' && (
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              {t(status)}
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
                      {status === 'pending' && (
                        <div>
                          <button
                            onClick={() => onCancelRequest(request._id)}
                            className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-200 flex items-center gap-1 border border-gray-200 dark:border-gray-600 shadow-sm group-hover:shadow-md"
                            disabled={loading}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {t('Cancel')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SentRequests; 