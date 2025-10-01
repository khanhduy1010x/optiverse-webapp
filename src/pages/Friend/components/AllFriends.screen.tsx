import React, { useState } from 'react';
import { AllFriendsProps } from '../../../types/friend/props/component.props';
import { GROUP_CLASSNAMES } from '../../../styles/group-class-name.style';
import { useAllFriend } from '../../../hooks/friend/useAllFriend.hook';
import { useAppTranslate } from '../../../hooks/useAppTranslate';

const AllFriends: React.FC<AllFriendsProps> = ({
  friends,
  loading,
  onRemoveFriend,
  renderUserInfo,
  onRefresh,
  onStartChat,
}) => {
  const { t } = useAppTranslate('friend');
  const { getColorFromString, totalFriends, hasNoFriends } = useAllFriend({
    friends,
    loading,
  });
  const [startingChatWith, setStartingChatWith] = useState<string | null>(null);

  const handleStartChat = async (friendId: string) => {
    if (startingChatWith) return; // Prevent multiple clicks
    
    setStartingChatWith(friendId);
    try {
      await onStartChat?.(friendId);
    } finally {
      // Reset loading state after a short delay to prevent flashing
      setTimeout(() => setStartingChatWith(null), 500);
    }
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
              <div className="rounded-full bg-gray-200 h-16 w-16"></div>
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

  if (hasNoFriends) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {t('no_friends_yet')}
        </h3>
        <p className="text-gray-500 mb-6">{t('no_friends_description')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {friends.map(friend => {
        const initial =
          friend.friendInfo?.full_name?.[0]?.toUpperCase() ||
          friend.friendInfo?.email?.[0]?.toUpperCase() ||
          friend.friend_id[0]?.toUpperCase();

        return (
          <div
            key={friend._id}
            className={`bg-white rounded-lg p-5 shadow-sm border border-gray-200 transition-all hover:shadow-md ${
              startingChatWith === friend.friend_id ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
            }`}
            onClick={() => !startingChatWith && handleStartChat(friend.friend_id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {friend.friendInfo?.avatar_url ? (
                  <img
                    src={friend.friendInfo.avatar_url}
                    alt={friend.friendInfo.full_name || t('friend')}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                    onError={e => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff`;
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-2xl font-medium mr-4">
                    {initial}
                  </div>
                )}
                <div>
                  {friend.friendInfo ? (
                    <div className="flex flex-col">
                      {friend.friendInfo.full_name && (
                        <span className="font-semibold text-lg text-gray-800">
                          {friend.friendInfo.full_name}
                        </span>
                      )}
                      {friend.friendInfo.email && (
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
                          {friend.friendInfo.email}
                        </span>
                      )}
                    </div>
                  ) : (
                    renderUserInfo(friend.friend_id)
                  )}

                  <button
                    className={`mt-2 inline-flex items-center text-sm transition-all ${
                      startingChatWith === friend.friend_id
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-600 hover:text-blue-800'
                    }`}
                    onClick={e => {
                      e.stopPropagation();
                      handleStartChat(friend.friend_id);
                    }}
                    disabled={startingChatWith === friend.friend_id}
                  >
                    {startingChatWith === friend.friend_id ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 mr-1"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {t('starting')}...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                        {t('start_conversation')}
                      </>
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={e => {
                  e.stopPropagation();
                  onRemoveFriend(friend._id);
                }}
                className="p-2 bg-white text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-gray-200"
                title={t('remove_friend')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AllFriends;
