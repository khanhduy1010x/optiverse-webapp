import React from 'react';
import { useAppTranslate } from '../../../hooks/useAppTranslate';
import { GROUP_CLASSNAMES } from '../../../styles/group-class-name.style';
import { PendingRequestsProps } from '../../../types/friend/props/component.props';

const PendingRequests: React.FC<PendingRequestsProps> = ({
  pendingRequests,
  loading,
  onAcceptFriend,
  renderUserInfo,
}) => {
  const { t } = useAppTranslate('friend');

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
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="bg-white rounded-lg p-5 shadow-sm border border-gray-200"
          >
            <div className="flex items-center space-x-4 animate-pulse">
              <div className="rounded-lg bg-gray-200 h-16 w-16"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
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
      <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-500 mb-4">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {t('no_pending_requests')}
        </h3>
        <p className="text-gray-500 mb-6">
          {t('no_pending_requests_description')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {pendingRequests.map(request => {
        const initial =
          request.friendInfo?.full_name?.[0]?.toUpperCase() ||
          request.friendInfo?.email?.[0]?.toUpperCase() ||
          request.user_id[0]?.toUpperCase();

        return (
          <div
            key={request._id}
            className="bg-white rounded-lg p-5 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {request.friendInfo?.avatar_url ? (
                  <img
                    src={request.friendInfo.avatar_url}
                    alt={request.friendInfo.full_name || t('user')}
                    className="w-16 h-16 rounded-lg object-cover mr-4 shadow-sm"
                    onError={e => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff`;
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-[#21b4ca] flex items-center justify-center text-white text-2xl font-medium mr-4 shadow-sm">
                    {initial}
                  </div>
                )}
                <div>
                  {request.friendInfo ? (
                    <div className="flex flex-col">
                      {request.friendInfo.full_name && (
                        <span className="font-semibold text-lg text-gray-800">
                          {request.friendInfo.full_name}
                        </span>
                      )}
                      {request.friendInfo.email && (
                        <span className="text-sm text-gray-500 flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          {request.friendInfo.email}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="font-medium text-lg text-gray-800">
                      {renderUserInfo(request.user_id)}
                    </div>
                  )}
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {t('pending')}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onAcceptFriend(request._id)}
                className="px-4 py-2 bg-[#21b4ca] text-white rounded-lg hover:bg-[#1c9eb1] transition-colors duration-300 flex items-center gap-2 cursor-pointer"
                disabled={loading}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {t('accept')}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PendingRequests;
