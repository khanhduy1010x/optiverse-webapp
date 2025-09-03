import React from 'react';
import { useAppTranslate } from '../../../hooks/useAppTranslate';
import { SentRequestsProps } from '../../../types/friend/props/component.props';
import { Friend } from '../../../types/friend/response/friend.response';
import { GROUP_CLASSNAMES } from '../../../styles/group-class-name.style';

const SentRequests: React.FC<SentRequestsProps> = ({
  sentRequests,
  loading,
  onCancelRequest,
  renderUserInfo,
}) => {
  const { t } = useAppTranslate('friend');

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="bg-white rounded-lg p-5 shadow-sm border border-gray-200"
          >
            <div className="animate-pulse flex items-center space-x-4">
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

  if (sentRequests.length === 0) {
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
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {t('no_sent_requests')}
        </h3>
        <p className="text-gray-500 mb-6">
          {t('no_sent_requests_description')}
        </p>
      </div>
    );
  }

  // Nhóm các yêu cầu theo trạng thái
  const groupedRequests: Record<string, Friend[]> = sentRequests.reduce(
    (acc, request) => {
      const status = request.status || 'pending';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(request);
      return acc;
    },
    {} as Record<string, Friend[]>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#21b4ca] flex items-center justify-center text-white mr-3 shadow-sm">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </div>
          <p className="text-lg font-bold text-gray-700">
            {t('total')}:{' '}
            <span className="text-[#21b4ca]">{sentRequests.length}</span>{' '}
            {t('sent_requests')}
          </p>
        </div>
        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {t('last_updated')}:{' '}
          <span className="font-medium">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedRequests).map(([status, requests]) => (
          <div key={status} className="space-y-4">
            <h3 className="text-md font-semibold text-gray-700 capitalize border-b border-gray-200 pb-2 flex items-center">
              <span
                className={`w-3 h-3 rounded-full mr-2 ${
                  status === 'pending'
                    ? 'bg-yellow-400'
                    : status === 'accepted'
                      ? 'bg-green-400'
                      : 'bg-red-400'
                }`}
              ></span>
              {t(status)} ({requests.length})
            </h3>
            <div className="space-y-4">
              {requests.map((request: Friend) => {
                // Lấy chữ cái đầu tiên từ tên hoặc email
                const initial = request.friendInfo?.full_name
                  ? request.friendInfo.full_name.charAt(0).toUpperCase()
                  : request.friendInfo?.email?.charAt(0).toUpperCase() ||
                    request.friend_id.charAt(0).toUpperCase();

                return (
                  <div
                    key={request._id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group"
                  >
                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center">
                        {request.friendInfo?.avatar_url ? (
                          <img
                            src={request.friendInfo.avatar_url}
                            alt={request.friendInfo.full_name || 'Friend'}
                            className="w-16 h-16 rounded-lg object-cover mr-4 shadow-sm"
                            onError={e => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff`;
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-[#21b4ca] flex items-center justify-center text-white text-2xl font-bold mr-4 shadow-sm">
                            {initial}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-lg text-gray-900 flex items-center">
                            <svg
                              className="w-4 h-4 mr-1 text-[#21b4ca]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 5l7 7-7 7M5 5l7 7-7 7"
                              />
                            </svg>
                            {t('to')}
                          </div>
                          {request.friendInfo ? (
                            <div className="mt-1 ml-2">
                              {request.friendInfo.full_name && (
                                <div className="font-medium text-base text-gray-800">
                                  {request.friendInfo.full_name}
                                </div>
                              )}
                              {request.friendInfo.email && (
                                <div className="text-sm text-gray-500 flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
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
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : status === 'accepted'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {status === 'pending' && (
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              )}
                              {status === 'accepted' && (
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                              {t(status)}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              {new Date(
                                request.createdAt || Date.now()
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {status === 'pending' && (
                        <div>
                          <button
                            onClick={() => onCancelRequest(request._id)}
                            className="px-4 py-2 bg-[#607D8B] text-white rounded-lg hover:bg-red-500 transition-all duration-200 cursor-pointer flex items-center gap-2"
                            disabled={loading}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            {t('cancel')}
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
